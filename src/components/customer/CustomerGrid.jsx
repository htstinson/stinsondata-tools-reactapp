import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { Button } from '@progress/kendo-react-buttons';
import { Dialog } from '@progress/kendo-react-dialogs';
import { CustomerForm } from './CustomerForm';
import { UserContext, useUser } from '../UserContext.jsx'; 

const CustomerGrid = ({ onCustomerSelect }) => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState([]);
  const [editCustomer, setEditCustomer] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const userContext = useUser();
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = userContext?.currentUser;

      console.log('currentuser', currentUser)
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      let url = 'https://stinsondemo.com/api/v1/subscriber/customers';
      
      const params = new URLSearchParams();
      if (sort.length > 0) {
        params.append('sort', sort[0].field);
        params.append('order', sort[0].dir);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }
  
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(currentUser)
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

      console.log(jsonData);

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

  const handleRowClick = (e) => {
    const customer = e.dataItem;
    setSelectedCustomerId(customer.id);
    
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

      const url = customer?.id 
      ? `https://stinsondemo.com/api/v1/subscribers/customers`
      : 'https://stinsondemo.com/api/v1/subscriber/customer';

      customer.subscriber_id = userContext.currentUser.subscribed[0].subscriber_id;

      console.log(customer);

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
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (dataItem) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://stinsondemo.com/api/v1/customers/${dataItem.id}`, {
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
        <h2 className="text-2xl font-bold">Customers</h2>
        <div className="flex items-center space-x-4">
          <Button onClick={handleCreate} themeColor="primary">Create New Customer</Button>
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
          onRowClick={handleRowClick}
          selectedField="selected"
          pageable={{
            buttonCount: 5,
            pageSizes: [10, 20, 50],
            pageSize: 10
          }}
        >
          <GridColumn field="name" title="Name" />
          <GridColumn field="id" title="Id" />
          <GridColumn field="schema_name" title="Schema" />
          <GridColumn 
            title="Actions" 
            cell={ActionCell}
            width="200px"
          />
        </Grid>
      )}

      {showDialog && (
        <Dialog title={editCustomer ? "Edit Customer" : "Create New Customer"} onClose={() => setShowDialog(false)}>
          <CustomerForm 
            customer={editCustomer}
            onSubmit={handleSubmit}
            onCancel={() => setShowDialog(false)}
          />
        </Dialog>
      )}
    </div>
  );
};

export default CustomerGrid;