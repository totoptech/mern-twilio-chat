import socketIOClient from 'socket.io-client';

const ENDPOINT = 'http://localhost:5000';

const socket = socketIOClient(ENDPOINT);

export function getUserList(handleGetUserList) {
  socket.emit('get-userlist');
  socket.on('get-userlist', handleGetUserList);
}
export function subscribe(email) {
  socket.emit('subscribe', { email });
}
export function disconnect() {
  socket.emit('disconnected');
}
export function getChannels(handleGetChannels) {
  socket.on('get-channels', handleGetChannels);
}
export function newChannel(email) {
  socket.emit('new-channel', { email });
}
