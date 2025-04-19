import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-buttons';
import { Dialog } from '@progress/kendo-react-dialogs';
import { UserCustomerForm } from './UserCustomerForm';

const UserCustomerGrid = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState([]);
  const [editUserCustomer, setEditUserCustomer] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      let url = 'https://stinsondemo.com/api/v1/usercustomerview';
      
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
          navigate('/login');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jsonData = await response.json();

      console.log(jsonData)

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
  }, [sort]);

  const handleSortChange = (e) => {
    setSort(e.sort);
  };

  const handleEdit = (dataItem) => {
    setEditUserCustomer(dataItem);
    setShowDialog(true);
  };

  const handleCreate = () => {
    setEditUserCustomer(null);
    setShowDialog(true);
  };

  const handleSubmit = async (usercustomer) => {
    console.log(usercustomer.customer_name)
    try {
      const token = localStorage.getItem('token');
      const method = editUserCustomer?.id ? 'PUT' : 'POST';
      const url = editUserCustomer?.id 
        ? `https://stinsondemo.com/api/v1/usercustomer/${editUserCustomer.id}`
        : 'https://stinsondemo.com/api/v1/usercustomer';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(usercustomer)
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
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://stinsondemo.com/api/v1/usercustomer/${dataItem.id}`, {
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
      <div className="mb-4 flex justify-between customers-center">
        <h2 className="text-2xl font-bold">User-Customers</h2>
        <div className="flex customers-center space-x-4">
          <Button onClick={handleCreate} themeColor="primary">Create New User-Customer</Button>
          <Button onClick={fetchData} themeColor="light">Refresh</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center customers-center h-64">
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
          <GridColumn field="user_username" title="User Name" />
          <GridColumn field="customer_name" title="Customer Name" />
          <GridColumn 
            title="Actions" 
            cell={ActionCell}
            width="200px"
          />
        </Grid>
      )}

      {showDialog && (
        <Dialog title={editUserCustomer ? "Edit User-Customer" : "Create New User-Customer"} onClose={() => setShowDialog(false)}>
          <UserCustomerForm 
            usercustomer={editUserCustomer}
            onSubmit={handleSubmit}
            onCancel={() => setShowDialog(false)}
          />
        </Dialog>
      )}
    </div>
  );
};

export default UserCustomerGrid;