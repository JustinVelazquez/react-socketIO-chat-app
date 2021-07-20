const express = require('express');
const app = express();
const server = require('http').createServer(app);
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

const io = require('socket.io')(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

dotenv.config();

app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('hello world');
});

const PORT = process.env.PORT || 3001;

io.on('connection', (socket) => {
  socket.emit('me', socket.id);

  socket.on('disconnect', () => {
    socket.broadcast.emit('callended');
  });

  socket.on('calluser', ({ userToCall, signalData, from, name }) => {
    io.to(userToCall).emit('calluser', { signal: signalData, from, name });
  });

  socket.on('answercall', (data) => {
    io.to(data.to).emit('callaccepted', data.signal);
  });
});

server.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
