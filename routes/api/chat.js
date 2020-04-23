const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_ACCESS_TOKEN;
const serviceSID = process.env.TWILIO_CHAT_SERVICE_SID;
const client = require('twilio')(accountSid, authToken);
const User = require('../../models/User');

router.post('/enable-reachability', (req, res) => {
  client.chat
    .services(serviceSID)
    .update({ reachabilityEnabled: true })
    .then((service) => res.send(service));
});
router.post('/users', (req, res) => {
  client.chat
    .services(serviceSID)
    .users.list({ limit: 20 })
    .then((users) => res.send(users));
});

router.post('/new-user', (req, res) => {
  const { email, name } = req.body;
  client.chat
    .services(serviceSID)
    .users.create({ identity: email, friendlyName: name })
    .catch((error) => console.log(error))
    .then((user) => {
      console.log(user.sid);
      res.send({ status: 'OK' });
    });
});

router.post('/set-online', (req, res) => {
  client.chat
    .services(serviceSID)
    .users('USc12b28d53d214160a5c446aa78848cd5')
    .update({ isOnline: false })
    .catch((error) => console.log(error))
    .then((user) => res.send(user));
});

router.post('/create-channel', async (req, res) => {
  const { senderEmail, receiverEmail, senderName, receiverName } = req.body;
  let channels = [];
  const sender = await User.findOne({ email: senderEmail });
  const receiver = await User.findOne({ email: receiverEmail });
  if (sender) {
    channels = sender.channels;
    channels.push({
      name: senderEmail + receiverEmail,
      friendEmail: receiverEmail,
      friendName: receiverName,
      lastmsg: '',
      unchecked: 0,
      time: Date.now()
    });
    await User.updateOne({ email: senderEmail }, { channels });
  }
  if (receiver) {
    channels = receiver.channels;
    channels.push({
      name: senderEmail + receiverEmail,
      friendEmail: senderEmail,
      friendName: senderName,
      lastmsg: '',
      unchecked: 'new',
      time: Date.now()
    });
    await User.updateOne({ email: receiverEmail }, { channels });
  }
  res.send({ status: 'success' });
});
router.post('/new-message', async (req, res) => {
  const { receiverEmail, senderEmail, message } = req.body;
  const user = await User.findOne({ email: receiverEmail });
  let channels;
  if (user) {
    channels = user.channels;
    const index = channels.findIndex((channel) => channel.user == senderEmail);
    const unchecked = channels[index].unchecked;
    channels[index].lastmsg = message;
    channels[index].unchecked =
      (unchecked == 0 || unchecked == 'new' ? 0 : unchecked) + 1;
    channels[index].date = Date.now();
    await User.updateOne({ email: receiverEmail }, { channels });
  }
  console.log(date);
  res.send({ status: 'success' });
});

router.post('/checked-message', async (req, res) => {
  const { receiver, sender } = req.body;
  const user = await User.findOne({ email: receiver });
  let channels;
  if (user) {
    channels = user.channels;
    const index = channels.findIndex((channel) => channel.user == sender);
    channels[index].unchecked = 0;
    await User.updateOne({ email: receiver }, { channels });
  }
  console.log(date);
  res.send({ status: 'success' });
});
module.exports = router;
