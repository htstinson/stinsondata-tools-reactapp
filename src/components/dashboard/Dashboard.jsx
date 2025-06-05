import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@progress/kendo-react-buttons';
import ItemGrid from '../../components/item/ItemGrid.jsx';
import AccountGrid from '../../components/account/AccountGrid.jsx';
import Navbar from '../../components/Navbar.jsx';
import CustomerGrid from '../customer/CustomerGrid.jsx';
import ContactGrid from '../contact/ContactGrid.jsx';

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Navbar />
      <nav className="bg-white shadow mb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Dashboard</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <ItemGrid />
        <CustomerGrid onCustomerSelect={handleCustomerSelect} />
        <ContactGrid selectedCustomer={selectedCustomer} />
        <AccountGrid/>
      </main>
    </div>
  );
};

export default Dashboard;