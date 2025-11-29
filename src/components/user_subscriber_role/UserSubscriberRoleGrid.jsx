import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-buttons';
import { Dialog } from '@progress/kendo-react-dialogs';
import { UserSubscriberForm } from './UserSubscriberRoleForm';
import { useRefresh } from '../../context/RefreshContext';
import { useSelection } from '../../context/SelectionContext'; // Import selection context

const UserSubscriberRolesGrid = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState([]);
  const [editUserSubscriber, setEditUserSubscriber] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  
  // Get the refresh and selection contexts
  const { refreshTriggers, triggerRefresh } = useRefresh();
  const { selectedUserSubscriberId } = useSelection();
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      let url = 'https://thousandhillsdigital.net/api/v1/usersubscriberroleview';
      
      const params = new URLSearchParams();
      if (sort.length > 0) {
        params.append('sort', sort[0].field);
        params.append('order', sort[0].dir);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      // Create the request body with the selected userSubscriber ID
      const requestBody = {
        userSubscriber: selectedUserSubscriberId || null
      };

      console.log('Fetching UserSubscriberRoles with body:', JSON.stringify(requestBody));
  
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
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

  // Remove client-side filtering since server handles it now
  // const filteredData is no longer needed

  useEffect(() => {
    fetchData();
  }, [sort, refreshTriggers.userSubscriberRole, selectedUserSubscriberId]);

  const handleSortChange = (e) => {
    setSort(e.sort);
  };

  const handleEdit = (dataItem) => {
    setEditUserSubscriber(dataItem);
    setShowDialog(true);
  };

  const handleCreate = () => {
    // Pre-populate with selected user-subscriber ID if available
    const newUserSubscriber = selectedUserSubscriberId ? {
      user_subscriber_id: parseInt(selectedUserSubscriberId)
    } : null;
    setEditUserSubscriber(newUserSubscriber);
    setShowDialog(true);
  };

  const handleSubmit = async (usersubscriber) => {
    try {
      console.log("Received from form:", usersubscriber);
      
      const token = localStorage.getItem('token');
      const method = usersubscriber.id ? 'PUT' : 'POST';
      const url = usersubscriber.id 
        ? `https://thousandhillsdigital.net/api/v1/usersubscriberrole/${usersubscriber.id}`
        : 'https://thousandhillsdigital.net/api/v1/usersubscriberrole';

      console.log("Submitting user-subscriber-role data:");
      console.log("id:", usersubscriber.id || "New");
      console.log("user_subscriber_id:", usersubscriber.user_subscriber_id);
      console.log("user_id:", usersubscriber.user_id);
      console.log("subscriber_id:", usersubscriber.subscriber_id);
      console.log("role_id:", usersubscriber.role_id);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: usersubscriber.id,
          user_subscriber_id: usersubscriber.user_subscriber_id,
          role_id: usersubscriber.role_id
        })
        
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setShowDialog(false);
      
      // Trigger refresh for the grid
      triggerRefresh('userSubscriberRole');
    } catch (err) {
      setError(err.message);
      console.error('Error submitting form:', err);
    }
  };

  const handleDelete = async (dataItem) => {
    if (window.confirm('Are you sure you want to delete this user-subscriber-role association?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://thousandhillsdigital.net/api/v1/usersubscriberrole/${dataItem.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Trigger refresh for this grid
        triggerRefresh('userSubscriberRole');
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

  // Determine what data to display
  const displayData = selectedUserSubscriberId ? filteredData : data;

  return (
    <div className="px-4 sm:px-0 mb-8">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Subscriber Roles</h2>
          {selectedUserSubscriberId ? (
            <p className="text-sm text-blue-600 mt-1">
              Showing roles for User-Subscriber ID: {selectedUserSubscriberId} ({data.length} records)
            </p>
          ) : (
            <p className="text-sm text-gray-600 mt-1">
              Select a User-Subscriber row above to filter roles ({data.length} total records)
            </p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={handleCreate} 
            themeColor="primary"
            disabled={!selectedUserSubscriberId}
            title={!selectedUserSubscriberId ? "Select a User-Subscriber first" : ""}
          >
            Create New User-Subscriber-Role
          </Button>
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
          <GridColumn field="role_name" title="Role Name" />
          <GridColumn 
            title="Actions" 
            cell={ActionCell}
            width="200px"
          />
        </Grid>
      )}

      {showDialog && (
        <Dialog title={editUserSubscriber ? "Edit User-Subscriber-Role" : "Create New User-Subscriber-Role"} onClose={() => setShowDialog(false)}>
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

export default UserSubscriberRolesGrid;