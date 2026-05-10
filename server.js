const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Fake database - users yaha save honge
let users = [];

// Root route - check karne ke liye server chalu hai ya nahi
app.get('/', (req, res) => {
  res.json({ message: 'FunTalk Backend Running!' });
});

// 1. SIGNUP ROUTE
app.post('/signup', (req, res) => {
  const { email, password, name, googleId } = req.body;

  if (!email ||!password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  // Check if user exists
  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Create new user
  const newUser = {
    userId: Date.now().toString(),
    email: email,
    password: password,
    name: name || email.split('@')[0],
    googleId: googleId || null,
    coins: 50,
    createdAt: new Date()
  };

  users.push(newUser);

  res.json({
    userId: newUser.userId,
    email: newUser.email,
    name: newUser.name,
    coins: newUser.coins
  });
});

// 2. LOGIN ROUTE
app.post('/login', (req, res) => {
  const { email, password, googleId, name } = req.body;

  let user;

  // Google login case
  if (googleId) {
    user = users.find(u => u.googleId === googleId || u.email === email);
    // Agar nahi mila to auto signup
    if (!user) {
      user = {
        userId: Date.now().toString(),
        email: email,
        name: name || email.split('@')[0],
        googleId: googleId,
        coins: 50,
        createdAt: new Date()
      };
      users.push(user);
    }
  }
  // Email login case
  else {
    user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  }

  res.json({
    userId: user.userId,
    email: user.email,
    name: user.name,
    coins: user.coins
  });
});

// 3. GET USER DATA
app.get('/user/:userId', (req, res) => {
  const user = users.find(u => u.userId === req.params.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(Server running on port ${PORT});
});
