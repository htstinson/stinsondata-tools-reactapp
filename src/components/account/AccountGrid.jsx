import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-buttons';
import { DatePicker } from '@progress/kendo-react-dateinputs';
import { Dialog } from '@progress/kendo-react-dialogs';
import { AccountForm } from './AccountForm';

const AccountGrid = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState([]);
  const [editAccount, setEditAccount] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dateFilter, setDateFilter] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      let url = 'https://thousandhillsdigital.net/api/v1/accounts';
      
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

  useEffect(() => {
    fetchData();
  }, [sort, dateFilter]);

  const handleSortChange = (e) => {
    setSort(e.sort);
  };

  const handleEdit = (dataItem) => {
    setEditAccount(dataItem);
    setShowDialog(true);
  };

  const handleCreate = () => {
    setEditAccount(null);
    setShowDialog(true);
  };

  const handleSubmit = async (account) => {
    try {
      const token = localStorage.getItem('token');
      const method = account.Id ? 'PATCH' : 'POST';
      const url = account.Id 
        ? `https://thousandhillsdigital.net/api/v1/accounts/${account.Id}`
        : 'https://thousandhillsdigital.net/api/v1/accounts';

       const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(account)
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
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://thousandhillsdigital.net/api/v1/accounts/${dataItem.id}`, {
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
    <div className="px-4 sm:px-0">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Accounts</h2>
        <div className="flex items-center space-x-4">
          <DatePicker
            placeholder="Filter by date..."
            value={dateFilter}
            onChange={(e) => setDateFilter(e.value)}
            format="yyyy-MM-dd"
          />
          <Button onClick={handleCreate} themeColor="primary">Create New Account</Button>
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
          <GridColumn field="Name" title="Name" />
          <GridColumn field="Phone" title="Phone" />
          <GridColumn field="Type" title="Type" />
          <GridColumn field="AccountSource" title="Source" />
          <GridColumn title="Actions" cell={ActionCell} width="200px" />
        </Grid>
      )}

      {showDialog && (
        <Dialog title={editAccount ? "Edit Account" : "Create New Account"} onClose={() => setShowDialog(false)}>
          <AccountForm 
            account={editAccount}
            onSubmit={handleSubmit}
            onCancel={() => setShowDialog(false)}
          />
        </Dialog>
      )}
    </div>
  );
};

export default AccountGrid;