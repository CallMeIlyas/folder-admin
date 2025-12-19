import React from 'react';

const AdminNavbar: React.FC = () => {
  const user = JSON.parse(localStorage.getItem('admin_user') || '{}');

  return (
    <nav className="bg-white border-b px-6 py-4 flex justify-end">
      <span>{user.name || 'Admin'}</span>
    </nav>
  );
};

export default AdminNavbar;
