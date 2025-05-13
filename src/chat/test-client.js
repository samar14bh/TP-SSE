const { io } = require('socket.io-client');

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('✅ Connected to server');

  // Send a message after connecting
  socket.emit('send_message', {
    author: 'TestUser',
    content: 'Hello from Node.js test client!',
  });
});

// Listen for new messages
socket.on('new_message', (msg) => {
  console.log('📩 New message received:', msg);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
});
