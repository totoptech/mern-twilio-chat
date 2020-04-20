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

router.post('/add-user', (req, res) => {
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
  const { user1, user2 } = req.body;
  let channels = [];
  let user = await User.findOne({ email: user1 });
  if (user) {
    channels = user.channels;
    channels.push({ name: user1 + user2, user: user2 });
    await User.updateOne({ email: user1 }, { channels });
  }
  user = await User.findOne({ email: user2 });
  if (user) {
    channels = user.channels;
    channels.push({ name: user1 + user2, user: user1 });
    await User.updateOne({ email: user2 }, { channels });
  }
  res.send({ status: 'success' });
});
module.exports = router;
