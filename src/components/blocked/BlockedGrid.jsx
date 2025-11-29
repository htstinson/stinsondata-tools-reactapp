import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-buttons';
import { Dialog } from '@progress/kendo-react-dialogs';
import { BlockedForm } from './BlockedForm.jsx';

import { orderBy } from '@progress/kendo-data-query';

const BlockedGrid = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState([
    {
      field: 'ip',
      dir: 'asc'
    }
  ]);
  const [editItem, setEditItem] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Add pagination state
  const [page, setPage] = useState({
    skip: 0,
    take: 10
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      let url = 'https://thousandhillsdigital.net/api/v1/blocked';
      
      const params = new URLSearchParams();
      if (sort.length > 0) {
        params.append('sort', sort[0].field);
        params.append('order', sort[0].dir);
      }

      // Add pagination parameters if your API supports server-side pagination
      // params.append('skip', page.skip);
      // params.append('take', page.take);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
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

  // Reset page when filters change
  useEffect(() => {
    setPage({
      skip: 0,
      take: page.take
    });
  }, [sort]);

  // Add this useEffect hook to fetch data when the component mounts
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [sort, page]);

  const handleSortChange = (e) => {
    // Update the sort state with the new sort configuration
    setSort(e.sort);
    
    // Note: We don't need to manually sort the data here since 
    // you're fetching sorted data from the server based on the sort state
    // The useEffect will trigger a new fetch with the updated sort parameters
    
    console.log('Sort changed to:', e.sort);
  };

  // Add page change handler
  const handlePageChange = (e) => {
    setPage({
      skip: e.page.skip,
      take: e.page.take
    });
  };

  const handleEdit = (dataItem) => {
    setEditItem(dataItem);
    setShowDialog(true);
  };

  const handleCreate = () => {
    setEditItem(null);
    setShowDialog(true);
    // Reset any error messages when creating a new item
    setShowError(false);
    setErrorMessage('');
  };

  const handleSubmit = async (item) => {
    // Reset any previous error states
    setShowError(false);
    setErrorMessage('');
    try {
      const token = localStorage.getItem('token');
      const method = item.id ? 'PUT' : 'POST';
      const url = item.id 
        ? `https://thousandhillsdigital.net/api/v1/blocked/${item.id}`
        : 'https://thousandhillsdigital.net/api/v1/blocked';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
    
      }
    
    );

    if (response.status === 409) {
      setErrorMessage('Duplicate: A user with this information already exists.');
      setShowError(true);
      // Don't close the dialog so user can correct the input
      return;
    }

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
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://thousandhillsdigital.net/api/v1/blocked/${dataItem.id}`, {
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
    }
  };

  const handleUpdatewAF = () => {
    
    try {
      const token = localStorage.getItem('token');
      const method = 'GET';
      const url = 'https://thousandhillsdigital.net/api/v1/blocked/update';

      const response = fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    
    );


    if (!response.ok) {
       throw new Error(`HTTP error! status: ${response.status}`);
     }

    } catch (err) {
      setError(err.message);
    }


  };

  const handleParseLogs = () => {
    
    try {
      const token = localStorage.getItem('token');
      const method = 'GET';
      const url = 'https://thousandhillsdigital.net/api/v1/blocked/parse';

      const response = fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    
    );

    if (!response.ok) {
       throw new Error(`HTTP error! status: ${response.status}`);
     }

    } catch (err) {
      setError(err.message);
    }
  };

  const ActionCell = (props) => {
    return (
      <td>
        <div className="flex space-x-2">
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

  // Get the current page data
  const pageData = data.slice(page.skip, page.skip + page.take);

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Blocked IP Addresses</h2>
        <div className="flex items-center space-x-4">
          <Button onClick={handleCreate} themeColor="primary">Create New Blocked IP</Button>
          <Button onClick={handleUpdatewAF} themeColor="primary">Update WAF</Button>
          <Button onClick={handleParseLogs} themeColor="primary">Parse Logs</Button>
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
          data={pageData}
          style={{ height: '400px' }}
          sortable={true}
          sort={sort}
          onSortChange={handleSortChange}
          skip={page.skip}
          take={page.take}
          total={data.length}
          pageable={{
            buttonCount: 5,
            pageSizes: [10, 20, 50],
            pageSize: page.take
          }}
          onPageChange={handlePageChange}
        >
          <GridColumn field="ip" title="IP" />
          <GridColumn field="notes" title="Notes" />
          <GridColumn title="Actions" cell={ActionCell} width="200px"/>
          
        </Grid>
      )}

      {showDialog && (
        <Dialog title={editItem ? "Edit Item" : "Create New Blocked IP"} onClose={() => setShowDialog(false)}>
          {showError && (
            <div className="p-3 mb-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-600">{errorMessage}</p>
            </div>
          )}
          <BlockedForm 
            item={editItem}
            onSubmit={handleSubmit}
            onCancel={() => setShowDialog(false)}
            error={showError ? errorMessage : null}
          />
        </Dialog>
      )}
    </div>
  );
};

export default BlockedGrid;