import React, { useState, useEffect } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { DropDownList } from '@progress/kendo-react-dropdowns';

export const SearchDefinitionEngineForm = ({ searchDefinitionEngine, subscriberId, onSubmit, onCancel }) => {
  const [searchDefinitions, setSearchDefinitions] = useState([]);
  const [searchEngines, setSearchEngines] = useState([]);
  const [selectedSearchDefinition, setSelectedSearchDefinition] = useState(null);
  const [selectedSearchEngine, setSelectedSearchEngine] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOptions();
  }, [subscriberId]);

  useEffect(() => {
    if (searchDefinitionEngine && searchDefinitions.length > 0 && searchEngines.length > 0) {
      const definition = searchDefinitions.find(sd => sd.id === searchDefinitionEngine.search_definition_id);
      const engine = searchEngines.find(se => se.id === searchDefinitionEngine.search_engine_id);
      setSelectedSearchDefinition(definition || null);
      setSelectedSearchEngine(engine || null);
    }
  }, [searchDefinitionEngine, searchDefinitions, searchEngines]);

  const fetchOptions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch search definitions
      const definitionsResponse = await fetch(
        `https://thousandhillsdigital.net/api/v1/searchdefinitions/${subscriberId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Fetch search engines
      const enginesResponse = await fetch(
        `https://thousandhillsdigital.net/api/v1/searchengines/${subscriberId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!definitionsResponse.ok || !enginesResponse.ok) {
        throw new Error('Failed to fetch options');
      }

      const definitionsData = await definitionsResponse.json();
      const enginesData = await enginesResponse.json();

      setSearchDefinitions(definitionsData);
      setSearchEngines(enginesData);
    } catch (err) {
      console.error('Error fetching options:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedSearchDefinition || !selectedSearchEngine) {
      alert('Please select both a search definition and a search engine');
      return;
    }

    onSubmit({
      ...searchDefinitionEngine,
      search_definitions_id: selectedSearchDefinition.id,
      search_engine_id: selectedSearchEngine.id,
      subscriber_id: subscriberId
    });
  };

  if (loading) {
    return <div className="p-4">Loading options...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Search Definition *</label>
        <DropDownList
          data={searchDefinitions}
          textField="name"
          dataItemKey="id"
          value={selectedSearchDefinition}
          onChange={(e) => setSelectedSearchDefinition(e.value)}
          className="mt-1 w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Search Engine *</label>
        <DropDownList
          data={searchEngines}
          textField="name"
          dataItemKey="id"
          value={selectedSearchEngine}
          onChange={(e) => setSelectedSearchEngine(e.value)}
          className="mt-1 w-full"
          required
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