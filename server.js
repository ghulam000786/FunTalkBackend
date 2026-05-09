const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const Razorpay = require('razorpay');

const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const razorpay = new Razorpay({
  key_id: 'rzp_test_xxx',
  key_secret: 'replace_me_later'
});

const ADMIN_PASSWORD = 'Admin@123';
const users = {}; 
let waitingUser = null;

app.get('/', (req, res) => res.send('FunTalk Backend Running ✅'));

app.get('/user/:userId', (req, res) => {
  if (!users[req.params.userId]) users[req.params.userId] = { coins: 50, isAdmin: false };
  res.json(users[req.params.userId]);
});

app.post('/create-order', async (req, res) => {
  const order = await razorpay.orders.create({ amount: 4900, currency: "INR" });
  res.json(order);
});

app.post('/deduct-coins', (req, res) => {
  if (!users[req.body.userId].isAdmin) users[req.body.userId].coins -= 10;
  res.json({ success: true });
});

app.post('/admin/login', (req, res) => {
  res.json({ success: req.body.password === ADMIN_PASSWORD });
});

io.on('connection', socket => {
  socket.on('find-match', ({ userId }) => {
    if (waitingUser && waitingUser !== socket.id) {
      io.to(waitingUser).emit('match-found', { isCaller: false });
      io.to(socket.id).emit('match-found', { isCaller: true });
      waitingUser = null;
    } else {
      waitingUser = socket.id;
    }
  });
  socket.on('offer', offer => socket.broadcast.emit('offer', offer));
  socket.on('answer', answer => socket.broadcast.emit('answer', answer));
  socket.on('candidate', candidate => socket.broadcast.emit('candidate', candidate));
});

server.listen(process.env.PORT || 3001);
