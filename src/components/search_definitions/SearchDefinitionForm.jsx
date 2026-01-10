import React, { useState } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { Input, TextArea } from '@progress/kendo-react-inputs';

export const SearchDefinitionForm = ({ searchDefinition, onSubmit, onCancel }) => {
  const [name, setName] = useState(searchDefinition?.name || '');
  const [query, setQuery] = useState(searchDefinition?.query || '');
  const [start_date, setStartDate] = useState(searchDefinition?.start_date || '');
  const [end_date, setEndDate] = useState(searchDefinition?.end_date || '');
  const [comment, setComment] = useState(searchDefinition?.comment || '');

  const handleSubmit = (e) => {
    e.preventDefault();

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [month, day, year] = dateStr.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00Z`;
  };

    onSubmit({ 
      ...searchDefinition, 
      name, 
      query,
      start_date: formatDate(start_date),
      end_date: formatDate(end_date),
      comment
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name *</label>
        <Input
          value={name}
          onChange={(e) => setName(e.value)}
          required
          className="mt-1"
          placeholder="e.g., Product Search, Location Query"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Query *</label>
        <Input
          value={query}
          onChange={(e) => setQuery(e.value)}
          required
          className="mt-1"
          placeholder="e.g., site:example.com OR keyword search"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Start Date *</label>
        <Input
          value={start_date}
          onChange={(e) => setStartDate(e.value)}
          required
          className="mt-1"
          placeholder="e.g., 01/01/2026"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">End Date *</label>
        <Input
          value={end_date}
          onChange={(e) => setEndDate(e.value)}
          required
          className="mt-1"
          placeholder="e.g., 01/31/2026"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Comment</label>
        <TextArea
          value={comment}
          onChange={(e) => setComment(e.value)}
          rows={3}
          className="mt-1"
          placeholder="Additional notes or description"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
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
