const socketIo = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  // Store connected users
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // User joins with their ID
    socket.on('join', (userId) => {
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
      console.log(`👤 User ${userId} joined with socket ${socket.id}`);
      
      // Join user's personal room
      socket.join(`user:${userId}`);
    });

    // Join tenant room
    socket.on('join-tenant', (tenantId) => {
      socket.join(`tenant:${tenantId}`);
      console.log(`🏢 Socket ${socket.id} joined tenant ${tenantId}`);
    });

    // Join project room
    socket.on('join-project', (projectId) => {
      socket.join(`project:${projectId}`);
      console.log(`📁 Socket ${socket.id} joined project ${projectId}`);
    });

    // Leave project room
    socket.on('leave-project', (projectId) => {
      socket.leave(`project:${projectId}`);
      console.log(`📁 Socket ${socket.id} left project ${projectId}`);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        console.log(`👋 User ${socket.userId} disconnected`);
      }
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      socket.to(`project:${data.projectId}`).emit('user-typing', {
        userId: socket.userId,
        userName: data.userName,
        taskId: data.taskId,
      });
    });

    socket.on('stop-typing', (data) => {
      socket.to(`project:${data.projectId}`).emit('user-stop-typing', {
        userId: socket.userId,
        taskId: data.taskId,
      });
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Emit to specific user
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

// Emit to tenant
const emitToTenant = (tenantId, event, data) => {
  if (io) {
    io.to(`tenant:${tenantId}`).emit(event, data);
  }
};

// Emit to project
const emitToProject = (projectId, event, data) => {
  if (io) {
    io.to(`project:${projectId}`).emit(event, data);
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
  emitToTenant,
  emitToProject,
};