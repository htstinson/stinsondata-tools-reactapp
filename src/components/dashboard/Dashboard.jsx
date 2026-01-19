import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ChevronRight, ChevronDown } from 'lucide-react';
import Navbar from '../../components/Navbar.jsx';

import CustomerGrid from '../customer/CustomerGrid.jsx';
import ContactGrid from '../contact/ContactGrid.jsx';
import SubscriberItemGrid from '../subscriber_items/SubscriberItemGrid.jsx';
import SearchEngineGrid from '../searchengines/SearchEnginesGrid.jsx';
import SearchDefinitionGrid from '../search_definitions/SearchDefinitionGrid.jsx';
import SearchDefinitionEngineGrid from '../search_definition_engines/SearchDefinitionEnginesGrid.jsx';
import SearchResultsGrid from '../search_results/SearchResultsGrid.jsx'
import MentionsGrid from '../mentions/MentionsGrid.jsx'
import { useSubscription } from '../../components/Navbar.jsx';

const Dashboard = () => {
  const navigate = useNavigate();
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('customers');
  const [calibrateOpen, setCalibrateOpen] = useState(true);
  
  // Get selected subscription from context
  const { selectedSubscription, selectSubscription } = useSubscription();
  
  // State to track the selected customer
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // State to track the selected search definition engine
  const [selectedSearchDefinitionEngine, setSelectedSearchDefinitionEngine] = useState(null);
  
  // Log the subscription when component mounts or when it changes
  useEffect(() => {
    if (selectedSubscription) {
      console.log('Dashboard loaded with subscription:', selectedSubscription);
      console.log('Subscriber ID:', selectedSubscription.subscriber_id);
      console.log('Subscriber Name:', selectedSubscription.subscriber_name);
    }
  }, [selectedSubscription]);
  
  // Handler for when subscription is selected
  const handleSubscriptionSelect = (subscription) => {
    selectSubscription({
      subscriber_id: subscription.subscriber_id,
      subscriber_name: subscription.subscriber_name
    });
    setSelectedCustomer(null);
    setSelectedSearchDefinitionEngine(null);
  };
  
  // Handler for when customer is selected
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
  };
  
  // Handler for when search definition engine is selected
  const handleSearchDefinitionEngineSelect = (searchDefinitionEngine) => {
    setSelectedSearchDefinitionEngine(searchDefinitionEngine);
  };

  const topMenuItems = [
    { id: 'customers', label: 'Customers', icon: '👥' },
    { id: 'contacts', label: 'Contacts', icon: '📇' },
    { id: 'subscriber-items', label: 'Services', icon: '📦' },
  ];

  const calibrateItems = [
    { id: 'search-engines', label: 'Engines', icon: '🔍' },
    { id: 'search-definitions', label: 'Definition', icon: '📋' },
    { id: 'search-definition-engines', label: 'Assignments', icon: '📋' },
    { id: 'search-results', label: 'Results', icon: '📊' },
    { id: 'mentions', label: 'Mentions', icon: '💬' },
  ];

  const handleMenuClick = (itemId) => {
    setActiveSection(itemId);
    
    // On mobile, close sidebar after selection
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="bg-white shadow mb-4 pt-0 fixed top-16 left-0 right-0 z-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}" >
 
      {/* Original Navbar Component */}
      <Navbar />
      
      {/* Dashboard Header with Sidebar Toggle - Below original navbar */}
      <nav className={`bg-white shadow mb-4 pt-0 fixed top-16 left-0 right-0 z-20 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-start h-16">
            <div className="flex items-center gap-4">
              {/* Sidebar Toggle Button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              <h1 className="text-xl font-bold">Dashboard</h1>
              {selectedSubscription && (
                <span className="ml-4 text-sm text-gray-600 hidden sm:inline">
                  Current Subscription: <span className="font-semibold text-blue-600">{selectedSubscription.subscriber_name}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-lg z-40 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Navigation</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {/* Top Level Menu Items */}
              {topMenuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleMenuClick(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeSection === item.id
                        ? 'bg-blue-50 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="flex-1 text-left">{item.label}</span>
                    {activeSection === item.id && <ChevronRight size={18} />}
                  </button>
                </li>
              ))}

              {/* Calibrate Collapsible Section */}
              <li className="mt-4">
                <button
                  onClick={() => setCalibrateOpen(!calibrateOpen)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all font-medium"
                >
                  <span className="text-xl">⚙️</span>
                  <span className="flex-1 text-left">Calibrate</span>
                  {calibrateOpen ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  )}
                </button>

                {/* Calibrate Sub-items */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    calibrateOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <ul className="ml-4 mt-1 space-y-1">
                    {calibrateItems.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => handleMenuClick(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
                            activeSection === item.id
                              ? 'bg-blue-50 text-blue-600 font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-base">{item.icon}</span>
                          <span className="flex-1 text-left text-sm">{item.label}</span>
                          {activeSection === item.id && <ChevronRight size={16} />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t">
            <div className="text-xs text-gray-500">
              Active: <span className="font-medium text-gray-700">
                {topMenuItems.find(item => item.id === activeSection)?.label || 
                 calibrateItems.find(item => item.id === activeSection)?.label}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`pt-12 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        <div className="flex justify-start bg-white py-0 px-0 sm:px-6 lg:px-4">
          
          {/* All grids remain mounted, only display changes */}
          <div className={`w-full bg-white ${activeSection === 'customers' ? 'block' : 'hidden'} pt-4`}>
            <CustomerGrid 
              selectedSubscription={selectedSubscription}
              onCustomerSelect={handleCustomerSelect} 
            />
          </div>

          <div className={`w-full ${activeSection === 'contacts' ? 'block' : 'hidden'} pt-4`}>
            <ContactGrid selectedCustomer={selectedCustomer} />
          </div>

          <div className={`w-full ${activeSection === 'subscriber-items' ? 'block' : 'hidden'} pt-4`}>
            <SubscriberItemGrid 
              selectedSubscription={selectedSubscription}
              onSubscriptionSelect={handleSubscriptionSelect}
            />
          </div>

          <div className={`w-full ${activeSection === 'search-engines' ? 'block' : 'hidden'} pt-4`}>
            <SearchEngineGrid selectedSubscription={selectedSubscription} />
          </div>

          <div className={`w-full ${activeSection === 'search-definitions' ? 'block' : 'hidden'} pt-4`}>
            <SearchDefinitionGrid selectedSubscription={selectedSubscription} />
          </div>

          <div className={`w-full ${activeSection === 'search-definition-engines' ? 'block' : 'hidden'} pt-4`}>
            <SearchDefinitionEngineGrid 
              selectedSubscription={selectedSubscription}
              onSelectionChange={handleSearchDefinitionEngineSelect} 
            />
          </div>

          <div className={`w-full ${activeSection === 'search-results' ? 'block' : 'hidden'} pt-4`}>
            <SearchResultsGrid
              selectedSubscription={selectedSubscription}
              selectedSearchDefinitionEngine={selectedSearchDefinitionEngine}
            />
          </div>

          <div className={`w-full ${activeSection === 'mentions' ? 'block' : 'hidden'} pt-4`}>
            <MentionsGrid />
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default Dashboard;