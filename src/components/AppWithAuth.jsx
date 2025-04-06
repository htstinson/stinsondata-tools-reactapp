import React from 'react';
import { UserProvider } from './UserContext.jsx';
import Navbar from './Navbar';

const AppWithAuth = ({ children }) => {
  return (
    <UserProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-16">
          {children}
        </main>
      </div>
    </UserProvider>
  );
};

export default AppWithAuth;