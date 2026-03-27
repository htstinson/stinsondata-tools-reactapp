/* ── my-login-app/src/components/contact/ContactGrid.jsx ── */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-buttons';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import ContactForm from '../contact/ContactForm';
import { UserContext, useUser } from '../UserContext.jsx'; 
import { api } from '../../api';

const ContactGrid = ({ selectedCustomer, hideTitle = false, onBack = null, onReady = null, triggerCreate = false }) => {
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
  const [notificationType, setNotificationType] = useState('success');
  
  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  
  const userContext = useUser();
  
  const showNotificationDialog = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
  };

  const handleNotificationClose = () => setShowNotification(false);

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
    if (!selectedCustomer) {
      setData([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
  
      let url = 'https://thousandhillsdigital.net/api/v1/subscriber/customer/contacts';
      
      const params = new URLSearchParams();
      if (sort.length > 0) {
        params.append('sort', sort[0].field);
        params.append('order', sort[0].dir);
      }
      if (params.toString()) url += `?${params.toString()}`;
  
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedCustomer)
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
      if (onReady) onReady();
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
      showNotificationDialog(`Error loading contacts: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Open create dialog when parent triggers it
  useEffect(() => {
    if (triggerCreate) handleCreate();
  }, [triggerCreate]);

  useEffect(() => {
    fetchData();
  }, [selectedCustomer, sort]);

  const handleSortChange = (e) => setSort(e.sort);

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
      contact.subscriber_id = selectedCustomer.subscriber_id;
      contact.parent_id = selectedCustomer.id;
      contact.id ?  
        await api.put(`/api/v1/subscriber/customer/contact`, contact) :  
        await api.post(`/api/v1/subscriber/customer/contact`, contact);
      setShowDialog(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = (dataItem) => {
    setContactToDelete(dataItem);
    setShowConfirmation(true);
  };

  const performDelete = async (contact) => {
    try {
      await api.delete(`/api/v1/subscriber/contact/${contact.subscriber_id}/${contact.id}`);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const ActionCell = (props) => (
    <td>
      <div className="grid-actions">
        <Button onClick={() => handleEdit(props.dataItem)} themeColor="info" size="small">Edit</Button>
        <Button onClick={() => handleDelete(props.dataItem)} themeColor="error" size="small">Delete</Button>
      </div>
    </td>
  );

  return (
    <div className="px-4 sm:px-0">
      {/* Only show the title/toolbar when not embedded */}
      {/* Toolbar only shown when ContactGrid is used standalone */}
      {!hideTitle && (
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            Contacts {selectedCustomer && `for ${selectedCustomer.name}`}
          </h2>
          <div className="flex items-center space-x-4">
            <Button onClick={handleCreate} themeColor="primary" disabled={!selectedCustomer}>
              Create New Contact
            </Button>
            <Button onClick={fetchData} themeColor="light">Refresh</Button>
          </div>
        </div>
      )}

      {/* When embedded, show a compact toolbar with just the Create button */}


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
          <button onClick={fetchData} className="mt-2 bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200">
            Try Again
          </button>
        </div>
      ) : (
        <Grid
          data={data}
          style={{ height: '525px' }}
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
          <GridColumn field="job_title" title="Job Title" />
          <GridColumn field="department" title="Department" />
          <GridColumn title="Actions" cell={ActionCell} width="200px" />
        </Grid>
      )}

      {/* Contact Form Dialog */}
      {showDialog && (
        <Dialog
          title={editContact ? "Edit Contact" : "Create New Contact"}
          onClose={() => setShowDialog(false)}
        >
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
        <Dialog title="Confirm Delete" onClose={handleConfirmationClose} width={400} height={200}>
          <div className="p-4 text-gray-700">
            <p>Are you sure you want to delete this contact?</p>
            {contactToDelete && (
              <p className="mt-2 font-semibold">
                Contact: {contactToDelete.first_name} {contactToDelete.last_name}
              </p>
            )}
          </div>
          <DialogActionsBar>
            <Button onClick={handleConfirmationClose} themeColor="light">Cancel</Button>
            <Button onClick={confirmDelete} themeColor="error" className="ml-2">Delete</Button>
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
            <Button primary onClick={handleNotificationClose} themeColor={notificationType === 'success' ? 'primary' : 'error'}>
              OK
            </Button>
          </DialogActionsBar>
        </Dialog>
      )}
    </div>
  );
};

export default ContactGrid;