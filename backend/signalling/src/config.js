import { networkInterfaces, cpus } from 'os';
const ifaces = networkInterfaces();

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
export const sslCrt = 'app/ssl/cert.pem';
export const sslKey = 'app/ssl/key.pem';
export const ngrokAuthToken = '';
export const apiKeySecret = 'mirotalksfu_default_secret';
export const sentry = {
    enabled: false,
    DSN: '',
    tracesSampleRate: 0.5,
};

export const mediasoup = {
    // Worker settings
    numWorkers: Object.keys(cpus()).length,
    worker: {
        rtcMinPort: 40000,
        rtcMaxPort: 40100,
        logLevel: 'error',
        logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp'],
    },
    // Router settings
    router: {
        mediaCodecs: [
            {
                kind: 'audio',
                mimeType: 'audio/opus',
                clockRate: 48000,
                channels: 2,
            },
            {
                kind: 'video',
                mimeType: 'video/VP8',
                clockRate: 90000,
                parameters: {
                    'x-google-start-bitrate': 1000,
                },
            },
            {
                kind: 'video',
                mimeType: 'video/VP9',
                clockRate: 90000,
                parameters: {
                    'profile-id': 2,
                    'x-google-start-bitrate': 1000,
                },
            },
            {
                kind: 'video',
                mimeType: 'video/h264',
                clockRate: 90000,
                parameters: {
                    'packetization-mode': 1,
                    'profile-level-id': '4d0032',
                    'level-asymmetry-allowed': 1,
                    'x-google-start-bitrate': 1000,
                },
            },
            {
                kind: 'video',
                mimeType: 'video/h264',
                clockRate: 90000,
                parameters: {
                    'packetization-mode': 1,
                    'profile-level-id': '42e01f',
                    'level-asymmetry-allowed': 1,
                    'x-google-start-bitrate': 1000,
                },
            },
        ],
    },
    // Transport settings
    webRtcTransport: {
        listenIps: [
            {
                ip: '0.0.0.0',
                announcedIp: getLocalIp(), // public IP로 수정하거나 그대로 냅두면 동작함
            },
        ],
        initialAvailableOutgoingBitrate: 1000000,
        minimumAvailableOutgoingBitrate: 600000,
        maxSctpMessageSize: 262144,
        maxIncomingBitrate: 1500000,
    },
};
