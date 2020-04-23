import socketIOClient from 'socket.io-client';

const ENDPOINT = 'http://localhost:5000';

let socket;
console.log('I am socket!!!!!!!!!!!!!!!!!');
export function getUserList(handleGetUserList, email) {
  socket = socketIOClient(ENDPOINT);
  socket.emit('subscribe', { email });
  socket.on('get-userlist', handleGetUserList);
}
export function subscribe(email) {
  socket = socketIOClient(ENDPOINT);
  socket.emit('subscribe', { email });
}
export function sendNewMessage(senderEmail, receiverEmail, message) {
  socket.emit('new-message', { senderEmail, receiverEmail, message });
}
export function checkedMessage(senderEmail, receiverEmail) {
  socket.emit('checked-message', { senderEmail, receiverEmail });
}
export function disconnect() {
  if (socket) socket.emit('disconnected');
}
export function getChannels(handleGetChannels) {
  socket.on('get-channels', handleGetChannels);
}
export function newChannel(email) {
  socket.emit('new-channel', { email });
}
