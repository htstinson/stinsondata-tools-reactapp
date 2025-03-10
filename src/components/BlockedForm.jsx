import React, { useState } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';

export const BlockedForm = ({ item, onSubmit, onCancel }) => {
  const [ip, setIP] = useState(item?.ip || '');
  const [notes, setNotes] = useState(item?.notes || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...item, ip, notes });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">IP</label>
        <Input
          value={ip}
          onChange={(e) => setIP(e.value)}
          required
          className="mt-1"
        />
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