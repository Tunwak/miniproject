const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDbType, connectMongo, connectMySQL } = require('../db');

const router = express.Router();

function createToken(user) {
  return jwt.sign(
    { id: user._id ? user._id.toString() : user.id, email: user.email },
    process.env.JWT_SECRET || 'supersecretkey',
    { expiresIn: '7d' }
  );
}

async function findUserByEmail(email) {
  const dbType = getDbType();

  if (dbType === 'mongo') {
    const db = await connectMongo();
    return db.collection('users').findOne({ email: email.toLowerCase() });
  }

  const pool = await connectMySQL();
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
  return rows[0] || null;
}

async function createUserRecord({ name, email, password }) {
  const dbType = getDbType();

  if (dbType === 'mongo') {
    const db = await connectMongo();
    const result = await db.collection('users').insertOne({
      name,
      email: email.toLowerCase(),
      password,
      createdAt: new Date(),
    });

    return { _id: result.insertedId, name, email: email.toLowerCase() };
  }

  const pool = await connectMySQL();
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email.toLowerCase(), password]
  );

  return { id: result.insertId, name, email: email.toLowerCase() };
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUserRecord({
      name,
      email,
      password: hashedPassword,
    });

    const token = createToken(user);

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id ? user._id.toString() : user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = createToken(user);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id ? user._id.toString() : user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

module.exports = router;
