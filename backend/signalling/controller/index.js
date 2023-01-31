import testController from './test_controller.js';
import express from 'express';
import Host from '../src/Host.js';
import path from 'path';
import { join } from 'path';
import ServerApi from '../src/ServerApi.js';
import Logger from '../src/Logger.js';

import { version as _version } from 'mediasoup-client';
import { hostCfg, mediasoup as _mediasoup } from '../src/config.js';
const __dirname = path.resolve();
const log = new Logger('Server');

// file path
const views = {
  about: join(__dirname, './', 'public/views/about.html'),
  landing: join(__dirname, './', 'public/views/landing.html'),
  login: join(__dirname, './', 'public/views/login.html'),
  newRoom: join(__dirname, './', 'public/views/newroom.html'),
  notFound: join(__dirname, './', 'public/views/404.html'),
  permission: join(__dirname, './', 'public/views/permission.html'),
  privacy: join(__dirname, './', 'public/views/privacy.html'),
  room: join(__dirname, './', 'public/views/Room.html')
};
function getIP(req) {
  return req.headers['x-forwarded-for'] || req.socket.remoteAddress;
}

const router = express.Router();
router.get('/createLink', testController.getTest);
router.get('/', (_req, res) => {
  if (hostCfg.protected == true) {
    hostCfg.authenticated = false;
    res.sendFile(views.login);
  } else {
    res.sendFile(views.landing);
  }
});

// handle login and authentication
router.get('/login', (req, res) => {
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
router.get('/newroom', (req, res) => {
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
router.get('/join/', (req, res) => {
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
router.get('/join/*', (_req, res) => {
  if (hostCfg.authenticated) {
    res.sendFile(views.room);
  } else {
    res.redirect('/');
  }
});

// if not allow video/audio
router.get('/permission', (req, res) => {
  res.sendFile(views.permission);
});

// privacy policy
router.get('/privacy', (req, res) => {
  res.sendFile(views.privacy);
});

// CoMeet about
router.get('/about', (req, res) => {
  res.sendFile(views.about);
});

// ####################################################
// API
// ####################################################

// request meeting room endpoint
router.post('/api/v1/meeting', (req, res) => {
  // check if user was authorized for the api call
  let host = req.headers.host;
  let authorization = req.headers.authorization;
  let api = new ServerApi(host, authorization);
  //   if (!api.isAuthorized()) {
  //     log.debug('CoMeet get meeting - Unauthorized', {
  //       header: req.headers,
  //       body: req.body
  //     });
  //     return res.status(403).json({ error: 'Unauthorized!' });
  //   }
  // setup meeting URL
  let meetingURL = api.getMeetingURL();
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ meeting: meetingURL }));
  // log.debug the output if all done
  log.debug('CoMeet get meeting - Authorized', {
    header: req.headers,
    body: req.body,
    meeting: meetingURL
  });
});

// request join room endpoint
router.post('/api/v1/join', (req, res) => {
  // check if user was authorized for the api call
  let host = req.headers.host;
  let authorization = req.headers.authorization;
  let api = new ServerApi(host, authorization);
  //   if (!api.isAuthorized()) {
  //     log.debug('CoMeet get join - Unauthorized', {
  //       header: req.headers,
  //       body: req.body
  //     });
  //     return res.status(403).json({ error: 'Unauthorized!' });
  //   }
  // setup Join URL
  let joinURL = api.getJoinURL(req.body);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ join: joinURL }));
  // log.debug the output if all done
  log.debug('CoMeet get join - Authorized', {
    header: req.headers,
    body: req.body,
    join: joinURL
  });
});

export default router;
