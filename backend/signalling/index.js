import http from 'http';
import path from 'path';
import { Server } from 'socket.io';
import express from 'express';
import router from './controller/index.js';

const app = express();
const __dirname = path.resolve();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

app.use('/public', express.static(__dirname + '/public'));
app.use('/api', router);

app.get('/public/home', (_, res) => res.render('home'));

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

wsServer.on('connection', (socket) => {
  socket.on('enter_room', (room, name) => {
    console.log(name + ' joined room ' + room + ' ✅');
    socket.join(room);
    socket.to(room).emit('join', name);
  });
  socket.on('disconnecting', (room, name) => {
    socket.to(room).emit('exit', name);
  });
  socket.on('new_message', (room, msg, name) => {
    socket.to(room).emit('new_message', name + ':' + msg);
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, async () => {
  console.log(`✅ server running on > http://localhost:${PORT}`);
});
