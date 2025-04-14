import React, { useState } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';

export const PermssionForm = ({ permission, onSubmit, onCancel }) => {
  const [name, setName] = useState(permission?.name || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...permission, name });
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