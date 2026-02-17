import React from 'react';
import { AuthProvider, useAuth } from './components/context/AuthContext';
import { LoginForm } from './components/LoginForm/LoginForm';
import { ProductList } from './components/ProductList/ProductList';

const AppContent: React.FC = () => {
  const { user, token, logout } = useAuth();

  if (!token || !user) {
    return <LoginForm />;
  }

  return (
    <div style={{ maxWidth: 960, margin: '20px auto', padding: 16 }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 20,
          alignItems: 'center',
        }}
      >
        <div>
          Привет, <b>{user.firstName} {user.lastName}</b>!
        </div>
        <button
          onClick={logout}
          style={{ padding: '6px 12px', cursor: 'pointer' }}
        >
          Выйти
        </button>
      </header>

      <ProductList />
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;