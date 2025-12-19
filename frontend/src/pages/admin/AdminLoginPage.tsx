import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLogin from '../../components/admin/auth/AdminLogin';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError('');

    if (email === 'admin@amora.com' && password === 'amora12345') {
      localStorage.setItem('admin_auth', 'true');
      localStorage.setItem('admin_user', JSON.stringify({ name: 'Admin' }));
      navigate('/admin/dashboard', { replace: true });
      setIsLoading(false);
      return true;
    }

    setError('Email atau password salah');
    setIsLoading(false);
    return false;
  };

  return <AdminLogin onLogin={handleLogin} isLoading={isLoading} error={error} />;
};

export default AdminLoginPage;
