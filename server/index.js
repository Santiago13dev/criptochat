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
    try {
      if (!userData || !userData.id) {
        console.log('⚠️ Datos de usuario inválidos');
        socket.emit('error', 'Datos de usuario requeridos');
        return;
      }

      users.set(userData.id, {
        socketId: socket.id,
        ...userData
      });
      console.log(`📝 Usuario registrado: ${userData.id}`);
      
      // Notificar a otros usuarios
      socket.broadcast.emit('user-online', userData.id);
    } catch (error) {
      console.error('Error registrando usuario:', error);
      socket.emit('error', 'Error en el registro');
    }
  });
  
  // Manejar mensajes
  socket.on('send-message', (data) => {
    try {
      const { to, from, message, encrypted } = data;
      
      if (!to || !from || !message) {
        console.log('⚠️ Datos de mensaje incompletos');
        socket.emit('error', 'Datos de mensaje requeridos');
        return;
      }
      
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
        messages.get(to).push({
          ...data,
          timestamp: Date.now()
        });
        console.log(`📥 Mensaje guardado para ${to} (offline)`);
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      socket.emit('error', 'Error enviando mensaje');
    }
  });
  
  // Verificar mensajes pendientes
  socket.on('check-messages', (userId) => {
    try {
      if (!userId) {
        socket.emit('error', 'ID de usuario requerido');
        return;
      }

      if (messages.has(userId)) {
        const pendingMessages = messages.get(userId);
        pendingMessages.forEach(msg => {
          socket.emit('receive-message', msg);
        });
        messages.delete(userId);
        console.log(`📤 Entregados ${pendingMessages.length} mensajes a ${userId}`);
      }
    } catch (error) {
      console.error('Error verificando mensajes:', error);
      socket.emit('error', 'Error obteniendo mensajes');
    }
  });
  
  // Desconexión
  socket.on('disconnect', () => {
    try {
      // Buscar qué usuario se desconectó
      for (const [userId, userData] of users.entries()) {
        if (userData.socketId === socket.id) {
          users.delete(userId);
          socket.broadcast.emit('user-offline', userId);
          console.log(`👋 Usuario desconectado: ${userId}`);
          break;
        }
      }
    } catch (error) {
      console.error('Error en desconexión:', error);
    }
  });

  // Manejar errores de socket
  socket.on('error', (error) => {
    console.error('Error de socket:', error);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 WebSocket listo para conexiones`);
});
