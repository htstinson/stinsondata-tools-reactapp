// admin.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BlockedGrid from '../../components/blocked/BlockedGrid.jsx';
import UserGrid from '../../components/user/UserGrid.jsx';
import RoleGrid from '../../components/roles/RoleGrid';
import PermissionGrid from '../../components/permissions/PermssionGrid';
import RolePermissionGrid from '../../components/rolepermissions/RolePermssionGrid';

import UserSubscriberGrid from '../user_subscriber/UserSubscriberGrid.jsx'
import UserSubscriberRoleGrid from '../user_subscriber_role/UserSubscriberRoleGrid.jsx'
import SubscriberGrid from '../subscriber/SubscriberGrid.jsx';
                                        
import Navbar from '../../components/Navbar.jsx';

import { RefreshProvider } from '../../context/RefreshContext.jsx';
import { SelectionProvider } from '../../context/SelectionContext.jsx';

import  ItemGrid  from '../../components/item/ItemGrid.jsx';

const Admin = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <RefreshProvider>
      <SelectionProvider>
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
            <SubscriberGrid />
            <UserSubscriberGrid />
            <UserSubscriberRoleGrid />
            <RoleGrid />
            <PermissionGrid />
            <RolePermissionGrid/>
            <ItemGrid />
          </main>
        </div>
      </SelectionProvider>
    </RefreshProvider>
  );
};

export default Admin;