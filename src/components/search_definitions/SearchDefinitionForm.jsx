import React, { useState } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { Input, TextArea } from '@progress/kendo-react-inputs';

export const SearchDefinitionForm = ({ searchDefinition, onSubmit, onCancel }) => {
  const [name, setName] = useState(searchDefinition?.name || '');
  const [query, setQuery] = useState(searchDefinition?.query || '');
  const [searchEngineId, setSearchEngineId] = useState(searchDefinition?.search_engine_id || '');
  const [comment, setComment] = useState(searchDefinition?.comment || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ 
      ...searchDefinition, 
      name, 
      query,
      search_engine_id: searchEngineId,
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
        <label className="block text-sm font-medium text-gray-700">Search Engine ID *</label>
        <Input
          value={searchEngineId}
          onChange={(e) => setSearchEngineId(e.value)}
          required
          className="mt-1"
          placeholder="e.g., 12345abcde"
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
