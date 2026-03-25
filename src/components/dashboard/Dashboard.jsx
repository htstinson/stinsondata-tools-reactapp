{/* ── my-login-app/src/components/dashboard/Dashboard.jsx ── */}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import CustomerGrid from '../customer/CustomerGrid.jsx';
import SubscriberItemGrid from '../subscriber_items/SubscriberItemGrid.jsx';
import SearchEngineGrid from '../searchengines/SearchEnginesGrid.jsx';
import SearchDefinitionGrid from '../search_definitions/SearchDefinitionGrid.jsx';
import SearchDefinitionEngineGrid from '../search_definition_engines/SearchDefinitionEnginesGrid.jsx';
import MentionsGrid from '../mentions/MentionsGrid.jsx';
import { useSubscription } from '../../components/Navbar.jsx';
import PageLayout from '../PageLayout.jsx';
import { api } from '../../api';

const IMG2 = api.cdn('/bg2.jpeg');

const Dashboard = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen]     = useState(true);
  const [activeSection, setActiveSection] = useState('customers');
  const [calibrateOpen, setCalibrateOpen]   = useState(false);
  const [createOpen, setCreateOpen]         = useState(false);
  const [amplifyOpen, setAmplifyOpen]       = useState(false);
  const [cultivateOpen, setCultivateOpen]   = useState(false);
  const [optimizeOpen, setOptimizeOpen]     = useState(false);
  const [testOpen, setTestOpen]             = useState(false);

  const closeAllSections = () => {
    setCalibrateOpen(false);
    setCreateOpen(false);
    setAmplifyOpen(false);
    setCultivateOpen(false);
    setOptimizeOpen(false);
    setTestOpen(false);
  };

  const toggleSection = (setter, currentState) => {
    if (!sidebarOpen) return;
    closeAllSections();
    setter(!currentState);
  };

  const { selectedSubscription, selectSubscription } = useSubscription();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedSearchDefinitionEngine, setSelectedSearchDefinitionEngine] = useState(null);

  useEffect(() => {
    if (selectedSubscription) {
      console.log('Dashboard loaded with subscription:', selectedSubscription);
    }
  }, [selectedSubscription]);

  const handleSubscriptionSelect = (subscription) => {
    selectSubscription({
      subscriber_id:   subscription.subscriber_id,
      subscriber_name: subscription.subscriber_name
    });
    setSelectedCustomer(null);
    setSelectedSearchDefinitionEngine(null);
  };

  const handleCustomerSelect = (customer) => setSelectedCustomer(customer);
  const handleSearchDefinitionEngineSelect = (sde) => setSelectedSearchDefinitionEngine(sde);

  const topMenuItems = [
    { id: 'customers',        label: 'Customers', icon: '👥' },
    { id: 'subscriber-items', label: 'Services',  icon: '📦' },
  ];

  const calibrateItems = [
    { id: 'search-engines',            label: 'Engines',     icon: '🔍' },
    { id: 'search-definitions',        label: 'Definitions', icon: '📋' },
    { id: 'search-definition-engines', label: 'Jobs',        icon: '📋' },
    { id: 'mentions',                  label: 'Mentions',    icon: '💬' },
  ];

  const createItems = [
    { id: 'create-social', label: 'Social', icon: '📱' },
    { id: 'create-video',  label: 'Video',  icon: '🎬' },
    { id: 'create-web',    label: 'Web',    icon: '🌐' },
  ];

  const amplifyItems = [
    { id: 'amplify-advocate', label: 'Advocate', icon: '📣' },
  ];

  const cultivateItems = [
    { id: 'cultivate-integrations', label: 'Integrations', icon: '🔗' },
    { id: 'cultivate-crm',          label: 'CRM',          icon: '🤝' },
  ];

  const optimizeItems = [
    { id: 'optimize-schedule', label: 'Schedule', icon: '📅' },
    { id: 'optimize-measure',  label: 'Measure',  icon: '📊' },
  ];

  const testItems = [
    { id: 'test-ab', label: 'A/B', icon: '🧪' },
  ];

  const handleMenuClick = (itemId) => {
    setActiveSection(itemId);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const labelStyle = {
    opacity:    sidebarOpen ? 1 : 0,
    maxWidth:   sidebarOpen ? '200px' : '0',
    overflow:   'hidden',
    transition: 'opacity 200ms ease-in-out, max-width 200ms ease-in-out',
    whiteSpace: 'nowrap',
  };

  const navBtnStyle = (id) => ({
    gap:            sidebarOpen ? '0.75rem' : '0',
    justifyContent: sidebarOpen ? 'flex-start' : 'center',
    background:     activeSection === id ? 'var(--color-sidebar-btn-active)' : 'var(--color-sidebar-btn)',
    color:          'white',
    backdropFilter: 'blur(4px)',
    borderLeft:     activeSection === id ? '3px solid white' : '3px solid transparent',
  });

  // Shared style for collapsible section header buttons
  const sectionHeaderStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    color:      'rgba(255, 255, 255, 0.7)',
  };

  return (
    <PageLayout bgImage={IMG2}>

      {/* ── Sub-navbar ── */}
      <nav
        className="fixed left-0 right-0 transition-all duration-300"
        style={{
          top:        'var(--height-navbar)',
          zIndex:     20,
          marginLeft: sidebarOpen ? 'var(--width-sidebar)' : 'var(--width-sidebar-collapsed)',
          background: 'transparent',
          boxShadow:  'none',
        }}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <h1 className="text-xl font-bold">
              {selectedSubscription?.subscriber_name}
            </h1>
            <div className={`w-full ${activeSection === 'amplify-advocate' ? 'block' : 'hidden'}`}>
          {/* <AdvocateGrid /> */}
        </div>

        <div className={`w-full ${activeSection === 'cultivate-integrations' ? 'block' : 'hidden'}`}>
          {/* <IntegrationsGrid /> */}
        </div>

        <div className={`w-full ${activeSection === 'cultivate-crm' ? 'block' : 'hidden'}`}>
          {/* <CrmGrid /> */}
        </div>

        <div className={`w-full ${activeSection === 'optimize-schedule' ? 'block' : 'hidden'}`}>
          {/* <ScheduleGrid /> */}
        </div>

        <div className={`w-full ${activeSection === 'optimize-measure' ? 'block' : 'hidden'}`}>
          {/* <MeasureGrid /> */}
        </div>

        <div className={`w-full ${activeSection === 'test-ab' ? 'block' : 'hidden'}`}>
          {/* <AbGrid /> */}
        </div>

      </div>
        </div>
      </nav>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden"
          style={{ zIndex: 'var(--z-sidebar)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className="fixed top-0 left-0 flex flex-col"
        style={{
          height:        'calc(100vh - var(--height-footer))',
          width:         sidebarOpen ? 'var(--width-sidebar)' : 'var(--width-sidebar-collapsed)',
          zIndex:        'var(--z-sidebar)',
          background:    'var(--color-primary)',
          paddingBottom: 'var(--height-footer)',
          transition:    'width 300ms ease-in-out',
          overflow:      'hidden',
        }}
      >
        {/* Sidebar header */}
        <div
          className="flex items-center justify-end px-2"
          style={{ height: 'var(--height-sidebar)', width: '100%' }}
        >
          <span
            className="font-bold text-lg flex-1 pl-2"
            style={{ ...labelStyle, color: 'white' }}
          >
            Menu
          </span>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'white', flexShrink: 0, background: 'transparent', border: 'none' }}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <ChevronLeft size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Scrollable nav area */}
        <nav
          className="flex-1 overflow-y-auto px-2 py-4"
          style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
        >
          {topMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className="w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-all"
              style={navBtnStyle(item.id)}
            >
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
              <span className="text-xs font-medium" style={labelStyle}>{item.label}</span>
            </button>
          ))}

          {/* ── Calibrate collapsible section ── */}
          <div className="pt-1">
            <button
              onClick={() => toggleSection(setCalibrateOpen, calibrateOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all"
              style={sectionHeaderStyle}
            >
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>⚙️</span>
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ ...labelStyle, marginLeft: '0.75rem', flex: 1, textAlign: 'left' }}
              >
                Calibrate
              </span>
              {sidebarOpen && (calibrateOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
            </button>

            {(calibrateOpen || !sidebarOpen) && (
              <div className="mt-1" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {calibrateItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className="w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-all"
                    style={navBtnStyle(item.id)}
                  >
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
                    <span className="text-xs font-medium" style={labelStyle}>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Create collapsible section ── */}
          <div className="pt-1">
            <button
              onClick={() => toggleSection(setCreateOpen, createOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all"
              style={sectionHeaderStyle}
            >
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>✨</span>
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ ...labelStyle, marginLeft: '0.75rem', flex: 1, textAlign: 'left' }}
              >
                Create
              </span>
              {sidebarOpen && (createOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
            </button>

            {(createOpen || !sidebarOpen) && (
              <div className="mt-1" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {createItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className="w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-all"
                    style={navBtnStyle(item.id)}
                  >
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
                    <span className="text-xs font-medium" style={labelStyle}>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Amplify collapsible section ── */}
          <div className="pt-1">
            <button
              onClick={() => toggleSection(setAmplifyOpen, amplifyOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all"
              style={sectionHeaderStyle}
            >
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>📣</span>
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ ...labelStyle, marginLeft: '0.75rem', flex: 1, textAlign: 'left' }}
              >
                Amplify
              </span>
              {sidebarOpen && (amplifyOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
            </button>
            {(amplifyOpen || !sidebarOpen) && (
              <div className="mt-1" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {amplifyItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className="w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-all"
                    style={navBtnStyle(item.id)}
                  >
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
                    <span className="text-xs font-medium" style={labelStyle}>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Cultivate collapsible section ── */}
          <div className="pt-1">
            <button
              onClick={() => toggleSection(setCultivateOpen, cultivateOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all"
              style={sectionHeaderStyle}
            >
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🌱</span>
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ ...labelStyle, marginLeft: '0.75rem', flex: 1, textAlign: 'left' }}
              >
                Cultivate
              </span>
              {sidebarOpen && (cultivateOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
            </button>
            {(cultivateOpen || !sidebarOpen) && (
              <div className="mt-1" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {cultivateItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className="w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-all"
                    style={navBtnStyle(item.id)}
                  >
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
                    <span className="text-xs font-medium" style={labelStyle}>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Optimize collapsible section ── */}
          <div className="pt-1">
            <button
              onClick={() => toggleSection(setOptimizeOpen, optimizeOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all"
              style={sectionHeaderStyle}
            >
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>⚡</span>
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ ...labelStyle, marginLeft: '0.75rem', flex: 1, textAlign: 'left' }}
              >
                Optimize
              </span>
              {sidebarOpen && (optimizeOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
            </button>
            {(optimizeOpen || !sidebarOpen) && (
              <div className="mt-1" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {optimizeItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className="w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-all"
                    style={navBtnStyle(item.id)}
                  >
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
                    <span className="text-xs font-medium" style={labelStyle}>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Test collapsible section ── */}
          <div className="pt-1">
            <button
              onClick={() => toggleSection(setTestOpen, testOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all"
              style={sectionHeaderStyle}
            >
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🧪</span>
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ ...labelStyle, marginLeft: '0.75rem', flex: 1, textAlign: 'left' }}
              >
                Test
              </span>
              {sidebarOpen && (testOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
            </button>
            {(testOpen || !sidebarOpen) && (
              <div className="mt-1" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {testItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}
                    className="w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-all"
                    style={navBtnStyle(item.id)}
                  >
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
                    <span className="text-xs font-medium" style={labelStyle}>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

        </nav>

        {/* Logout button */}
        <div className="px-2 py-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2.5 rounded-lg transition-all text-left"
            style={{ ...navBtnStyle(null), color: '#ef4444' }}
          >
            <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>🚪</span>
            <span className="text-xs font-medium" style={labelStyle}>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div
        className="transition-all duration-300"
        style={{
          paddingTop:    'calc(var(--height-navbar) + var(--height-subbar))',
          paddingLeft:   '1.5rem',
          paddingRight:  '1.5rem',
          paddingBottom: '1.5rem',
          marginLeft:    sidebarOpen ? 'var(--width-sidebar)' : 'var(--width-sidebar-collapsed)',
          transition:    `margin-left var(--transition-layout)`,
          minHeight:     'calc(100vh - var(--height-navbar) - var(--height-footer))',
          background:    'var(--color-grid-bg)',
        }}
      >
        <div className={`w-full ${activeSection === 'customers' ? 'block' : 'hidden'}`}
          style={{ paddingTop: 'var(--padding-grid-top)' }}>
          <CustomerGrid
            selectedSubscription={selectedSubscription}
            onCustomerSelect={handleCustomerSelect}
          />
        </div>

        <div className={`w-full ${activeSection === 'subscriber-items' ? 'block' : 'hidden'}`}>
          <SubscriberItemGrid
            selectedSubscription={selectedSubscription}
            onSubscriptionSelect={handleSubscriptionSelect}
          />
        </div>

        <div className={`w-full ${activeSection === 'search-engines' ? 'block' : 'hidden'}`}>
          <SearchEngineGrid selectedSubscription={selectedSubscription} />
        </div>

        <div className={`w-full ${activeSection === 'search-definitions' ? 'block' : 'hidden'}`}>
          <SearchDefinitionGrid selectedSubscription={selectedSubscription} />
        </div>

        <div className={`w-full ${activeSection === 'search-definition-engines' ? 'block' : 'hidden'}`}>
          <SearchDefinitionEngineGrid
            selectedSubscription={selectedSubscription}
            onSelectionChange={handleSearchDefinitionEngineSelect}
          />
        </div>

        <div className={`w-full ${activeSection === 'mentions' ? 'block' : 'hidden'}`}>
          <MentionsGrid />
        </div>

        <div className={`w-full ${activeSection === 'create-social' ? 'block' : 'hidden'}`}>
          {/* <SocialGrid /> */}
        </div>

        <div className={`w-full ${activeSection === 'create-video' ? 'block' : 'hidden'}`}>
          {/* <VideoGrid /> */}
        </div>

        <div className={`w-full ${activeSection === 'create-web' ? 'block' : 'hidden'}`}>
          {/* <WebGrid /> */}
        </div>

      </div>

    </PageLayout>
  );
};

export default Dashboard;