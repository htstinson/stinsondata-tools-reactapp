import React, { useState, useEffect } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { DropDownList } from '@progress/kendo-react-dropdowns';

export const UserCustomerForm = ({ usercustomer, onSubmit, onCancel }) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch customers from the API on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      setError(null);
      
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
        
        // Log the actual structure to help debug
        console.log('API response data:', data);
        
        // Adjust mapping based on actual API response structure
        const formattedCustomers = Array.isArray(data) 
          ? data.map(customer => ({
              id: customer.id,
              name: customer.name,
              text: `${customer.name}`
            }))
          : [];
        
        setCustomers(formattedCustomers);
        
        // If editing an existing customer, set the selected customer
        if (usercustomer?.customer_id) {
          const existingCustomer = formattedCustomers.find(
            c => c.id.toString() === usercustomer.customer_id.toString()
          );
          
          if (existingCustomer) {
            setSelectedCustomer(existingCustomer);
          }
        }
      } catch (err) {
        setError('Failed to load customers. Please try again later.');
        console.error('Error fetching customers:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomers();
  }, [usercustomer]);

  const onFormSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedCustomer) {
      return;
    }
    
    // Just pass the selected customer data to the parent component's onSubmit
    onSubmit({
      customer_id: selectedCustomer.id,
      customer_name: selectedCustomer.name
    });
  };

  // Item template for the dropdown
  const customerItemTemplate = (item) => {
    // Only render this template for actual customer items, not for placeholder text
    if (!item || !item.name) return null;
    
    return (
      <div>
        <strong>{item.name}</strong> <span className="text-gray-500">({item.id.substring(0, 8)}...)</span>
      </div>
    );
  };

  return (
    <form onSubmit={onFormSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
        
        {isLoading ? (
          <div className="mt-1">Loading customers...</div>
        ) : error ? (
          <div className="text-red-500 mt-1">{error}</div>
        ) : (
          <DropDownList
            data={customers}
            textField="text"
            valueField="id"
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.value)}
            placeholder="Select a customer..."
            required
            className="w-full"
          />
        )}
      </div>
      
      <div className="flex justify-end space-x-2 mt-4">
        <Button onClick={onCancel} themeColor="light">
          Cancel
        </Button>
        <Button 
          type="submit" 
          themeColor="primary"
          disabled={!selectedCustomer || isLoading}
        >
          Save
        </Button>
      </div>
    </form>
  );
};