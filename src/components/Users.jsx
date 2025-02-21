import React from 'react';
import { Users as UsersIcon } from 'lucide-react';
import Navbar from './Navbar';
import UserGrid from './UserGrid';

const Users = () => {
  return (
    <div className="p-6">
         <Navbar />
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <UsersIcon className="h-8 w-8 text-blue-500" />
          <h1 className="text-2xl font-bold text-gray-900">System Users</h1>
        </div>
        <p className="mt-2 text-gray-600">Manage and view all system users</p>
      </div>

      {/* Main Content Area - Ready for your grid */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {/* Your grid component will go here */}
          <UserGrid/>
        </div>
      </div>
    </div>
  );
};

export default Users;