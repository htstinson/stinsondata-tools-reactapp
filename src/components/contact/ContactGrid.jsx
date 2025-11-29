import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-buttons';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import ContactForm from '../contact/ContactForm'; // Import ContactForm instead of CustomerForm
import { UserContext, useUser } from '../UserContext.jsx'; 

const ContactGrid = ({ selectedCustomer }) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState([]);
  const [editContact, setEditContact] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  
  // Notification dialog state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success'); // 'success' or 'error'
  
  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  
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
    setContactToDelete(null);
  };

  const confirmDelete = () => {
    setShowConfirmation(false);
    performDelete(contactToDelete);
    setContactToDelete(null);
  };
  
  const fetchData = async () => {
    // Don't fetch if no customer is selected
    if (!selectedCustomer) {
      setData([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const currentUser = userContext?.currentUser;

      console.log('currentuser', currentUser);
      console.log('selectedCustomer', selectedCustomer);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      let url = 'https://thousandhillsdigital.net/api/v1/subscriber/customer/contacts';
      
      const params = new URLSearchParams();
      if (sort.length > 0) {
        params.append('sort', sort[0].field);
        params.append('order', sort[0].dir);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }
  
      // Send both current user and selected customer info
      const requestBody = {
        ...currentUser,
        customer_id: selectedCustomer.id
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedCustomer)
      });

      console.log('body:', JSON.stringify(selectedCustomer));
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jsonData = await response.json();

      console.log(jsonData);

      setData(jsonData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
      showNotificationDialog(`Error loading contacts: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch contacts when selectedCustomer changes
  useEffect(() => {
    fetchData();
  }, [selectedCustomer, sort]);

  const handleSortChange = (e) => {
    setSort(e.sort);
  };

  const handleEdit = (dataItem) => {
    setEditContact(dataItem);
    setShowDialog(true);
  };

  const handleCreate = () => {
    setEditContact(null);
    setShowDialog(true);
  };

  const handleSubmit = async (contact) => {
    try {
      const token = localStorage.getItem('token');
      const method = contact.id ? 'PUT' : 'POST';
      const isEdit = !!contact.id;

      const url = contact?.id 
      ? `https://thousandhillsdigital.net/api/v1/subscriber/customer/contact`
      : 'https://thousandhillsdigital.net/api/v1/subscriber/customer/contact';
                  
      // Add customer_id to new contacts
      if (!contact.id && selectedCustomer) {
        contact.parent_id = selectedCustomer.id;
        contact.schema_name = selectedCustomer.schema_name;
      }

      console.log(contact);

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contact)
      });

      console.log(method, url, JSON.stringify(contact))

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setShowDialog(false);
      fetchData();
      
      // Show success notification
      const actionText = isEdit ? 'updated' : 'created';
      showNotificationDialog(`Contact ${actionText} successfully!`, 'success');
      
    } catch (err) {
      setError(err.message);
      showNotificationDialog(`Error saving contact: ${err.message}`, 'error');
    }
  };

  const handleDelete = (dataItem) => {
    setContactToDelete(dataItem);
    setShowConfirmation(true);
  };

  const performDelete = async (dataItem) => {
    dataItem.schema_name = selectedCustomer.schema_name
    console.log(JSON.stringify(dataItem))
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://thousandhillsdigital.net/api/v1/subscriber/customer/contactd`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataItem)
      });

      if (!response.ok) {
        if (response.status === 409) {
          showNotificationDialog('Cannot delete contact - there are dependencies that prevent deletion.', 'error');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      fetchData();
      showNotificationDialog('Contact deleted successfully!', 'success');
      
    } catch (err) {
      setError(err.message);
      showNotificationDialog(`Error deleting contact: ${err.message}`, 'error');
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
        <h2 className="text-2xl font-bold">
          Contacts {selectedCustomer && `for ${selectedCustomer.name}`}
        </h2>
        <div className="flex items-center space-x-4">
          <Button 
            onClick={handleCreate} 
            themeColor="primary"
            disabled={!selectedCustomer}
          >
            Create New Contact
          </Button>
          <Button onClick={fetchData} themeColor="light">Refresh</Button>
        </div>
      </div>

      {!selectedCustomer ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Select a customer to view contacts</div>
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
          <GridColumn field="last_name" title="Last Name" />
          <GridColumn field="first_name" title="First Name" />
          <GridColumn field="email" title="Email" />
          <GridColumn field="phone" title="Phone" />
          <GridColumn field="title" title="Job Title" />
          <GridColumn 
            title="Actions" 
            cell={ActionCell}
            width="200px"
          />
        </Grid>
      )}

      {/* Contact Form Dialog */}
      {showDialog && (
        <Dialog title={editContact ? "Edit Contact" : "Create New Contact"} onClose={() => setShowDialog(false)}>
          <ContactForm 
            contact={editContact}
            selectedCustomer={selectedCustomer}
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
            <p>Are you sure you want to delete this contact?</p>
            {contactToDelete && (
              <p className="mt-2 font-semibold">
                Contact: {contactToDelete.first_name} {contactToDelete.last_name}
              </p>
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

export default ContactGrid;