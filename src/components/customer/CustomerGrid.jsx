import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-buttons';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { CustomerForm } from './CustomerForm';
import { UserContext, useUser } from '../UserContext.jsx'; 

const CustomerGrid = ({ selectedSubscription, onCustomerSelect }) => {  // Add selectedSubscription prop
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);  // Changed to false initially
  const [error, setError] = useState(null);
  const [sort, setSort] = useState([]);
  const [editCustomer, setEditCustomer] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  
  // Notification dialog state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  
  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  
  const userContext = useUser();
  
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
    setCustomerToDelete(null);
  };

  const confirmDelete = () => {
    setShowConfirmation(false);
    performDelete(customerToDelete);
    setCustomerToDelete(null);
  };
  
  const fetchData = async () => {
    // Don't fetch if no subscription is selected
    if (!selectedSubscription) {
      console.log('No subscription selected, clearing customer data');
      setData([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const currentUser = userContext?.currentUser;

      console.log('Fetching customers for subscription:', selectedSubscription);
      console.log('currentuser', currentUser);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      const url = 'https://thousandhillsdigital.net/api/v1/subscriber/customers'
      
      const params = new URLSearchParams();
      if (sort.length > 0) {
        params.append('sort', sort[0].field);
        params.append('order', sort[0].dir);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      // Include subscription info in request body
      const requestBody = {
       // ...currentUser,
        id: selectedSubscription.subscriber_id || selectedSubscription.id
      };

      console.log('Request body:', requestBody);
  
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

      console.log('Customers loaded:', jsonData);

      setData(jsonData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
      showNotificationDialog(`Error loading customers: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('selectedSubscription changed:', selectedSubscription);
    fetchData();
    // Clear customer selection when subscription changes
    setSelectedCustomerId(null);
    if (onCustomerSelect) {
      onCustomerSelect(null);
    }
  }, [selectedSubscription, sort]);  // Add selectedSubscription to dependencies

  const handleSortChange = (e) => {
    setSort(e.sort);
  };

  const handleRowClick = (e) => {
    const customer = e.dataItem;
    setSelectedCustomerId(customer.id);
    
    console.log('Customer selected:', customer);
    
    // Call the parent callback to update contacts
    if (onCustomerSelect) {
      onCustomerSelect(customer);
    }
  };

  const handleEdit = (dataItem) => {
    setEditCustomer(dataItem);
    setShowDialog(true);
  };

  const handleCreate = () => {
    setEditCustomer(null);
    setShowDialog(true);
  };

 const handleSubmit = async (customer) => {
  try {
    const token = localStorage.getItem('token');
    const method = customer.id ? 'PUT' : 'POST';
    const isEdit = !!customer.id;

    const url = 'https://thousandhillsdigital.net/api/v1/subscriber/customer';
    
    // FIX: Use selectedSubscription instead of userContext
    customer.subscriber_id = selectedSubscription.subscriber_id;

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customer)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    setShowDialog(false);
    fetchData();
    
    const actionText = isEdit ? 'updated' : 'created';
    showNotificationDialog(`Customer ${actionText} successfully!`, 'success');
    
  } catch (err) {
    setError(err.message);
    showNotificationDialog(`Error saving customer: ${err.message}`, 'error');
  }
};

  const handleDelete = (customer) => {
    setCustomerToDelete(customer);
    setShowConfirmation(true);
  };

  const performDelete = async (customer) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://thousandhillsdigital.net/api/v1/subscriber/customerd`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(customer)
      });

      if (!response.ok) {
        if (response.status === 409) {
          showNotificationDialog('Cannot delete customer - there are still contacts associated with this customer. Please delete all contacts first.', 'error');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      fetchData();
      showNotificationDialog('Customer deleted successfully!', 'success');
      
    } catch (err) {
      setError(err.message);
      showNotificationDialog(`Error deleting customer: ${err.message}`, 'error');
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

  // Add selection to data for visual feedback
  const dataWithSelection = data.map(item => ({
    ...item,
    selected: item.id === selectedCustomerId
  }));

  return (
    <div className="px-4 sm:px-0 mt-8">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          Customers {selectedSubscription && `for ${selectedSubscription.subscriber_name || selectedSubscription.name || 'Selected Subscription'}`}
        </h2>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={handleCreate} 
            themeColor="primary"
            disabled={!selectedSubscription}
          >
            Create New Customer
          </Button>
          <Button onClick={fetchData} themeColor="light">Refresh</Button>
        </div>
      </div>

      {!selectedSubscription ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Select a subscription to view customers</div>
        </div>
      ) : loading ? (
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
          data={dataWithSelection}
          style={{ height: '400px' }}
          sortable={true}
          sort={sort}
          onSortChange={handleSortChange}
          onRowClick={handleRowClick}
          selectedField="selected"
          pageable={{
            buttonCount: 5,
            pageSizes: [10, 20, 50],
            pageSize: 10
          }}
        >
          <GridColumn field="name" title="Name" />
          <GridColumn 
            title="Actions" 
            cell={ActionCell}
            width="200px"
          />
        </Grid>
      )}

      {/* Customer Form Dialog */}
      {showDialog && (
        <Dialog title={editCustomer ? "Edit Customer" : "Create New Customer"} onClose={() => setShowDialog(false)}>
          <CustomerForm 
            customer={editCustomer}
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
            <p>Are you sure you want to delete this customer?</p>
            {customerToDelete && (
              <p className="mt-2 font-semibold">Customer: {customerToDelete.name}</p>
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

export default CustomerGrid;