// context/SelectionContext.jsx
import React, { createContext, useContext, useState } from 'react';

const SelectionContext = createContext();

export const useSelection = () => {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
};

export const SelectionProvider = ({ children }) => {
  const [selectedUserSubscriberId, setSelectedUserSubscriberId] = useState(null);

  const selectUserSubscriber = (id) => {
    setSelectedUserSubscriberId(id);
  };

  const clearSelection = () => {
    setSelectedUserSubscriberId(null);
  };

  return (
    <SelectionContext.Provider
      value={{
        selectedUserSubscriberId,
        selectUserSubscriber,
        clearSelection
      }}
    >
      {children}
    </SelectionContext.Provider>
  );
};