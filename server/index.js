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

// Almacenar usuarios conectados
const users = new Map();
const messages = new Map();

io.on('connection', (socket) => {
  console.log('✅ Usuario conectado:', socket.id);
  
  // Registrar usuario
  socket.on('register', (userData) => {
    users.set(userData.id, {
      socketId: socket.id,
      ...userData
    });
    console.log(`📝 Usuario registrado: ${userData.id}`);
    
    // Notificar a otros usuarios
    socket.broadcast.emit('user-online', userData.id);
  });
  
  // Manejar mensajes
  socket.on('send-message', (data) => {
    const { to, from, message, encrypted } = data;
    
    // Buscar el socket del destinatario
    const recipient = users.get(to);
    
    if (recipient) {
      // Enviar mensaje al destinatario
      io.to(recipient.socketId).emit('receive-message', {
        from,
        message,
        encrypted,
        timestamp: Date.now()
      });
      
      console.log(`💬 Mensaje enviado de ${from} a ${to}`);
    } else {
      // Guardar mensaje para cuando el usuario se conecte
      if (!messages.has(to)) {
        messages.set(to, []);
      }
      messages.get(to).push(data);
      console.log(`📥 Mensaje guardado para ${to} (offline)`);
    }
  });
  
  // Verificar mensajes pendientes
  socket.on('check-messages', (userId) => {
    if (messages.has(userId)) {
      const pendingMessages = messages.get(userId);
      pendingMessages.forEach(msg => {
        socket.emit('receive-message', msg);
      });
      messages.delete(userId);
      console.log(`📤 Entregados ${pendingMessages.length} mensajes a ${userId}`);
    }
  });
  
  // Desconexión
  socket.on('disconnect', () => {
    // Buscar qué usuario se desconectó
    for (const [userId, userData] of users.entries()) {
      if (userData.socketId === socket.id) {
        users.delete(userId);
        socket.broadcast.emit('user-offline', userId);
        console.log(`👋 Usuario desconectado: ${userId}`);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 WebSocket listo para conexiones`);
});