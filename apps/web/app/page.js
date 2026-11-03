'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function HomePage() {
  const [mode, setMode] = useState('login');
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [taskForm, setTaskForm] = useState({ title: '', description: '' });

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      fetchTasks(savedToken);
    }
  }, []);

  async function fetchTasks(authToken) {
    const response = await fetch(`${API_URL}/tasks`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Fetch tasks failed');
    }

    const result = await response.json();
    setTasks(result.tasks || []);
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setMessage('');

    const endpoint = mode === 'register' ? 'auth/register' : 'auth/login';
    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
    };

    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.message || 'Authentication failed');
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setForm({ name: '', email: '', password: '' });
    setMessage(data.message);

    fetchTasks(data.token).catch(() => setMessage('Unable to load tasks'));
  }

  async function handleTaskSubmit(e) {
    e.preventDefault();
    if (!token) return;

    const response = await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(taskForm),
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message || 'Task creation failed');
      return;
    }

    setTaskForm({ title: '', description: '' });
    setMessage(data.message);
    fetchTasks(token).catch(() => setMessage('Unable to refresh tasks'));
  }

  async function handleDeleteTask(taskId) {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      setMessage(data.message || 'Delete failed');
      return;
    }

    setMessage(data.message);
    fetchTasks(token).catch(() => setMessage('Unable to refresh tasks'));
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    setTasks([]);
    setMessage('Logged out');
  }

  return (
    <main className="container">
      <div className="header">
        <h1 className="title">Mini Task Manager</h1>
        {user && (
          <button className="secondary" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>

      {message && <div className="status">{message}</div>}

      <div className="grid">
        <section className="card">
          {!user ? (
            <>
              <div className="tabs">
                <button
                  type="button"
                  className={`tab ${mode === 'login' ? 'active' : ''}`}
                  onClick={() => setMode('login')}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={`tab ${mode === 'register' ? 'active' : ''}`}
                  onClick={() => setMode('register')}
                >
                  Register
                </button>
              </div>

              <form className="form-box" onSubmit={handleAuthSubmit}>
                {mode === 'register' && (
                  <label>
                    Name
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </label>
                )}

                <label>
                  Email
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </label>

                <label>
                  Password
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="********"
                  />
                </label>

                <button className="primary" type="submit">
                  {mode === 'register' ? 'Create account' : 'Login'}
                </button>
              </form>
            </>
          ) : (
            <div className="form-box">
              <h2>Welcome, {user.name}</h2>
              <p>Email: {user.email}</p>
              <p>Token stored in browser for demo auth.</p>
            </div>
          )}
        </section>

        <section className="card">
          {user ? (
            <>
              <h2>Add task</h2>
              <form className="form-box" onSubmit={handleTaskSubmit}>
                <label>
                  Title
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    placeholder="Task title"
                  />
                </label>

                <label>
                  Description
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    placeholder="Task notes"
                  />
                </label>

                <button className="primary" type="submit">Save task</button>
              </form>

              <ul className="list">
                {tasks.length === 0 ? (
                  <li className="item">No tasks yet.</li>
                ) : (
                  tasks.map((task) => (
                    <li key={task.id || task._id} className="item">
                      <div className="task-text">
                        <h4>{task.title}</h4>
                        <p>{task.description || 'No description'}</p>
                      </div>
                      <button className="danger" onClick={() => handleDeleteTask(task.id || task._id)}>
                        Delete
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </>
          ) : (
            <div className="form-box">
              <h2>Demo Notes</h2>
              <p>Login or register first to create and manage tasks.</p>
              <p>This app supports both MongoDB and MySQL by setting the backend environment variable.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
