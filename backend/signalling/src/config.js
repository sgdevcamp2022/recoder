import { networkInterfaces, cpus } from 'os';
import Logger from './Logger.js';
import { version, createWorker } from 'mediasoup';

const ifaces = networkInterfaces();
const log = new Logger('Server');

const getLocalIp = () => {
  let localIp = '127.0.0.1';
  Object.keys(ifaces).forEach((ifname) => {
    for (const iface of ifaces[ifname]) {
      if (iface.family !== 'IPv4' || iface.internal !== false) {
        continue;
      }
      localIp = iface.address;
      return;
    }
  });
  return localIp;
};

export const hostProtected = false;
export const hostUsername = 'username';
export const hostPassword = 'password';
export const listenIp = '0.0.0.0';
export const listenPort = process.env.PORT || 5000;
export const apiKeySecret = 'CoMeet_default_secret';
export const sslCrt = 'app/ssl/cert.pem';
export const sslKey = 'app/ssl/key.pem';
export const sentry = {
  enabled: false,
  DSN: '',
  tracesSampleRate: 0.5
};

export const hostCfg = {
  protected: hostProtected,
  username: hostUsername,
  password: hostPassword,
  authenticated: !hostProtected
}; // host config

export const mediasoup = {
  // Worker settings
  numWorkers: Object.keys(cpus()).length,
  worker: {
    rtcMinPort: 40000,
    rtcMaxPort: 40100,
    logLevel: 'error',
    logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp']
  },
  // Router settings
  router: {
    mediaCodecs: [
      {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2
      },
      {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
        parameters: {
          'x-google-start-bitrate': 1000
        }
      },
      {
        kind: 'video',
        mimeType: 'video/VP9',
        clockRate: 90000,
        parameters: {
          'profile-id': 2,
          'x-google-start-bitrate': 1000
        }
      },
      {
        kind: 'video',
        mimeType: 'video/h264',
        clockRate: 90000,
        parameters: {
          'packetization-mode': 1,
          'profile-level-id': '4d0032',
          'level-asymmetry-allowed': 1,
          'x-google-start-bitrate': 1000
        }
      },
      {
        kind: 'video',
        mimeType: 'video/h264',
        clockRate: 90000,
        parameters: {
          'packetization-mode': 1,
          'profile-level-id': '42e01f',
          'level-asymmetry-allowed': 1,
          'x-google-start-bitrate': 1000
        }
      }
    ]
  },
  // Transport settings
  webRtcTransport: {
    listenIps: [
      {
        ip: '0.0.0.0',
        announcedIp: getLocalIp() // public IP로 수정하거나 그대로 냅두면 동작함
      }
    ],
    initialAvailableOutgoingBitrate: 1000000,
    minimumAvailableOutgoingBitrate: 600000,
    maxSctpMessageSize: 262144,
    maxIncomingBitrate: 1500000
  }
};

export const logo = `%c                                                                                                                                                                                                                               
            CCCCCCCCCCCCC                 MMMMMMMM               MMMMMMMM                                                tttt          
            CCC::::::::::::C                 M:::::::M             M:::::::M                                             ttt:::t          
          CC:::::::::::::::C                 M::::::::M           M::::::::M                                             t:::::t          
         C:::::CCCCCCCC::::C                 M:::::::::M         M:::::::::M                                             t:::::t          
        C:::::C       CCCCCC   ooooooooooo   M::::::::::M       M::::::::::M    eeeeeeeeeeee       eeeeeeeeeeee    ttttttt:::::ttttttt    
       C:::::C               oo:::::::::::oo M:::::::::::M     M:::::::::::M  ee::::::::::::ee   ee::::::::::::ee  t:::::::::::::::::t    
       C:::::C              o:::::::::::::::oM:::::::M::::M   M::::M:::::::M e::::::eeeee:::::eee::::::eeeee:::::eet:::::::::::::::::t    
       C:::::C              o:::::ooooo:::::oM::::::M M::::M M::::M M::::::Me::::::e     e:::::e::::::e     e:::::etttttt:::::::tttttt    
       C:::::C              o::::o     o::::oM::::::M  M::::M::::M  M::::::Me:::::::eeeee::::::e:::::::eeeee::::::e      t:::::t          
       C:::::C              o::::o     o::::oM::::::M   M:::::::M   M::::::Me:::::::::::::::::ee:::::::::::::::::e       t:::::t          
       C:::::C              o::::o     o::::oM::::::M    M:::::M    M::::::Me::::::eeeeeeeeeee e::::::eeeeeeeeeee        t:::::t          
        C:::::C       CCCCCCo::::o     o::::oM::::::M     MMMMM     M::::::Me:::::::e          e:::::::e                 t:::::t    tttttt
         C:::::CCCCCCCC::::Co:::::ooooo:::::oM::::::M               M::::::Me::::::::e         e::::::::e                t::::::tttt:::::t
          CC:::::::::::::::Co:::::::::::::::oM::::::M               M::::::M e::::::::eeeeeeee  e::::::::eeeeeeee        tt::::::::::::::t
            CCC::::::::::::C oo:::::::::::oo M::::::M               M::::::M  ee:::::::::::::e   ee:::::::::::::e          tt:::::::::::tt
               CCCCCCCCCCCCC   ooooooooooo   MMMMMMMM               MMMMMMMM    eeeeeeeeeeeeee     eeeeeeeeeeeeee            ttttttttttt  
        `;

export async function createWorkers(workers) {
  const { numWorkers } = mediasoup;

  const { logLevel, logTags, rtcMinPort, rtcMaxPort } = mediasoup.worker;

  log.debug('WORKERS:', numWorkers);

  for (let i = 0; i < numWorkers; i++) {
    let worker = await createWorker({
      logLevel: logLevel,
      logTags: logTags,
      rtcMinPort: rtcMinPort,
      rtcMaxPort: rtcMaxPort
    });
    worker.on('died', () => {
      log.error('Mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid);
      setTimeout(() => process.exit(1), 2000);
    });
    workers.push(worker);
  }
}

export async function getMediasoupWorker(workers, nextMediasoupWorkerIdx) {
  const worker = workers[nextMediasoupWorkerIdx];
  if (++nextMediasoupWorkerIdx === workers.length) nextMediasoupWorkerIdx = 0;
  return worker;
}
