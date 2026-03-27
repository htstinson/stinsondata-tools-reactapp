/* ── my-login-app/src/components/customer/CustomerGrid.jsx ── */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-buttons';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import { CustomerForm } from './CustomerForm';
import ContactGrid from '../contact/ContactGrid';
import { UserContext, useUser } from '../UserContext.jsx';
import { api } from '../../api';

const CustomerGrid = ({ selectedSubscription, onCustomerSelect }) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState([]);
  const [page, setPage] = useState({ skip: 0, take: 10 });
  const [total, setTotal] = useState(0);
  const [editCustomer, setEditCustomer] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  // Contacts state
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [selectedCustomerForContacts, setSelectedCustomerForContacts] = useState(null);
  const [contactsReady, setContactsReady] = useState(false);
  const [triggerCreate, setTriggerCreate] = useState(false);

  // Notification dialog state
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');

  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const userContext = useUser();

  const showNotificationDialog = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
  };

  const handleNotificationClose = () => setShowNotification(false);

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    setCustomerToDelete(null);
  };

  const confirmDelete = () => {
    setShowConfirmation(false);
    performDelete(customerToDelete);
    setCustomerToDelete(null);
  };

  const fetchData = async (background = false) => {
    if (!selectedSubscription) {
      setData([]);
      return;
    }

    try {
      if (!background) setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (sort.length > 0) {
        params.append('sort', sort[0].field);
        params.append('order', sort[0].dir);
      }
      params.append('page', Math.floor(page.skip / page.take) + 1);
      params.append('limit', page.take);

      let url = `/api/v1/subscriber/customers`;
      if (params.toString()) url += `?${params.toString()}`;

      const jsonData = await api.post(url, { id: selectedSubscription.subscriber_id });
      setData(jsonData.data);
      setTotal(jsonData.total);

    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
      showNotificationDialog(`Error loading customers: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Full spinner on subscription change
  useEffect(() => {
    fetchData(false);
    setSelectedCustomerId(null);
    if (onCustomerSelect) onCustomerSelect(null);
  }, [selectedSubscription]);

  // Silent background refresh on sort or page change
  useEffect(() => {
    if (selectedSubscription) fetchData(true);
  }, [sort, page]);

  const handleSortChange = (e) => {
    setPage(p => ({ ...p, skip: 0 }));
    setSort(e.sort);
  };

  const handlePageChange = (e) => {
    setPage({ skip: e.page.skip, take: e.page.take });
  };

  const handleRowClick = (e) => {
    const customer = e.dataItem;
    setSelectedCustomerId(customer.id);
    if (onCustomerSelect) onCustomerSelect(customer);
  };

  const handleShowContacts = (customer, event) => {
    event.stopPropagation();
    setContactsReady(false);
    setSelectedCustomerForContacts(customer);
    setShowContactsModal(true);
  };

  const handleCloseContactsModal = () => {
    setShowContactsModal(false);
    setContactsReady(false);
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
      customer.subscriber_id = selectedSubscription.subscriber_id;
      customer.id ?
        await api.put(`/api/v1/subscriber/customer`, customer) :
        await api.post(`/api/v1/subscriber/customer`, customer);
      setShowDialog(false);
      fetchData(true);
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
      await api.delete(`/api/v1/subscriber/customer/${customer.subscriber_id}/${customer.id}`);
      fetchData(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const ActionCell = (props) => (
    <td>
      <div className="grid-actions">
        <Button onClick={(e) => handleShowContacts(props.dataItem, e)} themeColor="primary" size="small">
          Contacts
        </Button>
        <Button onClick={() => handleEdit(props.dataItem)} themeColor="primary" size="small">
          Edit
        </Button>
        <Button onClick={() => handleDelete(props.dataItem)} themeColor="error" size="small">
          Delete
        </Button>
      </div>
    </td>
  );

  const dataWithSelection = data.map(item => ({
    ...item,
    selected: item.id === selectedCustomerId
  }));

  return (
    <div className="px-4 pt-0 sm:px-0 mt-2">

      {/* Header — hidden only once contacts are ready */}
      {(!showContactsModal || !contactsReady) && (
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold pl-4">Customers</h2>
          <div style={{ paddingRight: '1.5rem' }}>
            <Button onClick={handleCreate} themeColor="primary" disabled={!selectedSubscription}>
              Create New Customer
            </Button>
          </div>
        </div>
      )}

      {/* ContactGrid — mounted hidden until data is ready, then swaps in */}
      {showContactsModal && selectedCustomerForContacts && (
        <div style={{ display: contactsReady ? 'block' : 'none' }}>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold pl-4">
              Contacts for {selectedCustomerForContacts.name}
            </h2>
            <div className="grid-actions" style={{ paddingRight: '1.5rem' }}>
              <Button onClick={handleCloseContactsModal} themeColor="primary">
                ← Back to Customers
              </Button>
              <Button onClick={() => setTriggerCreate(t => !t)} themeColor="primary">
                Create New Contact
              </Button>
            </div>
          </div>
          <ContactGrid
            selectedCustomer={selectedCustomerForContacts}
            hideTitle={true}
            onBack={handleCloseContactsModal}
            triggerCreate={triggerCreate}
            onReady={() => setContactsReady(true)}
          />
        </div>
      )}

      {/* Customer grid — stays visible until contacts are ready */}
      {(!showContactsModal || !contactsReady) && (
        !selectedSubscription ? (
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
              onClick={() => fetchData(false)}
              className="mt-2 bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200"
            >
              Try Again
            </button>
          </div>
        ) : (
          <Grid
            data={dataWithSelection}
            style={{ height: '525px' }}
            sortable={true}
            sort={sort}
            onSortChange={handleSortChange}
            skip={page.skip}
            take={page.take}
            total={total}
            onPageChange={handlePageChange}
            onRowClick={handleRowClick}
            selectedField="selected"
            pageable={{
              buttonCount: 5,
              pageSizes: [10, 20, 50],
            }}
          >
            <GridColumn field="name" title="Name" />
            <GridColumn title="Actions" cell={ActionCell} width="250px" />
          </Grid>
        )
      )}

      {/* Customer Form Dialog */}
      {showDialog && (
        <Dialog
          title={editCustomer ? "Edit Customer" : "Create New Customer"}
          onClose={() => setShowDialog(false)}
        >
          <CustomerForm
            customer={editCustomer}
            onSubmit={handleSubmit}
            onCancel={() => setShowDialog(false)}
          />
        </Dialog>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <Dialog title="Confirm Delete" onClose={handleConfirmationClose} width={400} height={200}>
          <div className="p-4 text-gray-700">
            <p>Are you sure you want to delete this customer?</p>
            {customerToDelete && (
              <p className="mt-2 font-semibold">Customer: {customerToDelete.name}</p>
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