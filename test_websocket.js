import WebSocket from 'ws';

console.log('Connecting to WebSocket server...');
const ws = new WebSocket('ws://localhost:5000/ws?organizationId=2');

ws.on('open', function open() {
  console.log('Connected to WebSocket server');
  ws.send(JSON.stringify({
    event: 'activity_update',
    userId: 1,
    organizationId: 2,
    activity: {
      application: 'Test Application',
      title: 'Test Window',
      website: 'example.com',
      duration: 60,
      startTime: new Date(Date.now() - 60000),
      endTime: new Date(),
      isActive: true,
      category: 'productive'
    }
  }));
  
  console.log('Sent activity update');
  
  // Wait a bit and then close
  setTimeout(() => {
    ws.close();
    console.log('Connection closed');
    process.exit(0);
  }, 3000);
});

ws.on('message', function incoming(data) {
  console.log('Received message:', data.toString());
});

ws.on('error', function error(err) {
  console.error('WebSocket error:', err);
  process.exit(1);
});

console.log('Waiting for events for 3 seconds...');