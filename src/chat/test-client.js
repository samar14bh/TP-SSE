// test-client.js
const { io } = require('socket.io-client');

const socket = io('http://localhost:3000'); // Replace with your NestJS server port

socket.on('connect', () => {
  console.log('Connected to WebSocket server');

  // Send test message
  socket.emit('send_message', {
    chatId: 1,
    senderId: '1', // Replace with actual UUIDs
    text: 'Hello from test client!',
  });
});

socket.on('new_message', (message) => {
  console.log('New message received:', message);
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket server');
});
