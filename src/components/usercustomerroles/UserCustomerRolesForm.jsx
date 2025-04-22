import React, { useState, useEffect } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { DropDownList } from '@progress/kendo-react-dropdowns';

export const UserCustomerForm = ({ usercustomer, onSubmit, onCancel }) => {
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(undefined);
  const [selectedUser, setSelectedUser] = useState(undefined);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [errorCustomers, setErrorCustomers] = useState(null);
  const [errorUsers, setErrorUsers] = useState(null);
 
  // Fetch customers from the API on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoadingCustomers(true);
      setErrorCustomers(null);
      
      try {
        // Get authentication token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        const response = await fetch('https://stinsondemo.com/api/v1/customers', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Customer data from API:', data);
        
        // Adjust mapping based on actual API response structure
        const formattedCustomers = Array.isArray(data) 
          ? data.map(customer => ({
              id: customer.id,
              name: customer.name,
              text: customer.name
            }))
          : [];
        
        console.log('Formatted customers:', formattedCustomers);
        setCustomers(formattedCustomers);
        
        // Set selected customer after data has loaded
        if (usercustomer?.customer_id && formattedCustomers.length > 0) {
          const existingCustomer = formattedCustomers.find(
            c => c.id.toString() === usercustomer.customer_id.toString()
          );
          
          console.log('Found existing customer:', existingCustomer);
          if (existingCustomer) {
            setSelectedCustomer(existingCustomer);
          }
        }
      } catch (err) {
        setErrorCustomers('Failed to load customers. Please try again later.');
        console.error('Error fetching customers:', err);
      } finally {
        setIsLoadingCustomers(false);
      }
    };
    
    fetchCustomers();
  }, [usercustomer]);

  // Fetch users from the API on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      setErrorUsers(null);
      
      try {
        // Get authentication token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        const response = await fetch('https://stinsondemo.com/api/v1/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('User data from API:', data);
        
        // Adjust mapping based on actual API response structure
        const formattedUsers = Array.isArray(data) 
          ? data.map(user => ({
              id: user.id,
              username: user.username,
              text: user.username
            }))
          : [];
        
        console.log('Formatted users:', formattedUsers);
        setUsers(formattedUsers);
        
        // Set selected user after data has loaded
        if (usercustomer?.user_id && formattedUsers.length > 0) {
          const existingUser = formattedUsers.find(
            u => u.id.toString() === usercustomer.user_id.toString()
          );
          
          console.log('Found existing user:', existingUser);
          if (existingUser) {
            setSelectedUser(existingUser);
          }
        }
      } catch (err) {
        setErrorUsers('Failed to load users. Please try again later.');
        console.error('Error fetching users:', err);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    
    fetchUsers();
  }, [usercustomer]);

  // Log state changes for debugging
  useEffect(() => {
    console.log('Current customers state:', customers);
  }, [customers]);

  useEffect(() => {
    console.log('Current users state:', users);
  }, [users]);

  useEffect(() => {
    console.log('Current selectedCustomer state:', selectedCustomer);
  }, [selectedCustomer]);

  useEffect(() => {
    console.log('Current selectedUser state:', selectedUser);
  }, [selectedUser]);

  const onFormSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedCustomer || !selectedUser) {
      return;
    }
    
    // Pass both the selected customer and user data to the parent component's onSubmit
    onSubmit({
      id: usercustomer?.id, // Pass the ID if it exists (for updates)
      customer_id: selectedCustomer.id,
      customer_name: selectedCustomer.name,
      user_id: selectedUser.id,
      user_username: selectedUser.username
    });
  };

  return (
    <form onSubmit={onFormSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
        
        {isLoadingCustomers ? (
          <div className="mt-1">Loading customers...</div>
        ) : errorCustomers ? (
          <div className="text-red-500 mt-1">{errorCustomers}</div>
        ) : (
          <div>
            {customers.length > 0 ? (
              <>
                <p className="text-xs text-gray-500 mb-1">Available customers: {customers.length}</p>
                <DropDownList
                  data={customers}
                  textField="text"
                  dataItemKey="id"
                  value={selectedCustomer}
                  onChange={(e) => {
                    console.log("Customer selected:", e.value);
                    setSelectedCustomer(e.value);
                  }}
                  placeholder="Select a customer..."
                  required
                  className="w-full"
                />
              </>
            ) : (
              <div>No customers available</div>
            )}
          </div>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
        
        {isLoadingUsers ? (
          <div className="mt-1">Loading users...</div>
        ) : errorUsers ? (
          <div className="text-red-500 mt-1">{errorUsers}</div>
        ) : (
          <div>
            {users.length > 0 ? (
              <>
                <p className="text-xs text-gray-500 mb-1">Available users: {users.length}</p>
                <DropDownList
                  data={users}
                  textField="text"
                  dataItemKey="id"
                  value={selectedUser}
                  onChange={(e) => {
                    console.log("User selected:", e.value);
                    setSelectedUser(e.value);
                  }}
                  placeholder="Select a user..."
                  required
                  className="w-full"
                />
              </>
            ) : (
              <div>No users available</div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex justify-end space-x-2 mt-4">
        <Button onClick={onCancel} themeColor="light">
          Cancel
        </Button>
        <Button 
          type="submit" 
          themeColor="primary"
          disabled={!selectedCustomer || !selectedUser || isLoadingCustomers || isLoadingUsers}
        >
          Save
        </Button>
      </div>
    </form>
  );
};