/**servidor de la aplicacion de chat en tiempo real usando express y socket.io para optimización*/

const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
const http = require('http');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Store connected users
const users = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('register', (userId) => {
    users.set(userId, socket.id);
    console.log('User registered:', userId);
  });
  
  socket.on('message', (data) => {
    const { to, message } = data;
    const recipientSocket = users.get(to);
    
    if (recipientSocket) {
      io.to(recipientSocket).emit('message', {
        from: data.from,
        message: message,
        timestamp: Date.now()
      });
    }
  });
  
  socket.on('disconnect', () => {
    for (const [userId, socketId] of users.entries()) {
      if (socketId === socket.id) {
        users.delete(userId);
        break;
      }
    }
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});