import React, { useState } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';
import { Error } from '@progress/kendo-react-labels';

export const RoleForm = ({ user, onSubmit, onCancel }) => {
  const [username, setName] = useState(user?.username || '');
  
    const handleNameChange = (e) => {
    const value = e.value;
    setName(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    onSubmit({ ...role, name});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.value)}
          required
          className="mt-1"
        />
      </div>
     
      <div className="flex justify-end space-x-2">
        <Button onClick={onCancel} themeColor="light">
          Cancel
        </Button>
        <Button type="submit" themeColor="primary">
          Save
        </Button>
      </div>
    </form>
  );
};