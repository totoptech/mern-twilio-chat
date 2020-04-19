// const messageHandler = require("./controllers/message");
// const roomHandler = require('./controllers/room');

SocketServer = function (http) {
  // Define Server Socket
  let io = require('socket.io')(http);

  // sockets array
  var sockets = [];

  io.on('connection', function (socket) {
    socket.emit('connected');

    socket.on('subscribe', (data) => {
      // Set socket username
      socket.username = data.username;

      // save socket to subscribed sockets
      sockets.push(socket);

      // Save user socket to rooms table
      roomHandler.addClient(data, socket.id);
      // get Messages in this Chatting room and send it to client socket
      messageHandler.getMessages(data, socket);
    });

    // on disconnect, remove connected socket
    socket.on('disconnected', function () {
      sockets.splice(sockets.indexOf(socket), 1);
    });

    socket.on('message', (data) => {
      // username, roomid, message
      // On New Message, save to db and send it to clients connected to this room

      const channelSockets = sockets.filter(function (m_soc) {
        return m_soc.roomid == data.roomid;
      });
      messageHandler.sendMessage(data, channelSockets, socket);
    });
  });
};
