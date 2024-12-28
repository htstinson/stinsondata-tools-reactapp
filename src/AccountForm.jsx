import React, { useState } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';

export const AccountForm = ({ account, onSubmit, onCancel }) => {
  const [name, setName] = useState(account?.Name || ''); //name = account name
  const [phone, setPhone] = useState(account?.Phone || '');
  const [accountsource, setAccountSource] = useState(account?.AccountSource || '');
 
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...account, name, phone, accountsource });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <Input 
          value={name} 
          onChange={(e) => setName(e.value)} 
          required 
          className="mt-1"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <Input 
            value={phone} 
            onChange={(e) => setPhone(e.value)} 
            className="mt-1"
            placeholder="(555) 555-5555"
          />
        </div>
        <div>
        <label className="block text-sm font-medium text-gray-700">Source</label>
        <Input 
          value={accountsource} 
          onChange={(e) => setAccountSource(e.value)} 
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