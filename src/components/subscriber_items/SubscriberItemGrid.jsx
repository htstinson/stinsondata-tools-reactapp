import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-buttons';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { SubscriberItemForm } from './SubscriberItemForm';

const SubscriberItemGrid = ({ selectedSubscription, onSubscriptionSelect }) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState([]);
  const [editSubscriberItem, setEditSubscriberItem] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  
  // Notification dialog state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  
  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Function to show notification
  const showNotificationDialog = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
  };

  const handleNotificationClose = () => {
    setShowNotification(false);
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    setItemToDelete(null);
  };

  const confirmDelete = () => {
    setShowConfirmation(false);
    performDelete(itemToDelete);
    setItemToDelete(null);
  };

  const fetchData = async () => {
    try {

    if (!selectedSubscription) {
      console.log('No subscription selected, clearing customer data');
      setData([]);
      return;
    }

      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      console.log('Fetching items for subscription:', selectedSubscription.subscriber_id);

      let url = `https://thousandhillsdigital.net/api/v1/subscriber/items/${selectedSubscription.subscriber_id}`;
      
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
      console.log('Subscriber items loaded:', jsonData);
      setData(jsonData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
      showNotificationDialog(`Error loading subscriber items: ${err.message}`, 'error');
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

  const handleEdit = (dataItem) => {
    setEditSubscriberItem(dataItem);
    setShowDialog(true);
  };

  const handleCreate = () => {
    setEditSubscriberItem(null);
    setShowDialog(true);
  };

  const handleSubmit = async (subscriberItem) => {
    try {
      const token = localStorage.getItem('token');
      const method = subscriberItem.id ? 'PUT' : 'POST';
      const isEdit = !!subscriberItem.id;

      const url = 'https://thousandhillsdigital.net/api/v1/subscriber/item';

      console.log('Submitting subscriber item:', JSON.stringify(subscriberItem));

      console.log(url)
      console.log(method)

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subscriberItem)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setShowDialog(false);
      fetchData();
      
      const actionText = isEdit ? 'updated' : 'created';
      showNotificationDialog(`Subscriber item ${actionText} successfully!`, 'success');
      
    } catch (err) {
      setError(err.message);
      showNotificationDialog(`Error saving subscriber item: ${err.message}`, 'error');
    }
  };

  const handleDelete = async (item) => {
  console.log(`https://thousandhillsdigital.net/api/v1/subscriber/item/${item.id}`);

  if (window.confirm('Are you sure you want to delete this subscriber_item?')) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://thousandhillsdigital.net/api/v1/subscriber/item/${item.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh the grid after successful deletion
      fetchData();
      showNotificationDialog('Subscriber item deleted successfully!', 'success');

    } catch (err) {
      setError(err.message);
      showNotificationDialog(`Error deleting subscriber item: ${err.message}`, 'error');
    }
  }
};

  const performDelete = async (item) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://thousandhillsdigital.net/api/v1/subscriber-item`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: item.id })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      fetchData();
      showNotificationDialog('Subscriber item deleted successfully!', 'success');
      
    } catch (err) {
      setError(err.message);
      showNotificationDialog(`Error deleting subscriber item: ${err.message}`, 'error');
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

  const DateCell = (props) => {
    const date = new Date(props.dataItem[props.field]);
    return (
      <td>
        {date.toLocaleString()}
      </td>
    );
  };

  return (
    <div className="px-4 sm:px-0 mt-8">
      <div className="mb-4 flex justify-between items-center">
       <h2 className="text-2xl font-bold">
          Services {selectedSubscription && `for ${selectedSubscription.subscriber_name || selectedSubscription.name}`}
        </h2>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={handleCreate} 
            themeColor="primary"
          >
            Create New Subscriber Item
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
          style={{ height: '500px' }}
          sortable={true}
          sort={sort}
          onSortChange={handleSortChange}
          pageable={{
            buttonCount: 5,
            pageSizes: [10, 20, 50],
            pageSize: 10
          }}
        >
          <GridColumn field="item_name" title="Item" width="250px" />
          <GridColumn field="created_at" title="Created" width="200px" cell={DateCell} />
          <GridColumn title="Actions"  cell={ActionCell} width="200px" />
        </Grid>
      )}

      {/* Subscriber Item Form Dialog */}
      {showDialog && (
        <Dialog 
          title={editSubscriberItem ? "Edit Subscriber Item" : "Create New Subscriber Item"} 
          onClose={() => setShowDialog(false)}
          width={500}
        >
          <SubscriberItemForm 
            subscriberItem={editSubscriberItem}
            onSubmit={handleSubmit}
            onCancel={() => setShowDialog(false)}
          />
        </Dialog>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <Dialog 
          title="Confirm Delete"
          onClose={handleConfirmationClose}
          width={400}
          height={200}
        >
          <div className="p-4 text-gray-700">
            <p>Are you sure you want to delete this subscriber item?</p>
            {itemToDelete && (
              <div className="mt-2">
                <p className="font-semibold">Subscriber: {itemToDelete.subscriber_name}</p>
                <p className="font-semibold">Item: {itemToDelete.item_name}</p>
              </div>
            )}
          </div>
          <DialogActionsBar>
            <Button 
              onClick={handleConfirmationClose}
              themeColor="light"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDelete}
              themeColor="error"
              className="ml-2"
            >
              Delete
            </Button>
          </DialogActionsBar>
        </Dialog>
      )}

      {/* Notification Dialog */}
      {showNotification && (
        <Dialog 
          title={notificationType === 'success' ? "Success" : "Error"}
          onClose={handleNotificationClose}
          width={400}
          height={200}
        >
          <div className={`p-4 ${notificationType === 'success' ? 'text-green-700' : 'text-red-700'}`}>
            <p>{notificationMessage}</p>
          </div>
          <DialogActionsBar>
            <Button 
              primary 
              onClick={handleNotificationClose}
              themeColor={notificationType === 'success' ? 'primary' : 'error'}
            >
              OK
            </Button>
          </DialogActionsBar>
        </Dialog>
      )}
    </div>
  );
};

export default SubscriberItemGrid;