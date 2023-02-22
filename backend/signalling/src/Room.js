import { mediasoup } from './config.js';
import Logger from './Logger.js';
const log = new Logger('Room');

export default class Room {
  constructor(room_id, worker, io) {
    this.id = room_id;
    this.worker = worker;
    this.router = null;
    this.audioLevelObserver = null;
    this.audioLevelObserverEnabled = true;
    this.audioLastUpdateTime = 0;
    this.io = io;
    this.host = null;
    this.peers = new Map();
    this.createTheRouter();
  }

  // Router
  createTheRouter() {
    const { mediaCodecs } = mediasoup.router;
    this.worker
      .createRouter({
        mediaCodecs
      })
      .then(
        function (router) {
          this.router = router;
          if (this.audioLevelObserverEnabled) {
            this.startAudioLevelObservation(router);
          }
        }.bind(this)
      );
  }

  setHost(hostId) {
    this.host = hostId;
  }

  getHost() {
    return this.host;
  }

  isExist(socket_id) {
    let isExist = false;
    this.peers.forEach((peer) => {
      if (peer.id == socket_id) isExist = true;
    });
    return isExist;
  }

  // Audio Level
  async startAudioLevelObservation(router) {
    log.debug('Start audioLevelObserver for signaling active speaker...');

    this.audioLevelObserver = await router.createAudioLevelObserver({
      maxEntries: 1,
      threshold: -70,
      interval: 1000
    });

    this.audioLevelObserver.on('volumes', (volumes) => {
      this.sendActiveSpeakerVolume(volumes);
    });
    this.audioLevelObserver.on('silence', () => {
      return;
    });
  }

  sendActiveSpeakerVolume(volumes) {
    if (Date.now() > this.audioLastUpdateTime + 1000) {
      this.audioLastUpdateTime = Date.now();
      const { producer, volume } = volumes[0];
      let audioVolume = Math.round(Math.pow(10, volume / 70) * 10); // 1-10
      if (audioVolume > 2) {
        this.peers.forEach((peer) => {
          peer.producers.forEach((peerProducer) => {
            if (
              producer.id === peerProducer.id &&
              peerProducer.kind == 'audio' &&
              peer.peer_audio === true
            ) {
              let data = { peer_name: peer.peer_name, peer_id: peer.id, audioVolume: audioVolume };
              this.broadCast(0, 'audioVolume', data);
            }
          });
        });
      }
    }
  }

  addProducerToAudioLevelObserver(producer) {
    if (this.audioLevelObserverEnabled) {
      this.audioLevelObserver.addProducer(producer);
    }
  }

  getRtpCapabilities() {
    return this.router.rtpCapabilities;
  }

  // Peer
  addPeer(peer) {
    this.peers.set(peer.id, peer);
    log.log(this.peers);
  }

  getPeers() {
    return this.peers;
  }

  getPeersCount() {
    return this.peers.size;
  }

  toJson() {
    let peerList = [];
    this.peers.forEach((peer) => {
      const { id, peer_info, producers } = peer;
      const producerList = [];
      producers.forEach((key, value) => {
        producerList.push(value);
      });
      peerList.push({
        id,
        peer_info,
        producers: producerList
      });
    });

    return {
      id: this.id,
      peers: peerList
    };
  }

  getProducerListForPeer() {
    let producerList = [];
    this.peers.forEach((peer) => {
      peer.producers.forEach((producer) => {
        producerList.push({
          id: peer.id,
          producer_id: producer.id,
          peer_info: peer.peer_info,
          type: producer.appData.mediaType
        });
      });
    });
    return producerList;
  }

  async connectPeerTransport(socket_id, transport_id, dtlsParameters) {
    if (!this.peers.has(socket_id)) return;
    await this.peers.get(socket_id).connectTransport(transport_id, dtlsParameters);
  }

  async removePeer(socket_id) {
    // this.peers.get(socket_id).close();
    this.peers.delete(socket_id);
  }

  // WebRTC Transport
  async createWebRtcTransport(socket_id) {
    const { maxIncomingBitrate, initialAvailableOutgoingBitrate, listenIps } =
      mediasoup.webRtcTransport;

    const transport = await this.router.createWebRtcTransport({
      listenIps: listenIps,
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
      initialAvailableOutgoingBitrate
    });

    if (maxIncomingBitrate) {
      try {
        await transport.setMaxIncomingBitrate(maxIncomingBitrate);
      } catch (error) {}
    }

    transport.on(
      'dtlsstatechange',
      function (dtlsState) {
        if (dtlsState === 'closed') {
          log.debug('Transport close', { peer_name: this.peers.get(socket_id).peer_name });
          transport.close();
        }
      }.bind(this)
    );

    transport.on('close', () => {
      log.debug('Transport close', { peer_name: this.peers.get(socket_id).peer_name });
    });

    log.debug('Adding transport', { transportId: transport.id });
    this.peers.get(socket_id).addTransport(transport);
    return {
      params: {
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters
      }
    };
  }

  // Producer
  async produce(socket_id, producerTransportId, rtpParameters, kind, type) {
    return new Promise(
      async function (resolve, reject) {
        let producer = await this.peers
          .get(socket_id)
          .createProducer(producerTransportId, rtpParameters, kind, type);
        resolve(producer.id);
        this.broadCast(socket_id, 'newProducers', [
          {
            producer_id: producer.id,
            id: socket_id,
            peer_name: this.peers.get(socket_id).peer_name,
            peer_info: this.peers.get(socket_id).peer_info,
            type: type
          }
        ]);
      }.bind(this)
    );
  }

  // Consumer
  async consume(socket_id, consumer_transport_id, producer_id, rtpCapabilities) {
    if (
      !this.router.canConsume({
        producerId: producer_id,
        rtpCapabilities
      })
    ) {
      return log.error('Can not consume', {
        socket_id: socket_id,
        consumer_transport_id: consumer_transport_id,
        producer_id: producer_id
      });
    }

    let { consumer, params } = await this.peers
      .get(socket_id)
      .createConsumer(consumer_transport_id, producer_id, rtpCapabilities);

    consumer.on(
      'producerclose',
      function () {
        log.debug('Consumer closed due to producerclose event', {
          peer_name: this.peers.get(socket_id).peer_name,
          consumer_id: consumer.id
        });
        this.peers.get(socket_id).removeConsumer(consumer.id);

        // tell client consumer is dead
        this.io.to(socket_id).emit('consumerClosed', {
          consumer_id: consumer.id,
          consumer_kind: consumer.kind
        });
      }.bind(this)
    );

    return params;
  }

  closeProducer(socket_id, producer_id) {
    this.peers.get(socket_id).closeProducer(producer_id);
  }

  // Send to all peers
  broadCast(socket_id, action, data) {
    for (let otherID of Array.from(this.peers.keys()).filter((id) => id !== socket_id)) {
      this.send(otherID, action, data);
    }
  }

  sendTo(socket_id, action, data) {
    for (let peer_id of Array.from(this.peers.keys()).filter((id) => id === socket_id)) {
      this.send(peer_id, action, data);
    }
  }

  send(socket_id, action, data) {
    this.io.to(socket_id).emit(action, data);
  }
}
