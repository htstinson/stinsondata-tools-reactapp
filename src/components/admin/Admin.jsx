import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@progress/kendo-react-buttons';
import BlockedGrid from '../../components/blocked/BlockedGrid.jsx';
import UserGrid from '../../components/user/UserGrid.jsx';
import RoleGrid from '../../components/roles/RoleGrid';
import PermissionGrid from '../../components/permissions/PermssionGrid';
import UserCustomerGrid from '../../components/usercustomer/UserCustomerGrid.jsx'

import Navbar from '../../components/Navbar.jsx';

const Admin = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Navbar />
      <nav className="bg-white shadow mb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Admin</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <UserGrid />
        <UserCustomerGrid />
        <RoleGrid />
        <PermissionGrid />
        <BlockedGrid />
      </main>
    </div>
  );
};

export default Admin;