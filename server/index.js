const express = require('express');
const connectDB = require('../config/db');
const path = require('path');
const config = require('./config');
const { chatToken } = require('./tokens');
const app = express();

const sendTokenResponse = (token, res) => {
  res.set('Content-Type', 'application/json');
  res.send(
    JSON.stringify({
      token: token.toJwt()
    })
  );
};

// Connect Database
connectDB();

// Init Middleware
app.use(express.json());

// Define Routes
app.use('/api/users', require('../routes/api/users'));
app.use('/api/auth', require('../routes/api/auth'));
app.use('/api/profile', require('../routes/api/profile'));
app.use('/api/posts', require('../routes/api/posts'));
app.use('/api/chat', require('../routes/api/chat'));

app.post('/chat/token', (req, res) => {
  const identity = req.body.identity;
  const token = chatToken(identity, config);
  sendTokenResponse(token, res);
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;
const http = require('http').Server(app);
const socketServer = require('./socket');

http.listen(PORT, () => console.log(`Server started on port ${PORT}`));
SocketServer(http);
