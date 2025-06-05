import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const AuthForm = () => {
  const { login, register, error, loading } = useContext(AuthContext);
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'login') {
      await login(form.email, form.password);
    } else {
      await register(form.name, form.email, form.password, form.password_confirmation);
    }
  };

  return (
    <div style={{
      maxWidth: 400,
      margin: '80px auto',
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
      padding: 32,
      textAlign: 'center',
    }}>
      <h2 style={{ fontWeight: 700, fontSize: 24, marginBottom: 24 }}>
        {mode === 'login' ? 'Sign In' : 'Create Account'}
      </h2>
      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          style={inputStyle}
        />
        {mode === 'register' && (
          <input
            type="password"
            name="password_confirmation"
            placeholder="Confirm Password"
            value={form.password_confirmation}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: '#5F43E9',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 16,
            marginTop: 12,
            cursor: 'pointer',
          }}
        >
          {mode === 'login' ? 'Sign In' : 'Register'}
        </button>
        {error && <div style={{ color: 'red', marginTop: 16 }}>{error}</div>}
      </form>
      <div style={{ marginTop: 24, fontSize: 15 }}>
        {mode === 'login' ? (
          <>
            Don&apos;t have an account?{' '}
            <button type="button" onClick={() => setMode('register')} style={linkBtnStyle}>
              Register
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button type="button" onClick={() => setMode('login')} style={linkBtnStyle}>
              Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '14px',
  borderRadius: 5,
  border: '1px solid #ddd',
  fontSize: 15,
};

const linkBtnStyle = {
  background: 'none',
  border: 'none',
  color: '#5F43E9',
  fontWeight: 600,
  cursor: 'pointer',
  textDecoration: 'underline',
  fontSize: 15,
  padding: 0,
};

export default AuthForm; 