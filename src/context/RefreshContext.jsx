// src/context/RefreshContext.js
import React, { createContext, useState, useContext } from 'react';

const RefreshContext = createContext();

export const RefreshProvider = ({ children }) => {
  const [refreshTriggers, setRefreshTriggers] = useState({
    user: 0,
    subscriber: 0,
    userSubscriber: 0,
    userSubscriberRole: 0,
    role: 0,
    permission: 0,
    rolePermission: 0,
    blocked: 0
  });

  const triggerRefresh = (gridType) => {
    setRefreshTriggers(prev => ({
      ...prev,
      [gridType]: prev[gridType] + 1
    }));
  };

  // Helper to refresh multiple grids at once
  const triggerMultipleRefresh = (gridTypes) => {
    setRefreshTriggers(prev => {
      const newTriggers = { ...prev };
      gridTypes.forEach(gridType => {
        newTriggers[gridType] = prev[gridType] + 1;
      });
      return newTriggers;
    });
  };

  return (
    <RefreshContext.Provider value={{ refreshTriggers, triggerRefresh, triggerMultipleRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => useContext(RefreshContext);