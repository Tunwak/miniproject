const express = require('express');
const { connectMongo, connectMySQL, getDbType, toObjectId } = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const dbType = getDbType();

    if (dbType === 'mongo') {
      const db = await connectMongo();
      const tasks = await db.collection('tasks').find({ userId: req.user.id }).toArray();

      return res.json({ tasks: tasks.map(task => ({ ...task, id: task._id.toString() })) });
    }

    const pool = await connectMySQL();
    const [rows] = await pool.query(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    return res.json({ tasks: rows });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const dbType = getDbType();

    if (dbType === 'mongo') {
      const db = await connectMongo();
      const task = {
        userId: req.user.id,
        title,
        description: description || '',
        createdAt: new Date(),
      };

      const result = await db.collection('tasks').insertOne(task);
      return res.status(201).json({
        message: 'Task created',
        task: { ...task, id: result.insertedId.toString() },
      });
    }

    const pool = await connectMySQL();
    const [result] = await pool.query(
      'INSERT INTO tasks (user_id, title, description) VALUES (?, ?, ?)',
      [req.user.id, title, description || '']
    );

    return res.status(201).json({
      message: 'Task created',
      task: {
        id: result.insertId,
        user_id: req.user.id,
        title,
        description: description || '',
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const dbType = getDbType();

    if (dbType === 'mongo') {
      const db = await connectMongo();
      await db.collection('tasks').deleteOne({ _id: toObjectId(req.params.id), userId: req.user.id });
      return res.json({ message: 'Task deleted' });
    }

    const pool = await connectMySQL();
    await pool.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    return res.json({ message: 'Task deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
});

module.exports = router;
