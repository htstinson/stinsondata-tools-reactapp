import React, { useState } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { Input, TextArea } from '@progress/kendo-react-inputs';
import { Switch } from '@progress/kendo-react-inputs';

export const SearchEngineForm = ({ searchEngine, onSubmit, onCancel }) => {
  const [name, setName] = useState(searchEngine?.name || '');
  const [search_engine_id, setSearchEngineId] = useState(searchEngine?.search_engine_id || '');
  const [comment, setComment] = useState(searchEngine?.comment || '');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ 
      ...searchEngine, 
      name, 
      search_engine_id, 
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
          placeholder="e.g., Google, Bing, DuckDuckGo"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Search Engine Id *</label>
        <Input
          value={search_engine_id}
          onChange={(e) => setSearchEngineId(e.value)}
          required
          className="mt-1"
          placeholder=""
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <TextArea
          value={comment}
          onChange={(e) => setComment(e.value)}
          rows={3}
          className="mt-1"
          placeholder="Brief description of this search engine"
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