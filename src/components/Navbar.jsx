import React, { useState, useEffect } from 'react';
import { Menu, X, Home, Info, Phone, BarChart, Users, LogOut, User, Settings } from 'lucide-react';

import { UserContext, useUser } from './UserContext.jsx'; 

// Create a new context for the user IP
const UserIpContext = React.createContext(null);

// Custom hook to use the user IP context
export const useUserIp = () => React.useContext(UserIpContext);

// User IP provider component
export const UserIpProvider = ({ children }) => {
  const [userIp, setUserIp] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const userContext = useUser();
  
  // Fetch user's IP address when component mounts and user is logged in
  useEffect(() => {
    const fetchUserIp = async () => {
      const currentUser = userContext?.currentUser;
      if (!currentUser) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching IP address...");
        const response = await fetch('https://api.ipify.org?format=json');
        
        if (!response.ok) {
          throw new Error('Failed to fetch IP address');
        }
        
        const data = await response.json();
        console.log("IP fetched successfully:", data.ip);
        setUserIp(data.ip);
      } catch (err) {
        console.error('Error fetching IP:', err);
        
        // Fallback method if the first one fails
        try {
          console.log("Trying alternative IP API...");
          const response = await fetch('https://api64.ipify.org?format=json');
          if (!response.ok) {
            throw new Error('Failed to fetch IP address from backup API');
          }
          
          const data = await response.json();
          console.log("IP fetched successfully from backup API:", data.ip);
          setUserIp(data.ip);
        } catch (fallbackErr) {
          setError('Could not retrieve IP address');
          console.error('Error fetching IP from backup API:', fallbackErr);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserIp();
  }, [userContext]);
  
  return (
    <UserIpContext.Provider value={{ userIp, isLoading, error }}>
      {children}
    </UserIpContext.Provider>
  );
};

// User dropdown component
const UserDropdown = () => {
  const userContext = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const { userIp, isLoading, error } = useUserIp();
  
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

  // Get user role(s)
  let userRole = 'No Role Assigned';
  
  if (currentUser.roles) {
    if (Array.isArray(currentUser.roles)) {
      userRole = currentUser.roles.join(', ');
    } else {
      userRole = currentUser.roles;
    }
  }

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
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-700">IP Address:</p>
            {isLoading ? (
              <p className="text-xs text-gray-500">Loading...</p>
            ) : error ? (
              <p className="text-xs text-red-500">{error}</p>
            ) : (
              <p className="text-xs font-mono bg-gray-50 p-1 rounded text-center">{userIp || 'Not available'}</p>
            )}
            
            <p className="text-sm font-medium text-gray-700 mt-2">Role:</p>
            <p className="text-xs font-mono bg-gray-50 p-1 rounded text-center">{userRole}</p>

            <p className="text-sm font-medium text-gray-700 mt-2">Subscribed:</p>
            <p className="text-xs font-mono bg-gray-50 p-1 rounded text-center">
              {currentUser.subscribed && Array.isArray(currentUser.subscribed) && 
                currentUser.subscribed.map((subscription, index) => (
                  <React.Fragment key={index}>
                    {subscription.subscriber_name}
                    {index < currentUser.subscribed.length - 1 && <br />}
                  </React.Fragment>
                ))
              }
            </p>

          </div>
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
  const { userIp } = useUserIp();

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
    { name: 'Dashboard', href: '/dashboard', icon: BarChart, requiredRoles: ["Root","Global_Admin","Org_Admin","Standard_User"] },
    { name: 'Contact', href: '/contact', icon: Phone, access: "public" },
    { name: 'Admin', href: '/admin', requiredRoles: ["Root"]}
  ];

  const currentUser = userContext.currentUser;

  const shouldShowNavItem = (item, currentUser) => {
    // Public items are always visible
    if (item.access === "public") return true;
    
    // If no user is logged in, only show public items
    if (!currentUser) { 
      return false; 
    } else {
      // Log the IP address for debugging
      
      console.log("currentUser = ", currentUser);

      if (currentUser.subscribed === null) {
        console.log ("current user subscribed is null")
      } else {
        currentUser.subscribed.forEach(subscription => {
        console.log(subscription.subscriber_name);
      })
      }
      
      if (currentUser.ip_address) {
        console.log("navbar user context ip address", currentUser.ip_address);
      }
      console.log("userIp from context:", userIp);
      
      // You can now use userIp in your logic here
      // For example, you might want to add it to the currentUser object
      if (userIp && !currentUser.ip_address) {
        // This is just for the current render, not persisted
        currentUser.ip_address = userIp;
      }
      
      // Special case for 'Admin' item - it requires IP address verification
      if (item.name === 'Admin') {
        // If we don't have both IPs to compare, don't show the Admin item
        if (!userIp || !currentUser.ip_address) {
          return false;
        }
        // Only show Admin item if IPs match
        if (userIp !== currentUser.ip_address) {
          console.log('IP addresses do not match. Not showing Admin item.');
          return false;
        }
      }
    }
  
    // Check for role-specific items
    if (item.requiredRoles) {
      // Handle case where currentUser.roles is a string (single role)
      if (typeof currentUser.roles === 'string') {
        return item.requiredRoles.includes(currentUser.roles);
      }
      
      // Handle case where currentUser.roles is an array (multiple roles)
      if (Array.isArray(currentUser.roles)) {
        // Return true if any of the user's roles are in the required roles array
        return currentUser.roles.some(role => item.requiredRoles.includes(role));
      }
      
      return false;
    }
    
    // Backward compatibility with old requiredRole property
    if (item.requiredRole) {
      if (typeof currentUser.roles === 'string') {
        return currentUser.roles === item.requiredRole;
      }
      if (Array.isArray(currentUser.roles)) {
        return currentUser.roles.includes(item.requiredRole);
      }
      return false;
    }
    
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

// Export the wrapped components
export default function NavbarWithProviders() {
  return (
    <UserIpProvider>
      <Navbar />
    </UserIpProvider>
  );
}