import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-buttons';
import { Dialog } from '@progress/kendo-react-dialogs';
import { UserSubscriberForm } from './UserSubscriberForm';
import { useRefresh } from '../../context/RefreshContext'; // Import the refresh context

const UserSubscriberGrid = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState([]);
  const [editUserSubscriber, setEditUserSubscriber] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  
  // Get the refresh context
  const { refreshTriggers, triggerMultipleRefresh } = useRefresh();
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      let url = 'https://stinsondemo.com/api/v1/usersubscriberview';
      
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
      setData(jsonData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update the useEffect to include the refresh trigger
  useEffect(() => {
    fetchData();
  }, [sort, refreshTriggers.userSubscriber]);

  const handleSortChange = (e) => {
    setSort(e.sort);
  };

  const handleEdit = (dataItem) => {
    setEditUserSubscriber(dataItem);
    setShowDialog(true);
  };

  const handleCreate = () => {
    setEditUserSubscriber(null);
    setShowDialog(true);
  };

  const handleSubmit = async (usersubscriber) => {
    try {
      const token = localStorage.getItem('token');
      const method = editUserSubscriber?.id ? 'PUT' : 'POST';
      const url = editUserSubscriber?.id 
        ? `https://stinsondemo.com/api/v1/usersubscriber/${editUserSubscriber.id}`
        : 'https://stinsondemo.com/api/v1/usersubscriber';

      console.log("Submitting user-subscriber data:");
      console.log("id:", usersubscriber.id || "New");
      console.log("user_id:", usersubscriber.user_id);
      console.log("subscriber_id:", usersubscriber.subscriber_id);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: usersubscriber.id,
          user_id: usersubscriber.user_id,
          subscriber_id: usersubscriber.subscriber_id
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setShowDialog(false);
      
      // Trigger refresh for this grid and userSubscriberRole grid
      triggerMultipleRefresh(['userSubscriber', 'userSubscriberRole']);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (dataItem) => {
    if (window.confirm('Are you sure you want to delete this user-subscriber association?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://stinsondemo.com/api/v1/usersubscriber/${dataItem.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Trigger refresh for both this grid and userSubscriberRole grid
        triggerMultipleRefresh(['userSubscriber', 'userSubscriberRole']);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const fetchCustomers = async (dataItem) => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://stinsondemo.com/api/v1/customers/subscriber/${dataItem.subscriber_id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Note: The original code was calling fetchCustomers() recursively which seems like a mistake
        // Instead, we probably want to do something with the response
        const customersData = await response.json();
        console.log('Customers data:', customersData);
        
        // If this action should refresh other grids, add them here
        // triggerMultipleRefresh(['customerGrid']);
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
          <Button 
            onClick={() => fetchCustomers(props.dataItem)}
            themeColor="error"
            size="small"
          >
            Fetch Customers
          </Button>
        </div>
      </td>
    );
  };

  return (
    <div className="px-4 sm:px-0">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">User-Subscriber</h2>
        <div className="flex items-center space-x-4">
          <Button onClick={handleCreate} themeColor="primary">Create New User-Subscriber</Button>
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
          <GridColumn field="user_username" title="User Name" />
          <GridColumn field="subscriber_name" title="Subscriber Name" />
          <GridColumn 
            title="Actions" 
            cell={ActionCell}
            width="200px"
          />
        </Grid>
      )}

      {showDialog && (
        <Dialog title={editUserSubscriber ? "Edit User-Subscriber" : "Create New User-Subscriber"} onClose={() => setShowDialog(false)}>
          <UserSubscriberForm 
            usersubscriber={editUserSubscriber}
            onSubmit={handleSubmit}
            onCancel={() => setShowDialog(false)}
          />
        </Dialog>
      )}
    </div>
  );
};

export default UserSubscriberGrid;