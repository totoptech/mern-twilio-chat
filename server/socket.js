const userHandler = require('../controllers/user');
const User = require('../models/User');

SocketServer = function (http) {
  // Define Server Socket
  let io = require('socket.io')(http);

  // sockets array
  var sockets = [];
  var user_list = [];
  io.on('connection', function (socket) {
    console.log('Connected!!', socket.id);
    socket.on('subscribe', async (data) => {
      // Set socket email and push it in 'sockets' array
      console.log('Subscribed!!!', socket.id, data.email);
      const isExisting = sockets.findIndex(
        (iSocket) => iSocket.email == data.email
      );
      //no user
      if (isExisting > -1) {
        sockets.splice(isExisting, 1);
      }
      const user = await User.findOne({ email: data.email });
      socket.username = user.name;
      socket.email = data.email;
      sockets.push(socket);
      userHandler.subscribeUser(sockets);
    });
    socket.on('get-userlist', () => {
      console.log('Get-USERLIST!!!', socket.id);
      // userHandler.subscribeUser(sockets, io);
    });
    socket.on('new-message', async (data) => {
      userHandler.newMessage(socket, sockets, data);
    });
    socket.on('new-channel', async (data) => {
      console.log('New Channel!!!', socket.id, data.email);
      const user = await User.findOne({ email: data.email });
      sockets.forEach((iSocket) => {
        if (iSocket.email === data.email) {
          iSocket.emit('get-channels', { channels: user.channels });
        }
      });
    });
    // on disconnect, remove connected socket
    socket.on('disconnected', () => {
      console.log('Disconncted!!!', socket.id);
      sockets.splice(sockets.indexOf(socket), 1);
      socket.disconnect(true);
      userHandler.subscribeUser(sockets);
    });
    socket.on('checked-message', async (data) => {
      userHandler.checkedMessage(socket, sockets, data);
    });
  });
};
