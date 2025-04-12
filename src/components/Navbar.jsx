import React, { useState, useEffect } from 'react';
import { Menu, X, Home, Info, Phone, BarChart, Users, LogOut, User, Settings } from 'lucide-react';

import { useUser } from './UserContext.jsx'; 

// User dropdown component
const UserDropdown = () => {
  const userContext = useUser();
  const [isOpen, setIsOpen] = useState(false);
  
  // Handle case where context is not yet available
  if (!userContext) {
    return null;
  }
  
  const { currentUser, logout } = userContext;

  if (!currentUser) {
    return (
      <a 
        href="/login" 
        className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
      >
        Login
      </a>
    );
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Get user display name from JWT token
  const displayName = currentUser.name || currentUser.username || currentUser.email || 'User';
  
  // Get first letter of display name for avatar
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button 
        onClick={toggleDropdown}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
      >
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
          {initials}
        </div>
        <span>{displayName}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
          <a
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <User size={16} />
            Profile
          </a>
          <a
            href="/settings"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <Settings size={16} />
            Settings
          </a>
          <button
            onClick={logout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const userContext = useUser();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };


  const navItems = [
    { name: 'Home', href: '/', icon: Home, access: "public" },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart, requiredRole: "Standard_User" },
    { name: 'Contact', href: '/contact', icon: Phone, access: "public" },
    { name: 'Users', href: '/users', icon: Users, requiredRole: "Root" },
    { name: 'Customers', href: '/customers', requiredRole: "Standard_User" },
    { name: 'Admin', href: '/admin', requiredRole: "Root"},
    { name: 'Roles', href: '/roles', requiredRole: "Root"}
  ];

  const currentUser = userContext.currentUser;

  const shouldShowNavItem = (item, currentUser) => {
    
    // Public items are always visible
    if (item.access === "public") return true;
    
    // If no user is logged in, only show public items
    if (!currentUser) return false;
    
    // Check for role-specific items
    if (item.requiredRole) return currentUser.roles === item.requiredRole;
    
    // Show authenticated items to any logged-in user
    if (item.access === "authenticated") return true;
    
    return false;
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-lg z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <span className="text-xl font-bold">Your Logo</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center">
            <div className="flex space-x-8">
            {navItems
              .filter(item => shouldShowNavItem(item, currentUser))
              .map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                >
                  {item.icon && <item.icon size={18} />}
                  {item.name}
                </a>
              ))}
            </div>
            
            <div className="ml-8 border-l border-gray-200 pl-6">
              <UserDropdown />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <UserDropdown />
            <button
              onClick={toggleMenu}
              className="ml-4 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2"
                >
                  {item.icon && <item.icon size={18} />}
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;