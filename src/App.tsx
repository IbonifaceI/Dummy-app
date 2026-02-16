import React, { useEffect } from 'react';
import { LoginForm } from './components/LoginForm/LoginForm';
import { ProductList } from './components/ProductList/ProductList';

const App: React.FC = () => {
  const [token, setToken] = React.useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    setToken(savedToken);
  }, []);

  return token ? <ProductList /> : <LoginForm />;
};

export default App;