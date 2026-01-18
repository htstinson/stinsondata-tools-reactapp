import React, { useState, useEffect } from 'react';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-buttons';
import { DatePicker } from '@progress/kendo-react-dateinputs';
import { Dialog } from '@progress/kendo-react-dialogs';
import { SearchDefinitionForm } from './SearchDefinitionForm';

const SearchDefinitionGrid = ({ selectedSubscription }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dateFilter, setDateFilter] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!selectedSubscription) {
        console.log('No subscription selected, clearing search definition data');
        setData([]);
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      let url = `https://thousandhillsdigital.net/api/v1/searchdefinitions/${selectedSubscription.subscriber_id}`;
      
      const params = new URLSearchParams();
      if (sort.length > 0) {
        params.append('sort', sort[0].field);
        params.append('order', sort[0].dir);
      }
      if (dateFilter) {
        params.append('date', dateFilter.toISOString());
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
      setData(jsonData);
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sort, dateFilter, selectedSubscription]);

  const handleSortChange = (e) => {
    setSort(e.sort);
  };

  const handleEdit = (dataItem) => {
    setEditItem(dataItem);
    setShowDialog(true);
  };

  const handleCreate = () => {
    setEditItem(null);
    setShowDialog(true);
  };

  const handleSubmit = async (searchDefinition) => {
    try {

      const token = localStorage.getItem('token');
      const method = searchDefinition.id ? 'PUT' : 'POST';
      const url = 'https://thousandhillsdigital.net/api/v1/searchdefinitions'
                                                   
      searchDefinition.subscriber_id = selectedSubscription.subscriber_id

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchDefinition)
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
    //if (window.confirm('Are you sure you want to delete this search definition?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://thousandhillsdigital.net/api/v1/searchdefinitions/${selectedSubscription.subscriber_id}/${dataItem.id}`, {
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
    //}
  };

  const handleSearch = async (item) => {
    try {
      console.log('test', JSON.stringify({ id: item.id }));
      const token = localStorage.getItem('token');
      const method = 'POST';
      const url = `https://thousandhillsdigital.net/api/v1/search`       

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
          body: JSON.stringify({ id: item.id, subscriber_id: item.subscriber_id })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setShowDialog(false);
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
           <Button onClick={() => handleSearch(props.dataItem)} 
            themeColor="info"
            size="small">
              Test
            </Button>
        </div>
      </td>
    );
  };

  const DateCell = (props) => {
    const value = props.dataItem[props.field];
    if (!value) return <td></td>;
    
    const date = new Date(value);
    const formatted = date.toISOString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    }).split('T')[0];
    
    return <td>{formatted}</td>;
  };
  
  return (
    <div className="px-4 sm:px-0 mt-8">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Search Definitions</h2>
        <div className="flex items-center space-x-4">
          <DatePicker
            placeholder="Filter by date..."
            value={dateFilter}
            onChange={(e) => setDateFilter(e.value)}
            format="yyyy-MM-dd"
          />
          <Button onClick={handleCreate} themeColor="primary">Create New Search Definition</Button>
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
          data={data}
          style={{ height: '400px' }}
          sortable={true}
          sort={sort}
          onSortChange={handleSortChange}
          pageable={{
            buttonCount: 5,
            pageSizes: [10, 20, 50],
            pageSize: 10
          }}
        >
          <GridColumn field="name" title="Name" width="150px" />
          <GridColumn field="query" title="Query" width="250px" />
          <GridColumn field="start_date" title="Start" cells={{data: DateCell}} width="120px" />
          <GridColumn field="end_date" title="End" cells={{data: DateCell}} width="120px" />
          <GridColumn field="comment" title="Comment" />
          <GridColumn title="Actions" cells={{data: ActionCell}} width="200px" />
        </Grid>
      )}

      {showDialog && (
        <Dialog 
          title={editItem ? "Edit Search Definition" : "Create New Search Definition"} 
          onClose={() => setShowDialog(false)}
          width={600}
        >
          <SearchDefinitionForm 
            searchDefinition={editItem}
            onSubmit={handleSubmit}
            onCancel={() => setShowDialog(false)}
          />
        </Dialog>
      )}
    </div>
  );
};

export default SearchDefinitionGrid;