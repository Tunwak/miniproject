const { MongoClient, ObjectId } = require('mongodb');
const mysql = require('mysql2/promise');
require('dotenv').config();

const DB_TYPE = process.env.DB_TYPE || 'mongo';
let mongoClient;
let mysqlPool;

async function connectMongo() {
  if (!mongoClient) {
    mongoClient = new MongoClient(process.env.MONGO_URI);
    await mongoClient.connect();
  }

  return mongoClient.db();
}

async function connectMySQL() {
  if (!mysqlPool) {
    mysqlPool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      port: Number(process.env.MYSQL_PORT || 3306),
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'mini_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  return mysqlPool;
}

async function initDatabase() {
  if (DB_TYPE === 'mysql') {
    const pool = await connectMySQL();
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    return 'mysql';
  }

  const db = await connectMongo();
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('tasks').createIndex({ userId: 1 });
  return 'mongo';
}

function toObjectId(value) {
  if (!value) return null;
  try {
    return new ObjectId(value);
  } catch (error) {
    return value;
  }
}

module.exports = {
  initDatabase,
  connectMongo,
  connectMySQL,
  getDbType: () => DB_TYPE,
  toObjectId,
};
