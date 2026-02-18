import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from './components/context/AuthContext';
import { LoginForm } from './components/LoginForm/LoginForm';
import { ProductList } from './components/ProductList/ProductList';
const AppContent = () => {
  const { user, loading } = useAuth();
  const [isLoggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (!loading) {
      setLoggedIn(!!user);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 24,
          fontWeight: "bold",
        }}
      >
        Загрузка...
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={() => setLoggedIn(true)} />;
  }

  return <ProductList />;
};

export const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;