import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaImage, FaEdit, FaVideo, FaSignOutAlt, FaBoxOpen, FaFileAlt } from 'react-icons/fa';

const AdminSidebar: React.FC = () => {
  const location = useLocation();

  const menu = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { path: '/admin/images', label: 'Images', icon: <FaImage /> },
    { path: '/admin/videos', label: 'Videos', icon: <FaVideo /> },
    { path: '/admin/text', label: 'Text', icon: <FaEdit /> },
    { path: '/admin/invoice', label: 'Invoice', icon: <FaFileAlt /> },
    { path: "/admin/product", label: 'Product', icon: <FaBoxOpen /> },
  ];

  const logout = () => {
    localStorage.clear();
    window.location.href = '/admin/login';
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white p-4">
      {menu.map(item => (
        <Link
          key={item.path}
          to={item.path}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
            location.pathname === item.path ? 'bg-[#dcbec1] text-gray-900' : 'text-gray-300'
          }`}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}

      <button
        onClick={logout}
        className="flex items-center gap-3 px-4 py-3 text-red-400 mt-4"
      >
        <FaSignOutAlt />
        Logout
      </button>
    </aside>
  );
};

export default AdminSidebar;
