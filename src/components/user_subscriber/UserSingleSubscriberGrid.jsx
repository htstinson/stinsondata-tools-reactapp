import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, GridColumn } from '@progress/kendo-react-grid';

import { UserContext, useUser } from '../UserContext.jsx'; 

const UserSingleSubscriberGrid = ({ onSubscriptionSelect }) => {  // Add this prop
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  const userContext = useUser();
  
  if (!userContext) {
      return null;
  }
    
  const { currentUser, logout } = userContext;

  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      let url = `https://thousandhillsdigital.net/api/v1/usersubscriberview/user/${currentUser.user_id}`;
      
      const params = new URLSearchParams();
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
  }, []); // Add empty dependency array to prevent infinite loop

  // Add row click handler
  const handleRowClick = (e) => {
    const subscription = e.dataItem;
    
    // Update selected rows for visual feedback
    setSelectedRows([subscription]);
    
    console.log('Subscription selected:', subscription);
    
    // Call parent callback
    if (onSubscriptionSelect) {
      onSubscriptionSelect(subscription);
    }
  };

 
  return (
    <div className="px-4 sm:px-0 mb-8">
      <div className="mb-4 flex justify-between items-center">
        <div> 
          <h2 className="text-2xl font-bold">My Subscriptions</h2>
        </div>
      </div>
      <Grid
        data={data.map(item => ({ ...item, selected: selectedRows.some(row => row.id === item.id) }))}
        style={{ height: '400px' }}
        onRowClick={handleRowClick}  // Add this
        selectedField="selected"      // Add this
      >
        <GridColumn field="subscriber_name" title="Subscriber Name" />
        <GridColumn field="subscriber_id" title="Subscriber ID" />
      </Grid>
    </div>
  );
};

export default UserSingleSubscriberGrid;