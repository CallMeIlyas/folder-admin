import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <div className="p-6 font-poppinsRegular">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 font-poppinsBold">Welcome to Content Management</h1>
        <p className="text-gray-600 mt-2 font-poppinsRegular">Manage your website content easily</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 font-poppinsBold">Quick Start</h3>
          <p className="text-gray-600 mb-4 font-poppinsRegular">
            Start managing your website content by selecting one of the sections from the sidebar.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 font-poppinsBold">Coming Soon</h3>
          <p className="text-gray-600 mb-4 font-poppinsRegular">
            Image Management, Text Editor, Video Upload, and more content management features.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 font-poppinsBold">Need Help?</h3>
          <p className="text-gray-600 mb-4 font-poppinsRegular">
            Contact developer for assistance with content management setup.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
