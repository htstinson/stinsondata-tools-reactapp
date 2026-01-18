import React, { useState, useEffect } from 'react';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-buttons';
import { Dialog } from '@progress/kendo-react-dialogs';
import { SearchDefinitionEngineForm } from './SearchDefinitionEnginesForm';

const SearchDefinitionEngineGrid = ({ selectedSubscription, onSelectionChange }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedState, setSelectedState] = useState({});

  const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);

    if (!selectedSubscription) {
      console.log('No subscription selected, clearing search definition engine data');
      setData([]);
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    let url = `https://thousandhillsdigital.net/api/v1/searchdefinitionenginesview/${selectedSubscription.subscriber_id}`;
    
    const params = new URLSearchParams();
    if (sort.length > 0) {
      params.append('sort', sort[0].field);
      params.append('order', sort[0].dir);
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const jsonData = await response.json();
    setData(Array.isArray(jsonData) ? jsonData : []); // ✅ Safety check
    
  } catch (err) {
    setError(err.message);
    setData([]); // ✅ Ensure data is array on error
    console.error('Error fetching data:', err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchData();
  }, [sort, selectedSubscription]);

  const handleSortChange = (e) => {
    setSort(e.sort);
  };

  const handleSelectionChange = (event) => {
    try {
      // Kendo Grid uses event.select for the selection state
      const newSelectedState = event.select || {};
      setSelectedState(newSelectedState);
      
      console.log('Selection event:', event);
      console.log('Selected state:', newSelectedState);
      
      // Find the selected item
      const selectedId = Object.keys(newSelectedState).find(key => newSelectedState[key]);
      
      let selectedItem = null;
      if (selectedId && data && data.length > 0) {
        selectedItem = data.find(item => {
          const itemId = item.id ? item.id.toString() : null;
          return itemId === selectedId;
        });
      }
      
      console.log('Selected ID:', selectedId);
      console.log('Selected item:', selectedItem);
      
      // Notify parent component
      if (onSelectionChange) {
        onSelectionChange(selectedItem);
      }
    } catch (error) {
      console.error('Error in handleSelectionChange:', error);
      setError('Error selecting item: ' + error.message);
    }
  };

  const handleEdit = (dataItem) => {
    setEditItem(dataItem);
    setShowDialog(true);
  };

  const handleCreate = () => {
    setEditItem(null);
    setShowDialog(true);
  };

  const handleSubmit = async (searchDefinitionEngine) => {
    try {
      searchDefinitionEngine.subscriber_id = selectedSubscription.subscriber_id;

      const token = localStorage.getItem('token');
      const method = searchDefinitionEngine.id ? 'PUT' : 'POST';
      const url = searchDefinitionEngine.id 
        ? `https://thousandhillsdigital.net/api/v1/searchdefinitionengines/${searchDefinitionEngine.id}`
        : 'https://thousandhillsdigital.net/api/v1/searchdefinitionengines';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchDefinitionEngine)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setShowDialog(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (dataItem) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://thousandhillsdigital.net/api/v1/searchdefinitionengines/${selectedSubscription.subscriber_id}/${dataItem.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const ActionCell = (props) => {
    return (
      <td>
        <div className="flex space-x-2">
          <Button 
            onClick={() => handleEdit(props.dataItem)}
            themeColor="info"
            size="small"
          >
            Edit
          </Button>
          <Button 
            onClick={() => handleDelete(props.dataItem)}
            themeColor="error"
            size="small"
          >
            Delete
          </Button>
        </div>
      </td>
    );
  };

  return (
    <div className="px-4 sm:px-0 mt-8">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Search Definition Engines</h2>
        <div className="flex items-center space-x-4">
          <Button onClick={handleCreate} themeColor="primary">Create New</Button>
          <Button onClick={fetchData} themeColor="light">Refresh</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading...</div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-red-600">Error loading data: {error}</p>
          <button 
            onClick={fetchData}
            className="mt-2 bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      ) : (
        <Grid
          data={(data || []).map(item => ({ ...item, selected: selectedState[item.id] }))}
          style={{ height: '400px' }}
          sortable={true}
          sort={sort}
          onSortChange={handleSortChange}
          dataItemKey="id"
          selectedField="selected"
          selectable={{
            enabled: true,
            mode: 'single'
          }}
          onSelectionChange={handleSelectionChange}
          pageable={{
            buttonCount: 5,
            pageSizes: [10, 20, 50],
            pageSize: 10
          }}
        >
          <GridColumn field="search_definition_name" title="Search Definition" />
          <GridColumn field="search_engine_name" title="Search Engine" />
          <GridColumn 
            title="Actions" 
            cell={ActionCell}
            width="200px"
          />
        </Grid>
      )}

      {showDialog && (
        <Dialog 
          title={editItem ? "Edit Search Definition Engine" : "Create New Search Definition Engine"} 
          onClose={() => setShowDialog(false)}
          width={600}
        >
          <SearchDefinitionEngineForm 
            searchDefinitionEngine={editItem}
            subscriberId={selectedSubscription?.subscriber_id}
            onSubmit={handleSubmit}
            onCancel={() => setShowDialog(false)}
          />
        </Dialog>
      )}
    </div>
  );
};

export default SearchDefinitionEngineGrid;