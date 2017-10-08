const express = require('express');
const http = require('http');
const url = require('url');
const WebSocket = require('ws');

const app = express();
app.use(express.static('public'));

const messages = [];

app.get('/messages', (req, res) => {
  res.json({ messages });
})

const server = http.createServer(app);

const isOpen = ({ readyState }) => readyState === WebSocket.OPEN;
const socketServer = new WebSocket.Server({ server });
socketServer.on('connection', (ws, req) => {
  ws.on('message', (message) => {
    console.log(`socket server message ${message} form user ${req}`);
    socketServer.clients.forEach(client => {
      // don't rebroadcast to yourself!
      if (client !== ws && isOpen(client)) {
        console.log(`[webSocket] sending to all: ${message}`);
        messages.push(message);
        client.send(message);
      }
    });
  });
});

socketServer.broadcast = function broadcast (data) {
  socketServer.clients.forEach(client => {
    if (isOpen(client)) {
      console.log(`[webSocket] broadcasting: ${message}`);
      messages.push(message);
      client.send(data);
    }
  })
}

const port = 30004;
server.listen(port, () => {
  console.log(`I am listening on port ${port}`);
});

