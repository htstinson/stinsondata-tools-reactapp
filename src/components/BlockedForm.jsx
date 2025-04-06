import React, { useState } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';

export const BlockedForm = ({ item, onSubmit, onCancel, error }) => {
  const [ip, setIP] = useState(item?.ip || '');
  const [notes, setNotes] = useState(item?.notes || '');
  const [ipError, setIpError] = useState('');

  // IP validation function
  const validateIP = (ipValue) => {
    // Check if the IP value is empty
    if (!ipValue) {
      return 'IP address is required';
    }

    // Extract the CIDR part if present
    const parts = ipValue.split('/');
    const ipAddress = parts[0];
    const cidr = parts[1];

    // Check CIDR notation is present and equals 32
    if (!cidr || cidr !== '32') {
      return 'IP must end with /32 for specific address (CIDR notation)';
    }

    // Check IP address format
    const ipParts = ipAddress.split('.');
    
    // Must have exactly 4 parts
    if (ipParts.length !== 4) {
      return 'IP must have 4 number groups separated by dots (e.g., 101.201.45.148)';
    }

    // Validate each part of the IP address
    for (let i = 0; i < 4; i++) {
      const part = ipParts[i];
      
      // Check if part is a number
      if (!/^\d+$/.test(part)) {
        return 'Each part of the IP must be a number';
      }
      
      // Convert to number and check range
      const num = parseInt(part, 10);
      
      // First octet cannot be zero
      if (i === 0 && num === 0) {
        return 'First number in IP cannot be zero';
      }
      
      // All octets must be between 0 and 255
      if (num < 0 || num > 255) {
        return 'IP numbers must be between 0 and 255';
      }
    }

    // Valid IP format
    return '';
  };

  const handleIPChange = (e) => {
    const newIP = e.value;
    setIP(newIP);
    
    // Clear error when field is empty to avoid immediate validation
    if (!newIP) {
      setIpError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate IP before submission
    const validationError = validateIP(ip);
    if (validationError) {
      setIpError(validationError);
      return;
    }
    
    onSubmit({ ...item, ip, notes });
  };

  // Helper function to append /32 if missing when focus is lost
  const handleIPBlur = () => {
    if (ip && !ip.includes('/')) {
      const updatedIP = `${ip}/32`;
      setIP(updatedIP);
      setIpError(validateIP(updatedIP));
    } else if (ip) {
      setIpError(validateIP(ip));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* API error message */}
      {error && (
        <div className="p-2 mb-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700">IP</label>
        <Input
          value={ip}
          onChange={handleIPChange}
          onBlur={handleIPBlur}
          required
          className="mt-1"
          placeholder="Example: 101.201.45.148/32"
        />
        {ipError && (
          <div className="mt-1">
            <p className="text-sm text-red-600">{ipError}</p>
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <Input
          value={notes}
          onChange={(e) => setNotes(e.value)}
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