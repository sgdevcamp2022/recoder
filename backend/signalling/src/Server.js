import express from 'express';
import cors from 'cors';
import compression from 'compression';
import { createServer } from 'httpolyglot';
import { version, createWorker } from 'mediasoup';
import { version as _version } from 'mediasoup-client';
import { get } from 'http';
import { sslKey, sslCrt, listenPort, hostProtected, hostUsername, hostPassword, sentry, mediasoup as _mediasoup } from './config.js';
import { join as _join } from 'path';
import { readFileSync } from 'fs';
import Host from './Host.js';
import Room from './Room.js';
import Peer from './Peer.js';
import ServerApi from './ServerApi.js';
import Logger from './Logger.js';

const log = new Logger('Server');

import { Server } from "socket.io";


import path from "path";

const __dirname = path.resolve();


import { serve, setup } from 'swagger-ui-express';

import swaggerDocument from '../api/swagger.json' assert { type: "json" };


import { init } from '@sentry/node';
import { CaptureConsole } from '@sentry/integrations';





const app = express();

const options = {
    key: readFileSync(_join(__dirname, sslKey), 'utf-8'),
    cert: readFileSync(_join(__dirname, sslCrt), 'utf-8'),
};

const httpServer = createServer(options, app);

const io = new Server(httpServer, {
    maxHttpBufferSize: 1e7,
    transports: ['websocket'],
});
const host = 'https://' + 'localhost' + ':' + listenPort; // host url

const hostCfg = {
    protected: hostProtected,
    username: hostUsername,
    password: hostPassword,
    authenticated: !hostProtected,
}; // host config

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
                levels: ['warn', 'error'],
            }),
        ],
        tracesSampleRate: sentryTracesSampleRate,
    });
}

// directory path
const dir = {
    public: _join(__dirname, './', 'public'),
};

// file path
const views = {
    about: _join(__dirname, './', 'public/views/about.html'),
    landing: _join(__dirname, './', 'public/views/landing.html'),
    login: _join(__dirname, './', 'public/views/login.html'),
    newRoom: _join(__dirname, './', 'public/views/newroom.html'),
    notFound: _join(__dirname, './', 'public/views/404.html'),
    permission: _join(__dirname, './', 'public/views/permission.html'),
    privacy: _join(__dirname, './', 'public/views/privacy.html'),
    room: _join(__dirname, './', 'public/views/Room.html'),
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
            path: '/',
        },
        (resp) => {
            resp.on('data', (ip) => {
                announcedIP = ip.toString();
                _mediasoup.webRtcTransport.listenIps[0].announcedIp = announcedIP;
                startServer();
            });
        },
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
    app.use(apiBasePath + '/docs', serve, setup(swaggerDocument)); // api docs
    
    app.get('*', function (next) {
        next();
    });

    // error handler
    app.use((err, req, res, next) => {
        if (err instanceof SyntaxError || err.status === 400 || 'body' in err) {
            log.error('Request Error', {
                header: req.headers,
                body: req.body,
                error: err.message,
            });
            return res.status(400).send({ status: 404, message: err.message }); // Bad request
        }
        if (req.path.substr(-1) === '/' && req.path.length > 1) {
            let query = req.url.slice(req.path.length);
            res.redirect(301, req.path.slice(0, -1) + query);
        } else {
            next();
        }
    });

    // handle landing page
    app.get(['/'], (_req, res) => {
        if (hostCfg.protected == true) {
            hostCfg.authenticated = false;
            res.sendFile(views.login);
        } else {
            res.sendFile(views.landing);
        }
    });

    // handle login and authentication
    app.get(['/login'], (req, res) => {
        if (hostCfg.protected == true) {
            let ip = getIP(req);
            log.debug(`Request login to host from: ${ip}`, req.query);
            const { username, password } = req.query;
            if (username == hostCfg.username && password == hostCfg.password) {
                hostCfg.authenticated = true;
                authHost = new Host(ip, true);
                log.debug('LOGIN OK', { ip: ip, authorized: authHost.isAuthorized(ip) });
                res.sendFile(views.landing);
            } else {
                log.debug('LOGIN KO', { ip: ip, authorized: false });
                hostCfg.authenticated = false;
                res.sendFile(views.login);
            }
        } else {
            res.redirect('/');
        }
    });

    // set new room
    app.get(['/newroom'], (req, res) => {
        if (hostCfg.protected == true) {
            let ip = getIP(req);
            if (allowedIP(ip)) {
                res.sendFile(views.newRoom);
            } else {
                hostCfg.authenticated = false;
                res.sendFile(views.login);
            }
        } else {
            res.sendFile(views.newRoom);
        } 
    });

    //방 이름이 지정되지 않은 경우 -> 직접 생성
    app.get('/join/', (req, res) => {
        if (hostCfg.authenticated && Object.keys(req.query).length > 0) {
            log.debug('Direct Join', req.query);
            // http://localhost:3000/join?room=test&password=0&name=CoMeet&audio=1&video=1&screen=1&notify=1
            const { room, password, name, audio, video, screen, notify } = req.query;
            if (room && password && name && audio && video && screen && notify) {
                return res.sendFile(views.room);
            }
        }
        res.redirect('/');
    });

    // join room
    app.get('/join/*', (_req, res) => {
        if (hostCfg.authenticated) {
            res.sendFile(views.room);
        } else {
            res.redirect('/');
        }
    });

    // if not allow video/audio
    app.get(['/permission'], (req, res) => {
        res.sendFile(views.permission);
    });

    // privacy policy
    app.get(['/privacy'], (req, res) => {
        res.sendFile(views.privacy);
    });

    // CoMeet about
    app.get(['/about'], (req, res) => {
        res.sendFile(views.about);
    });

    // ####################################################
    // API
    // ####################################################

    // request meeting room endpoint
    app.post(['/api/v1/meeting'], (req, res) => {
        // check if user was authorized for the api call
        let host = req.headers.host;
        let authorization = req.headers.authorization;
        let api = new ServerApi(host, authorization);
        if (!api.isAuthorized()) {
            log.debug('CoMeet get meeting - Unauthorized', {
                header: req.headers,
                body: req.body,
            });
            return res.status(403).json({ error: 'Unauthorized!' });
        }
        // setup meeting URL
        let meetingURL = api.getMeetingURL();
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ meeting: meetingURL }));
        // log.debug the output if all done
        log.debug('CoMeet get meeting - Authorized', {
            header: req.headers,
            body: req.body,
            meeting: meetingURL,
        });
    });

    // request join room endpoint
    app.post(['/api/v1/join'], (req, res) => {
        // check if user was authorized for the api call
        let host = req.headers.host;
        let authorization = req.headers.authorization;
        let api = new ServerApi(host, authorization);
        if (!api.isAuthorized()) {
            log.debug('CoMeet get join - Unauthorized', {
                header: req.headers,
                body: req.body,
            });
            return res.status(403).json({ error: 'Unauthorized!' });
        }
        // setup Join URL
        let joinURL = api.getJoinURL(req.body);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ join: joinURL }));
        // log.debug the output if all done
        log.debug('CoMeet get join - Authorized', {
            header: req.headers,
            body: req.body,
            join: joinURL,
        });
    });


// start server

    httpServer.listen(listenPort, () => {
        log.log(
            `%c                                                                                                                                                                                                                               
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
        `,
            'font-family:monospace',
        );

        log.debug('Settings', {
            node_version: process.versions.node,
            hostConfig: hostCfg,
            announced_ip: announcedIP,
            server: host,
            api_docs: api_docs,
            mediasoup_server_version: version,
            mediasoup_client_version: _version,
            sentry_enabled: sentryEnabled,
        });
    });


    // mediasoup worker
    (async () => {
        try {
            await createWorkers();
        } catch (err) {
            log.error('Create Worker ERR --->', err);
            process.exit(1);
        }
    })();

    async function createWorkers() {
        const { numWorkers } = _mediasoup;

        const { logLevel, logTags, rtcMinPort, rtcMaxPort } = _mediasoup.worker;

        log.debug('WORKERS:', numWorkers);

        for (let i = 0; i < numWorkers; i++) {
            let worker = await createWorker({
                logLevel: logLevel,
                logTags: logTags,
                rtcMinPort: rtcMinPort,
                rtcMaxPort: rtcMaxPort,
            });
            worker.on('died', () => {
                log.error('Mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid);
                setTimeout(() => process.exit(1), 2000);
            });
            workers.push(worker);
        }
    }

    async function getMediasoupWorker() {
        const worker = workers[nextMediasoupWorkerIdx];
        if (++nextMediasoupWorkerIdx === workers.length) nextMediasoupWorkerIdx = 0;
        return worker;
    }

    // socket.io
    io.on('connection', (socket) => {
        socket.on('createRoom', async ({ room_id }, callback) => {
            socket.room_id = room_id;

            if (roomList.has(socket.room_id)) {
                callback({ error: 'already exists' });
            } else {
                log.debug('Created room', { room_id: socket.room_id });
                let worker = await getMediasoupWorker();
                roomList.set(socket.room_id, new Room(socket.room_id, worker, io));
                callback({ room_id: socket.room_id });
            }
        });

        socket.on('getPeerCounts', async ({}, callback) => {
            if (!roomList.has(socket.room_id)) return;

            let peerCounts = roomList.get(socket.room_id).getPeersCount();

            log.debug('Peer counts', { peerCounts: peerCounts });

            callback({ peerCounts: peerCounts });
        });

        socket.on('cmd', (data) => {
            if (!roomList.has(socket.room_id)) return;

            log.debug('Cmd', data);

            // cmd|data
            const words = data.split('|');
            let cmd = words[0];
            switch (cmd) {
                case 'privacy':
                    roomList
                        .get(socket.room_id)
                        .getPeers()
                        .get(socket.id)
                        .updatePeerInfo({ type: cmd, status: words[2] == 'true' });
                    break;
                
            }

            roomList.get(socket.room_id).broadCast(socket.id, 'cmd', data);
        });

        // room 기능
        socket.on('roomAction', (data) => {
            if (!roomList.has(socket.room_id)) return;

            log.debug('Room action:', data);
            switch (data.action) {
                case 'lock':
                    if (!roomList.get(socket.room_id).isLocked()) {
                        roomList.get(socket.room_id).setLocked(true, data.password);
                        roomList.get(socket.room_id).broadCast(socket.id, 'roomAction', data.action);
                    }
                    break;
                case 'checkPassword':
                    let roomData = {
                        room: null,
                        password: 'KO',
                    };
                    if (data.password == roomList.get(socket.room_id).getPassword()) {
                        roomData.room = roomList.get(socket.room_id).toJson();
                        roomData.password = 'OK';
                    }
                    roomList.get(socket.room_id).sendTo(socket.id, 'roomPassword', roomData);
                    break;
                case 'unlock':
                    roomList.get(socket.room_id).setLocked(false);
                    roomList.get(socket.room_id).broadCast(socket.id, 'roomAction', data.action);
                    break;
                case 'lobbyOn':
                    roomList.get(socket.room_id).setLobbyEnabled(true);
                    roomList.get(socket.room_id).broadCast(socket.id, 'roomAction', data.action);
                    break;
                case 'lobbyOff':
                    roomList.get(socket.room_id).setLobbyEnabled(false);
                    roomList.get(socket.room_id).broadCast(socket.id, 'roomAction', data.action);
                    break;
            }
            log.debug('Room status', {
                locked: roomList.get(socket.room_id).isLocked(),
                lobby: roomList.get(socket.room_id).isLobbyEnabled(),
            });
        });

        socket.on('roomLobby', (data) => {
            if (!roomList.has(socket.room_id)) return;

            data.room = roomList.get(socket.room_id).toJson();

            log.debug('Room lobby', {
                peer_id: data.peer_id,
                peer_name: data.peer_name,
                peers_id: data.peers_id,
                lobby: data.lobby_status,
                broadcast: data.broadcast,
            });

            if (data.peers_id && data.broadcast) {
                for (let peer_id in data.peers_id) {
                    roomList.get(socket.room_id).sendTo(data.peers_id[peer_id], 'roomLobby', data);
                }
            } else {
                roomList.get(socket.room_id).sendTo(data.peer_id, 'roomLobby', data);
            }
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

        socket.on('fileInfo', (data) => {
            if (!roomList.has(socket.room_id)) return;

            log.debug('Send File Info', data);
            if (data.broadcast) {
                roomList.get(socket.room_id).broadCast(socket.id, 'fileInfo', data);
            } else {
                roomList.get(socket.room_id).sendTo(data.peer_id, 'fileInfo', data);
            }
        });

        socket.on('file', (data) => {
            if (!roomList.has(socket.room_id)) return;

            if (data.broadcast) {
                roomList.get(socket.room_id).broadCast(socket.id, 'file', data);
            } else {
                roomList.get(socket.room_id).sendTo(data.peer_id, 'file', data);
            }
        });

        socket.on('fileAbort', (data) => {
            if (!roomList.has(socket.room_id)) return;

            roomList.get(socket.room_id).broadCast(socket.id, 'fileAbort', data);
        });

        socket.on('shareVideoAction', (data) => {
            if (!roomList.has(socket.room_id)) return;

            log.debug('Share video: ', data);
            if (data.peer_id == 'all') {
                roomList.get(socket.room_id).broadCast(socket.id, 'shareVideoAction', data);
            } else {
                roomList.get(socket.room_id).sendTo(data.peer_id, 'shareVideoAction', data);
            }
        });
        // Google Meet 화이트 보드 기능

        socket.on('wbCanvasToJson', (data) => {
            if (!roomList.has(socket.room_id)) return;

            // let objLength = bytesToSize(Object.keys(data).length);
            // log.debug('Send Whiteboard canvas JSON', { length: objLength });
            roomList.get(socket.room_id).broadCast(socket.id, 'wbCanvasToJson', data);
        });

        socket.on('whiteboardAction', (data) => {
            if (!roomList.has(socket.room_id)) return;

            log.debug('Whiteboard', data);
            roomList.get(socket.room_id).broadCast(socket.id, 'whiteboardAction', data);
        });

        socket.on('setVideoOff', (data) => {
            if (!roomList.has(socket.room_id)) return;

            log.debug('Video off', getPeerName());
            roomList.get(socket.room_id).broadCast(socket.id, 'setVideoOff', data);
        });

        socket.on('join', (data, cb) => {
            if (!roomList.has(socket.room_id)) {
                return cb({
                    error: 'Room does not exist',
                });
            }

            log.debug('User joined', data);
            roomList.get(socket.room_id).addPeer(new Peer(socket.id, data));

            if (roomList.get(socket.room_id).isLocked()) {
                log.debug('User rejected because room is locked');
                return cb('isLocked');
            }

            if (roomList.get(socket.room_id).isLobbyEnabled()) {
                log.debug('User waiting to join room because lobby is enabled');
                roomList.get(socket.room_id).broadCast(socket.id, 'roomLobby', {
                    peer_id: data.peer_info.peer_id,
                    peer_name: data.peer_info.peer_name,
                    lobby_status: 'waiting',
                });
                return cb('isLobby');
            }

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
                    error: err.message,
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
                    error: err.message,
                });
            }
        });

        socket.on('connectTransport', async ({ transport_id, dtlsParameters }, callback) => {
            if (!roomList.has(socket.room_id)) {
                return callback({ error: 'Room not found' });
            }

            log.debug('Connect transport', getPeerName());

            await roomList.get(socket.room_id).connectPeerTransport(socket.id, transport_id, dtlsParameters);

            callback('success');
        });

        socket.on('produce', async ({ producerTransportId, kind, appData, rtpParameters }, callback) => {
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
                status: true,
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
                producer_id: producer_id,
            });

            // add producer to audio level observer
            if (kind === 'audio') {
                roomList.get(socket.room_id).addProducerToAudioLevelObserver({ producerId: producer_id });
            }

            callback({
                producer_id,
            });
        });

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
                consumer_id: params ? params.id : undefined,
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

        socket.on('resume', async (_, callback) => {
            await consumer.resume();
            callback();
        });

        socket.on('getRoomInfo', (_, cb) => {
            if (!roomList.has(socket.room_id)) return;

            log.debug('Send Room Info to', getPeerName());
            cb(roomList.get(socket.room_id).toJson());
        });
        // send room info to all the members
        socket.on('refreshParticipantsCount', () => {
            if (!roomList.has(socket.room_id)) return;

            let data = {
                room_id: socket.room_id,
                peer_counts: roomList.get(socket.room_id).getPeers().size,
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

            if (roomList.get(socket.room_id).getPeers().size === 0) {
                if (roomList.get(socket.room_id).isLocked()) {
                    roomList.get(socket.room_id).setLocked(false);
                }
                if (roomList.get(socket.room_id).isLobbyEnabled()) {
                    roomList.get(socket.room_id).setLobbyEnabled(false);
                }
            }

            roomList.get(socket.room_id).broadCast(socket.id, 'removeMe', removeMeData());

            removeIP(socket);
        });

        socket.on('exitRoom', async (_, callback) => {
            if (!roomList.has(socket.room_id)) {
                return callback({
                    error: 'Not currently in a room',
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

            removeIP(socket);

            callback('Successfully exited room');
        });

        // 
        function getPeerName(json = true) {
            try {
                let peer_name =
                    roomList.get(socket.room_id) &&
                    roomList.get(socket.room_id).getPeers().get(socket.id).peer_info?.peer_name;
                if (json) {
                    return {
                        peer_name: peer_name,
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
                peer_counts: roomList.get(socket.room_id) && roomList.get(socket.room_id).getPeers().size,
            };
        }

        function bytesToSize(bytes) {
            let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            if (bytes == 0) return '0 Byte';
            let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
            return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
        }
    });

    function getIP(req) {
        return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    }
    function allowedIP(ip) {
        return authHost != null && authHost.isAuthorized(ip);
    }
    function removeIP(socket) {
        if (hostCfg.protected == true) {
            let ip = socket.handshake.address;
            if (ip && allowedIP(ip)) {
                authHost.deleteIP(ip);
                hostCfg.authenticated = false;
                log.debug('Remove IP from auth', { ip: ip });
            }
        }
    }
}
