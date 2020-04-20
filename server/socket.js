const userHandler = require('../controllers/user');
const User = require('../models/User');

SocketServer = function (http) {
  // Define Server Socket
  let io = require('socket.io')(http);

  // sockets array
  var sockets = [];
  io.on('connection', function (socket) {
    socket.on('subscribe', async (data) => {
      // Set socket email and push it in 'sockets' array
      const user = await User.findOne({ email: data.email });
      socket.username = user.name;
      socket.email = data.email;
      sockets.push(socket);
      userHandler.subscribeUser(sockets, io);
    });
    socket.on('get-userlist', () => {
      userHandler.subscribeUser(sockets, io);
    });
    socket.on('new-channel', async (data) => {
      const user = await User.findOne({ email: data.email });
      sockets.forEach((iSocket) => {
        if (iSocket.email === data.email) {
          iSocket.emit('get-channels', { channels: user.channels });
        }
      });
    });
    // on disconnect, remove connected socket
    socket.on('disconnected', () => {
      console.log('disconnected');
      socket.disconnect(true);
      sockets.splice(sockets.indexOf(socket), 1);
      userHandler.subscribeUser(sockets, io);
    });
  });
};
