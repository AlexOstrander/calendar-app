import React, { useContext } from 'react';
import CalendarPage from './components/CalendarPage';
import { AuthProvider, AuthContext } from './context/AuthContext';
import AuthForm from './components/AuthForm';

function AppContent() {
  const { user, logout } = useContext(AuthContext);
  return user ? (
    <>
      <div style={{ textAlign: 'right', padding: '16px 32px 0 0' }}>
        <span style={{ marginRight: 16, fontWeight: 500 }}>Hi, {user.name}</span>
        <button onClick={logout} style={{ background: '#eee', border: 'none', borderRadius: 5, padding: '6px 16px', fontWeight: 600, cursor: 'pointer' }}>
          Log out
        </button>
      </div>
      <CalendarPage />
    </>
  ) : (
    <AuthForm />
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
