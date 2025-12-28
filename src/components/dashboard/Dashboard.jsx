import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@progress/kendo-react-buttons';
import ItemGrid from '../../components/item/ItemGrid.jsx';
import AccountGrid from '../../components/account/AccountGrid.jsx';
import Navbar from '../../components/Navbar.jsx';
import CustomerGrid from '../customer/CustomerGrid.jsx';
import ContactGrid from '../contact/ContactGrid.jsx';
import UserSingleSubscriberGrid from '../user_subscriber/UserSingleSubscriberGrid.jsx';
import SubscriberItemGrid from '../subscriber_items/SubscriberItemGrid.jsx';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Add state to track the selected subscription
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  
  // State to track the selected customer
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Handler for when subscription is selected
  const handleSubscriptionSelect = (subscription) => {
    setSelectedSubscription(subscription);
    // Clear customer selection when subscription changes
    setSelectedCustomer(null);
  };
  
  // Handler for when customer is selected
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
  };
  
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
              <h1 className="text-xl font-bold">Dashboard</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Pass callback to UserSingleSubscriberGrid */}
        <UserSingleSubscriberGrid onSubscriptionSelect={handleSubscriptionSelect} />
        
        {/* Pass selected subscription to CustomerGrid */}
        <CustomerGrid 
          selectedSubscription={selectedSubscription}
          onCustomerSelect={handleCustomerSelect} 
        />
        
        {/* Pass selected customer to ContactGrid */}
        <ContactGrid selectedCustomer={selectedCustomer} />

        <SubscriberItemGrid 
          selectedSubscription={selectedSubscription}
          onSubscriptionSelect={handleSubscriptionSelect}
        />

      </main>
    </div>
  );
};

export default Dashboard;