const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { readDB, writeDB } = require('../db');
const { verifyToken, JWT_SECRET } = require('../middleware/auth');

// Helper to validate institutional email domain (@bitsathy.ac.in)
const isBitsathyEmail = (email) => {
  return email && email.toLowerCase().trim().endsWith('@bitsathy.ac.in');
};

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const cleanEmail = email.toLowerCase().trim();

  // Domain check for @bitsathy.ac.in
  if (!isBitsathyEmail(cleanEmail)) {
    return res.status(403).json({ 
      message: 'Access restricted! Only institutional email addresses ending with "@bitsathy.ac.in" are authorized to access this portal.' 
    });
  }

  const db = readDB();
  const user = db.users.find(u => u.email.toLowerCase().trim() === cleanEmail);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials. User account not found.' });
  }

  // Password verification (supports bcrypt hash comparison, plain text, and demo password)
  let isPasswordValid = false;
  try {
    isPasswordValid = bcrypt.compareSync(password, user.password);
  } catch (err) {
    // If user.password is plain text
    isPasswordValid = user.password === password;
  }

  if (!isPasswordValid && (user.password === password || password === 'password123')) {
    isPasswordValid = true;
  }

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid password. Please check your credentials.' });
  }

  const tokenPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

  const { password: _, ...userWithoutPassword } = user;
  res.json({
    token,
    user: userWithoutPassword
  });
});

// POST /api/auth/register (Student Registration)
router.post('/register', (req, res) => {
  const { name, email, password, phone, college, course, year, marksPercentage, familyIncome, category, bankDetails } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  const cleanEmail = email.toLowerCase().trim();

  if (!isBitsathyEmail(cleanEmail)) {
    return res.status(403).json({ 
      message: 'Registration restricted! Only institutional email addresses ending with "@bitsathy.ac.in" are permitted to register.' 
    });
  }

  const db = readDB();
  const existingUser = db.users.find(u => u.email.toLowerCase().trim() === cleanEmail);
  if (existingUser) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }

  const newUser = {
    id: `u-student-${Date.now()}`,
    name,
    email: cleanEmail,
    password: bcrypt.hashSync(password, 10),
    role: 'student',
    phone: phone || '',
    college: college || 'Bannari Amman Institute of Technology (BIT Sathy)',
    course: course || '',
    year: year || '',
    marksPercentage: parseFloat(marksPercentage) || 0,
    familyIncome: parseFloat(familyIncome) || 0,
    category: category || 'General',
    bankDetails: bankDetails || { accountNo: '', ifscCode: '', bankName: '', accountHolder: name },
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDB(db);

  const token = jwt.sign(
    { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  const { password: _, ...userWithoutPassword } = newUser;
  res.status(201).json({
    token,
    user: userWithoutPassword
  });
});

// GET /api/auth/me
router.get('/me', verifyToken, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

module.exports = router;
