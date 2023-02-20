import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { createServer } from 'httpolyglot';
import { version } from 'mediasoup';
import { version as _version } from 'mediasoup-client';
import { get } from 'http';
import {
  sslKey,
  hostCfg,
  sslCrt,
  listenPort,
  logo,
  sentry,
  createWorkers,
  getMediasoupWorker,
  mediasoup as _mediasoup
} from './config.js';
import { join as _join } from 'path';
import { readFileSync } from 'fs';
import Room from './Room.js';
import Peer from './Peer.js';
import Logger from './Logger.js';
import { Server } from 'socket.io';
import { init } from '@sentry/node';
import { CaptureConsole } from '@sentry/integrations';
import path from 'path';
import router from '../controller/index.js';

const log = new Logger('Server');
const __dirname = path.resolve();
const app = express();

const options = {
  key: readFileSync(_join(__dirname, sslKey), 'utf-8'),
  cert: readFileSync(_join(__dirname, sslCrt), 'utf-8')
};

const httpServer = createServer(options, app);

const io = new Server(httpServer, {
  maxHttpBufferSize: 1e7,
  transports: ['websocket'],
  cors: {
    origin: 'http://localhost:3000'
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true
});
const host = 'https://' + 'localhost' + ':' + listenPort; // host url
const apiBasePath = '/api/v1'; // API base path
const api_docs = host + apiBasePath + '/docs'; // API docs

// Sentry monitoring
const sentryEnabled = sentry.enabled;
const sentryDSN = sentry.DSN;
const sentryTracesSampleRate = sentry.tracesSampleRate;
if (sentryEnabled) {
  init({
    dsn: sentryDSN,
    integrations: [
      new CaptureConsole({
        // ['log', 'info', 'warn', 'error', 'debug', 'assert']
        levels: ['warn', 'error']
      })
    ],
    tracesSampleRate: sentryTracesSampleRate
  });
}

// directory path
const dir = {
  public: _join(__dirname, './', 'public')
};

let announcedIP = _mediasoup.webRtcTransport.listenIps[0].announcedIp; // Announced IP

let authHost; // Host authentication

let roomList = new Map();

// All mediasoup workers
let workers = [];
let nextMediasoupWorkerIdx = 0;
// https://www.ipify.org is a free service to get your public IP address
if (!announcedIP) {
  get(
    {
      host: 'api.ipify.org',
      port: 80,
      path: '/'
    },
    (resp) => {
      resp.on('data', (ip) => {
        announcedIP = ip.toString();
        _mediasoup.webRtcTransport.listenIps[0].announcedIp = announcedIP;
        startServer();
      });
    }
  );
} else {
  startServer();
}

// Start server
function startServer() {
  app.use(cors());
  app.use(compression());
  app.use(express.json());
  app.use(express.static(dir.public));
  app.use(express.urlencoded({ extended: true }));
  app.use('/', router);

  httpServer.listen(listenPort, () => {
    log.log(logo, 'font-family:monospace');
    log.debug('Settings', {
      node_version: process.versions.node,
      hostConfig: hostCfg,
      announced_ip: announcedIP,
      server: host,
      api_docs: api_docs,
      mediasoup_server_version: version,
      mediasoup_client_version: _version,
      sentry_enabled: sentryEnabled
    });
  });

  // mediasoup worker
  (async () => {
    try {
      await createWorkers(workers);
    } catch (err) {
      log.error('Create Worker ERR --->', err);
      process.exit(1);
    }
  })();

  // socket.io
  io.on('connection', (socket) => {
    socket.on('createRoom', async ({ room_id }, callback) => {
      socket.room_id = room_id;

      if (roomList.has(socket.room_id)) {
        callback({ error: 'already exists' });
      } else {
        log.debug('Created room', { room_id: socket.room_id });
        let worker = await getMediasoupWorker(workers, nextMediasoupWorkerIdx);
        roomList.set(socket.room_id, new Room(socket.room_id, worker, io));
        callback({ room_id: socket.room_id });
      }
    });

    socket.on('setHost', async (callback) => {
      if (!roomList.has(socket.room_id)) return;

      log.debug('setHost', socket.id);
      roomList.get(socket.room_id).setHost(socket.id);

      const resJson = roomList.get(socket.room_id).getPeers().get(socket.id)?.peer_info;
      roomList.get(socket.room_id).broadCast(socket.id, 'setHost', resJson);
      callback('Successfully setHost');
    });

    socket.on('accessReq', async (peer_info, callback) => {
      if (!roomList.has(socket.room_id)) return;

      log.debug('accessRequest', socket.id);

      const host = roomList.get(socket.room_id).getHost();
      roomList.get(socket.room_id).sendTo(host, 'accessReqest', peer_info);
      callback('Successfully request access');
    });

    socket.on('accessRes', async (data, callback) => {
      if (!roomList.has(socket.room_id)) return;
      const host = roomList.get(socket.room_id).getHost();
      const { access, peer_info } = data;

      log.debug('accessResponse', data);

      if (socket.id != host) return;
      roomList.get(socket.room_id).sendTo(peer_info.peer_id, 'permitResponse', access);
      callback('Successfully response access');
    });

    socket.on('getPeerCounts', async ({}, callback) => {
      if (!roomList.has(socket.room_id)) return;

      let peerCounts = roomList.get(socket.room_id).getPeersCount();

      log.debug('Peer counts', { peerCounts: peerCounts });

      callback({ peerCounts: peerCounts });
    });

    socket.on('peerAction', (data) => {
      if (!roomList.has(socket.room_id)) return;

      log.debug('Peer action', data);

      if (data.broadcast) {
        roomList.get(socket.room_id).broadCast(data.peer_id, 'peerAction', data);
      } else {
        roomList.get(socket.room_id).sendTo(data.peer_id, 'peerAction', data);
      }
    });

    socket.on('updatePeerInfo', (data) => {
      if (!roomList.has(socket.room_id)) return;

      // update my peer_info status to all in the room
      roomList.get(socket.room_id).getPeers().get(socket.id).updatePeerInfo(data);
      roomList.get(socket.room_id).broadCast(socket.id, 'updatePeerInfo', data);
    });

    socket.on('setVideoOff', (data) => {
      if (!roomList.has(socket.room_id)) return;

      log.debug('Video off', getPeerName());
      roomList.get(socket.room_id).broadCast(socket.id, 'setVideoOff', data);
    });

    socket.on('join', (data, cb) => {
      data = JSON.parse(data);
      socket.room_id = data.room_id;

      if (!roomList.has(socket.room_id)) {
        return cb({
          error: 'Room does not exist'
        });
      }

      log.debug('User joined', data);
      roomList.get(socket.room_id).addPeer(new Peer(socket.id, data));
      cb(roomList.get(socket.room_id).toJson());
    });

    socket.on('getRouterRtpCapabilities', (_, callback) => {
      if (!roomList.has(socket.room_id)) {
        return callback({ error: 'Room not found' });
      }

      log.debug('Get RouterRtpCapabilities', getPeerName());
      try {
        callback(roomList.get(socket.room_id).getRtpCapabilities());
      } catch (err) {
        callback({
          error: err.message
        });
      }
    });

    socket.on('getProducers', () => {
      if (!roomList.has(socket.room_id)) return;

      log.debug('Get producers', getPeerName());

      // send all the current producer to newly joined member
      let producerList = roomList.get(socket.room_id).getProducerListForPeer();

      socket.emit('newProducers', producerList);
    });

    socket.on('createWebRtcTransport', async (_, callback) => {
      if (!roomList.has(socket.room_id)) {
        return callback({ error: 'Room not found' });
      }

      log.debug('Create webrtc transport', getPeerName());
      try {
        const { params } = await roomList.get(socket.room_id).createWebRtcTransport(socket.id);
        callback(params);
      } catch (err) {
        log.error('Create WebRtc Transport error: ', err.message);
        callback({
          error: err.message
        });
      }
    });

    socket.on('connectTransport', async ({ transport_id, dtlsParameters }, callback) => {
      if (!roomList.has(socket.room_id)) {
        return callback({ error: 'Room not found' });
      }

      log.debug('Connect transport', getPeerName());

      await roomList
        .get(socket.room_id)
        .connectPeerTransport(socket.id, transport_id, dtlsParameters);

      callback('success');
    });

    socket.on(
      'produce',
      async ({ producerTransportId, kind, appData, rtpParameters }, callback) => {
        if (!roomList.has(socket.room_id)) {
          return callback({ error: 'Room not found' });
        }

        let peer_name = getPeerName(false);

        // peer_info audio Or video ON
        let data = {
          peer_name: peer_name,
          peer_id: socket.id,
          kind: kind,
          type: appData.mediaType,
          status: true
        };
        await roomList.get(socket.room_id).getPeers().get(socket.id).updatePeerInfo(data);

        let producer_id = await roomList
          .get(socket.room_id)
          .produce(socket.id, producerTransportId, rtpParameters, kind, appData.mediaType);

        log.debug('Produce', {
          kind: kind,
          type: appData.mediaType,
          peer_name: peer_name,
          peer_id: socket.id,
          producer_id: producer_id
        });

        // add producer to audio level observer
        if (kind === 'audio') {
          roomList.get(socket.room_id).addProducerToAudioLevelObserver({ producerId: producer_id });
        }

        callback({
          producer_id
        });
      }
    );

    socket.on('consume', async ({ consumerTransportId, producerId, rtpCapabilities }, callback) => {
      if (!roomList.has(socket.room_id)) {
        return callback({ error: 'Room not found' });
      }

      let params = await roomList
        .get(socket.room_id)
        .consume(socket.id, consumerTransportId, producerId, rtpCapabilities);

      log.debug('Consuming', {
        peer_name: getPeerName(false),
        producer_id: producerId,
        consumer_id: params ? params.id : undefined
      });

      callback(params);
    });

    socket.on('producerClosed', (data) => {
      if (!roomList.has(socket.room_id)) return;

      log.debug('Producer close', data);

      // update video, audio OFF
      roomList.get(socket.room_id).getPeers().get(socket.id).updatePeerInfo(data);
      roomList.get(socket.room_id).closeProducer(socket.id, data.producer_id);
    });

    socket.on('refreshParticipantsCount', () => {
      if (!roomList.has(socket.room_id)) return;

      let data = {
        room_id: socket.room_id,
        peer_counts: roomList.get(socket.room_id).getPeers().size
      };
      log.debug('Refresh Participants count', data);
      roomList.get(socket.room_id).broadCast(socket.id, 'refreshParticipantsCount', data);
    });

    socket.on('message', (data) => {
      if (!roomList.has(socket.room_id)) return;

      log.debug('message', data);
      if (data.to_peer_id == 'all') {
        roomList.get(socket.room_id).broadCast(socket.id, 'message', data);
      } else {
        roomList.get(socket.room_id).sendTo(data.to_peer_id, 'message', data);
      }
    });

    socket.on('disconnect', () => {
      if (!roomList.has(socket.room_id)) return;

      log.debug('Disconnect', getPeerName());
      roomList.get(socket.room_id).removePeer(socket.id);
      roomList.get(socket.room_id).broadCast(socket.id, 'removeMe', removeMeData());
    });

    socket.on('exitRoom', async (_, callback) => {
      if (!roomList.has(socket.room_id)) {
        return callback({
          error: 'Not currently in a room'
        });
      }
      log.debug('Exit room', getPeerName());

      // close transports
      await roomList.get(socket.room_id).removePeer(socket.id);

      roomList.get(socket.room_id).broadCast(socket.id, 'removeMe', removeMeData());

      if (roomList.get(socket.room_id).getPeers().size === 0) {
        roomList.delete(socket.room_id);
      }

      socket.room_id = null;

      callback('Successfully exited room');
    });

    socket.on('exitHost', async (newHost, callback) => {
      if (!roomList.has(socket.room_id)) {
        return callback({
          error: 'Not currently in a room'
        });
      }
      if (!newHost)
        return callback({
          error: 'new hostInfo required'
        });
      if (!roomList.get(socket.room_id).isExist(newHost.peer_id))
        return callback({
          error: 'new host is not Exist in the room'
        });

      log.debug('Exit room Host', getPeerName());

      roomList.get(socket.room_id).setHost(newHost.peer_id);
      await roomList.get(socket.room_id).removePeer(socket.id);

      roomList.get(socket.room_id).broadCast(socket.id, 'removeMe', removeMeData());

      if (roomList.get(socket.room_id).getPeers().size === 0) {
        roomList.delete(socket.room_id);
      }

      socket.room_id = null;

      callback('Successfully exited room');
    });

    function getPeerName(json = true) {
      try {
        let peer_name =
          roomList.get(socket.room_id) &&
          roomList.get(socket.room_id).getPeers().get(socket.id).peer_info?.peer_name;
        if (json) {
          return {
            peer_name: peer_name
          };
        }
        return peer_name;
      } catch (err) {
        log.error('getPeerName', err);
        return json ? { peer_name: 'undefined' } : 'undefined';
      }
    }

    function removeMeData() {
      return {
        room_id: roomList.get(socket.room_id) && socket.room_id,
        peer_id: socket.id,
        peer_counts: roomList.get(socket.room_id) && roomList.get(socket.room_id).getPeers().size
      };
    }
  });
}
