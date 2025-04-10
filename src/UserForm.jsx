import React, { useState } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';
import { Error } from '@progress/kendo-react-labels';

export const UserForm = ({ user, onSubmit, onCancel }) => {
  const [username, setName] = useState(user?.username || '');
  const [ipAddress, setIpAddress] = useState(user?.ip_address || '');
  const [ipError, setIpError] = useState('');

  const validateIpAddress = (ip) => {
    // IPv4 regex pattern
    const ipv4Pattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipv4Pattern.test(ip);
  };

  const handleIpChange = (e) => {
    const value = e.value;
    setIpAddress(value);
    
    if (value && !validateIpAddress(value)) {
      setIpError('Please enter a valid IPv4 address (e.g. 192.168.1.1)');
    } else {
      setIpError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (ipAddress && !validateIpAddress(ipAddress)) {
      setIpError('Please enter a valid IPv4 address (e.g. 192.168.1.1)');
      return;
    }
    
    onSubmit({ ...user, username, ip_address: ipAddress });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <Input
          value={username}
          onChange={(e) => setName(e.value)}
          required
          className="mt-1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">IP Address</label>
        <Input
          value={ipAddress}
          onChange={handleIpChange}
          placeholder="e.g. 192.168.1.1"
          className="mt-1"
          valid={!ipError}
        />
        {ipError && <Error>{ipError}</Error>}
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