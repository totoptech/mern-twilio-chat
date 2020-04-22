const User = require('../models/User');
function getUserList(sockets) {
  var user_list = [];
  sockets.forEach((socket) => {
    user_list.push({
      email: socket.email,
      username: socket.username,
      lastmsg: '',
      unchecked: 0
    });
  });
  return user_list;
}
async function sendUserList(socket, user_list) {
  const user = await User.findOne({ email: socket.email });
  const added_users = [];
  user.channels.forEach((channel) => {
    added_users.push({
      email: channel.friendEmail,
      username: channel.friendName,
      lastmsg: channel.lastmsg,
      unchecked: channel.unchecked,
      time: channel.time
    });
    user_list = user_list.filter((value) => value.email != channel.friendEmail);
  });
  socket.emit('get-userlist', added_users.concat(user_list));
}

function subscribeUser(sockets) {
  const user_list = getUserList(sockets);
  sockets.forEach(async (socket) => {
    sendUserList(socket, user_list);
  });
}

async function checkedMessage(socket, sockets, data) {
  const { senderEmail, receiverEmail } = data;
  const user = await User.findOne({ email: senderEmail });
  if (user) {
    channels = user.channels;
    const index = channels.findIndex(
      (channel) => channel.friendEmail == receiverEmail
    );
    channels[index].unchecked = 0;
    await User.updateOne({ email: senderEmail }, { channels });
  }
  const user_list = getUserList(sockets);
  sendUserList(socket, user_list);
}

async function newMessage(senderSocket, sockets, data) {
  const { senderEmail, receiverEmail, message } = data;
  const sender = await User.findOne({ email: senderEmail });
  const receiver = await User.findOne({ email: receiverEmail });
  let channels = [];
  if (sender) {
    channels = sender.channels;
    const index = channels.findIndex(
      (channel) => channel.friendEmail == receiverEmail
    );
    channels[index].lastmsg = message;
    channels[index].unchecked = 0;
    channels[index].time = Date.now();
    await User.updateOne({ email: senderEmail }, { channels });
  }
  if (receiver) {
    channels = receiver.channels;
    const index = channels.findIndex(
      (channel) => channel.friendEmail == senderEmail
    );
    channels[index].lastmsg = message;
    channels[index].unchecked++;
    channels[index].time = Date.now();
    await User.updateOne({ email: receiverEmail }, { channels });
  }
  //Send changes to senderSocket and receiverSocket
  const user_list = getUserList(sockets);
  console.log(sockets.length);
  sockets.forEach((socket) => console.log('HEY', socket.email));
  const receiverSocketIndex = sockets.findIndex(
    (socket) => socket.email == receiverEmail
  );
  if (receiverSocketIndex != -1) {
    const receiverSocket = sockets[receiverSocketIndex];
    console.log('CHannels11111111111112');
    sendUserList(receiverSocket, user_list);
  }
  console.log('CHannels2222222222222222222');
  sendUserList(senderSocket, user_list);
}
module.exports = { subscribeUser, newMessage, checkedMessage };
