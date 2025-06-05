import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-buttons';
import { Dialog } from '@progress/kendo-react-dialogs';
//import { CustomerForm } from './CustomerForm';
import { UserContext, useUser } from '../UserContext.jsx'; 

const ContactGrid = ({ selectedCustomer }) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState([]);
  const [editContact, setEditContact] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const userContext = useUser();
  
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
  
      let url = 'https://stinsondemo.com/api/v1/subscriber/customer/contacts';
      
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

      const url = contact?.id 
      ? `https://stinsondemo.com/api/v1/subscriber/customer/contacts`
      : 'https://stinsondemo.com/api/v1/subscriber/customer/contact';

      contact.subscriber_id = userContext.currentUser.subscribed[0].subscriber_id;
      
      // Add customer_id to new contacts
      if (!contact.id && selectedCustomer) {
        contact.customer_id = selectedCustomer.id;
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
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://stinsondemo.com/api/v1/contacts/${dataItem.id}`, {
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
          <GridColumn field="name" title="Name" />
          <GridColumn field="id" title="Id" />
          <GridColumn 
            title="Actions" 
            cell={ActionCell}
            width="200px"
          />
        </Grid>
      )}

      {showDialog && (
        <Dialog title={editContact ? "Edit Contact" : "Create New Contact"} onClose={() => setShowDialog(false)}>
          <CustomerForm 
            contact={editContact}
            onSubmit={handleSubmit}
            onCancel={() => setShowDialog(false)}
          />
        </Dialog>
      )}
    </div>
  );
};

export default ContactGrid;