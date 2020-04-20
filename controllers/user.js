function subscribeUser(sockets, ioSockets) {
  var user_list = [];
  sockets.forEach((socket) => {
    user_list.push({ email: socket.email, username: socket.username });
  });
  ioSockets.emit('get-userlist', user_list);
}

module.exports = { subscribeUser };
