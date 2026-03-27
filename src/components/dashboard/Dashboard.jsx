{/* ── my-login-app/src/components/dashboard/Dashboard.jsx ── */}

import React, { useState, useRef } from 'react';
import { Menu, ChevronLeft, ChevronRight, ChevronDown, GripVertical } from 'lucide-react';
import CustomerGrid from '../customer/CustomerGrid.jsx';
import SubscriberItemGrid from '../subscriber_items/SubscriberItemGrid.jsx';
import SearchEngineGrid from '../searchengines/SearchEnginesGrid.jsx';
import SearchDefinitionGrid from '../search_definitions/SearchDefinitionGrid.jsx';
import SearchDefinitionEngineGrid from '../search_definition_engines/SearchDefinitionEnginesGrid.jsx';
import MentionsGrid from '../mentions/MentionsGrid.jsx';
import Integrations from '../cultivate/Integrations.jsx';
import { useSubscription } from '../../components/Navbar.jsx';
import PageLayout from '../PageLayout.jsx';
import { api } from '../../api';

const IMG2 = api.cdn('/bg2.jpeg');

// ── Persistence helpers ──────────────────────────────────────────────────────
const load = (key, fallback) => {
  try {
    const val = localStorage.getItem(key);
    const result = val !== null ? JSON.parse(val) : fallback;
    console.log(`[UI] load "${key}":`, result);
    return result;
  } catch (e) {
    console.warn(`[UI] load "${key}" failed:`, e);
    return fallback;
  }
};

const save = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    console.log(`[UI] save "${key}":`, val);
  } catch (e) {
    console.warn(`[UI] save "${key}" failed:`, e);
  }
};

// ── Section definitions ──────────────────────────────────────────────────────
const INITIAL_SECTIONS = [
  {
    id: 'calibrate', label: 'Calibrate', icon: '⚙️',
    items: [
      { id: 'search-engines',            label: 'Engines',     icon: '🔍' },
      { id: 'search-definitions',        label: 'Definitions', icon: '📋' },
      { id: 'search-definition-engines', label: 'Jobs',        icon: '📋' },
      { id: 'mentions',                  label: 'Mentions',    icon: '💬' },
    ],
  },
  {
    id: 'create', label: 'Create', icon: '✨',
    items: [
      { id: 'create-social', label: 'Social', icon: '📱' },
      { id: 'create-video',  label: 'Video',  icon: '🎬' },
      { id: 'create-web',    label: 'Web',    icon: '🌐' },
    ],
  },
  {
    id: 'amplify', label: 'Amplify', icon: '📣',
    items: [
      { id: 'amplify-advocate',        label: 'Advocate',        icon: '📣' },
      { id: 'amplify-constantcontact', label: 'Constant Contact', icon: '📧' },
      { id: 'amplify-ringcentral',     label: 'Ring Central',     icon: '📞' },
    ],
  },
  {
    id: 'plan', label: 'Plan', icon: '📝',
    items: [
      { id: 'plan-profile',     label: 'Profile',     icon: '👤' },
      { id: 'subscriber-items', label: 'Services',    icon: '📦' },
      { id: 'plan-background',  label: 'Background',  icon: '🖼️' },
      { id: 'plan-campaigns',   label: 'Campaigns',   icon: '🎯' },
      { id: 'plan-initiatives', label: 'Initiatives', icon: '🚀' },
      { id: 'plan-strategies',  label: 'Strategies',  icon: '♟️' },
      { id: 'plan-goals',       label: 'Goals',       icon: '🏆' },
    ],
  },
  {
    id: 'cultivate', label: 'Cultivate', icon: '🌱',
    items: [
      { id: 'customers',              label: 'Customers',    icon: '👥' },
      { id: 'cultivate-integrations', label: 'Integrations', icon: '🔗' },
      { id: 'cultivate-crm',          label: 'CRM',          icon: '🤝' },
    ],
  },
  {
    id: 'optimize', label: 'Optimize', icon: '⚡',
    items: [
      { id: 'optimize-schedule', label: 'Schedule', icon: '📅' },
      { id: 'optimize-measure',  label: 'Measure',  icon: '📊' },
    ],
  },
  {
    id: 'test', label: 'Test', icon: '🧪',
    items: [
      { id: 'test-ab', label: 'A/B', icon: '🧪' },
    ],
  },
];

const loadSections = () => {
  const savedOrder = load('ui.sectionOrder', null);
  if (!savedOrder) return INITIAL_SECTIONS;
  return [
    ...savedOrder.map(id => INITIAL_SECTIONS.find(s => s.id === id)).filter(Boolean),
    ...INITIAL_SECTIONS.filter(s => !savedOrder.includes(s.id)),
  ];
};

// ── Component ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen]   = useState(() => load('ui.sidebarOpen', true));
  const [activeSection, setActiveSection] = useState(() => load('ui.activeSection', 'customers'));
  const [openSection, setOpenSection]   = useState(() => load('ui.openSection', null));
  const [sections, setSections]         = useState(loadSections);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragIndex = useRef(null);

  const { selectedSubscription, selectSubscription } = useSubscription();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedSearchDefinitionEngine, setSelectedSearchDefinitionEngine] = useState(null);

  const handleSubscriptionSelect = (subscription) => {
    selectSubscription({
      subscriber_id:   subscription.subscriber_id,
      subscriber_name: subscription.subscriber_name,
    });
    setSelectedCustomer(null);
    setSelectedSearchDefinitionEngine(null);
  };

  const handleCustomerSelect = (c) => setSelectedCustomer(c);
  const handleSearchDefinitionEngineSelect = (sde) => setSelectedSearchDefinitionEngine(sde);

  const topMenuItems = [];

  const handleMenuClick = (itemId) => {
    setActiveSection(itemId);
    save('ui.activeSection', itemId);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
      save('ui.sidebarOpen', false);
    }
  };

  const handleToggleSidebar = () => {
    const next = !sidebarOpen;
    setSidebarOpen(next);
    save('ui.sidebarOpen', next);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('selectedSubscription');
    window.location.href = '/';
  };

  const toggleSection = (id) => {
    setOpenSection(prev => {
      const next = prev === id ? null : id;
      save('ui.openSection', next);
      return next;
    });
  };

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const handleDragStart = (e, idx) => {
    dragIndex.current = idx;
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(idx);
  };

  const handleDrop = (e, idx) => {
    e.preventDefault();
    const from = dragIndex.current;
    if (from === null || from === idx) { setDragOverIndex(null); return; }
    setSections(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(idx, 0, moved);
      save('ui.sectionOrder', next.map(s => s.id));
      return next;
    });
    dragIndex.current = null;
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    dragIndex.current = null;
    setDragOverIndex(null);
  };

  // ── Styles ─────────────────────────────────────────────────────────────────
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

  const sectionHeaderStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    color:      'rgba(255, 255, 255, 0.7)',
  };

  // ── Render ──────────────────────────────────────────────────────────────────
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
            <h1 className="text-xl font-bold">{selectedSubscription?.subscriber_name}</h1>
          </div>
        </div>
      </nav>

      {/* ── Mobile overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden"
          style={{ zIndex: 'var(--z-sidebar)' }}
          onClick={() => { setSidebarOpen(false); save('ui.sidebarOpen', false); }}
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
        {/* Header */}
        <div
          className={`flex items-center px-2 ${sidebarOpen ? 'justify-end' : 'justify-center'}`}
          style={{ height: 'var(--height-sidebar)', width: '100%' }}
        >
          <span className="font-bold text-lg flex-1 pl-2" style={{ ...labelStyle, color: 'white' }}>
            Menu
          </span>
          <button
            onClick={handleToggleSidebar}
            className="p-1 rounded-lg transition-colors"
            style={{ color: 'white', flexShrink: 0, background: 'transparent', border: 'none' }}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <ChevronLeft size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Scrollable nav */}
        <nav
          className="flex-1 overflow-y-auto px-2 pt-2 pb-4"
          style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
        >
          {/* Static top items */}
          {topMenuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className="w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-all"
              style={navBtnStyle(item.id)}
              title={!sidebarOpen ? item.label : undefined}
            >
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
              <span className="text-xs font-medium" style={labelStyle}>{item.label}</span>
            </button>
          ))}

          {/* Draggable collapsible sections */}
          {sections.map((section, idx) => {
            const isOpen     = openSection === section.id;
            const isDragOver = dragOverIndex === idx;

            return (
              <div
                key={section.id}
                className="pt-1"
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e)  => handleDragOver(e, idx)}
                onDrop={(e)      => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                style={{
                  borderTop:  isDragOver ? '2px solid rgba(255,255,255,0.6)' : '2px solid transparent',
                  transition: 'border-color 150ms ease',
                }}
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all"
                  style={sectionHeaderStyle}
                  title={!sidebarOpen ? section.label : undefined}
                >
                  {sidebarOpen && (
                    <GripVertical
                      size={14}
                      style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0, marginRight: '4px', cursor: 'grab' }}
                    />
                  )}
                  <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{section.icon}</span>
                  <span
                    className="text-xs font-semibold tracking-wider"
                    style={{ ...labelStyle, marginLeft: '0.75rem', flex: 1, textAlign: 'left' }}
                  >
                    {section.label}
                  </span>
                  {sidebarOpen && (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                </button>

                {isOpen && (
                  <div className="mt-1" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleMenuClick(item.id)}
                        className="w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-all"
                        style={navBtnStyle(item.id)}
                        title={!sidebarOpen ? item.label : undefined}
                      >
                        <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
                        <span className="text-xs font-medium" style={labelStyle}>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-2 py-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2.5 rounded-lg transition-all text-left"
            style={{ ...navBtnStyle(null) }}
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

        {/* Dynamic panels for all section children */}
        {INITIAL_SECTIONS.flatMap(s => s.items).map(item => (
          <div key={item.id} className={`w-full ${activeSection === item.id ? 'block' : 'hidden'}`}>
            {item.id === 'cultivate-integrations' && <Integrations />}
          </div>
        ))}
      </div>

    </PageLayout>
  );
};

export default Dashboard;