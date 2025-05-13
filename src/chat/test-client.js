const { io } = require('socket.io-client');

// Change the URL and port to match your NestJS app
const socket = io('http://localhost:3000');

// Listen for connection
socket.on('connect', () => {
  console.log('✅ Connected to WebSocket server');

  // Send a test message
  socket.emit('send_message', {
    senderId: 1,
    receiverId: 2,
    content: 'Hello from test client!',
  });
});

// Listen for new messages
socket.on('new_message', (message) => {
  console.log('📩 New message received:', message);
});

// Listen for errors
socket.on('connect_error', (err) => {
  console.error('❌ Connection error:', err.message);
});
