import React, { useState, useEffect } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { DropDownList } from '@progress/kendo-react-dropdowns';

export const UserSubscriberForm = ({ usersubscriber, onSubmit, onCancel }) => {
  const [subscribers, setSubscribers] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedSubscriber, setSelectedSubscriber] = useState(undefined);
  const [selectedUser, setSelectedUser] = useState(undefined);
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [errorSubscribers, setErrorSubscribers] = useState(null);
  const [errorUsers, setErrorUsers] = useState(null);
 
  // Fetch subscribers from the API on component mount
  useEffect(() => {
    const fetchSubscribers = async () => {
      setIsLoadingSubscribers(true);
      setErrorSubscribers(null);
      
      try {
        // Get authentication token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        const response = await fetch('https://thousandhillsdigital.net/api/v1/subscribers', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Subscriber data from API:', data);
        
        // Adjust mapping based on actual API response structure
        const formattedSubscribers = Array.isArray(data) 
          ? data.map(subscriber => ({
              id: subscriber.id,
              name: subscriber.name,
              text: subscriber.name
            }))
          : [];
        
        console.log('Formatted subscribers:', formattedSubscribers);
        setSubscribers(formattedSubscribers);
        
        // Set selected subscriber after data has loaded
        if (usersubscriber?.subscriber_id && formattedSubscribers.length > 0) {
          const existingSubscriber = formattedSubscribers.find(
            c => c.id.toString() === usersubscriber.subscriber_id.toString()
          );
          
          console.log('Found existing subscriber:', existingSubscriber);
          if (existingSubscriber) {
            setSelectedSubscriber(existingSubscriber);
          }
        }
      } catch (err) {
        setErrorSubscribers('Failed to load subscribers. Please try again later.');
        console.error('Error fetching subscribers:', err);
      } finally {
        setIsLoadingSubscribers(false);
      }
    };
    
    fetchSubscribers();
  }, [usersubscriber]);

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
        
        const response = await fetch('https://thousandhillsdigital.net/api/v1/users', {
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
        if (usersubscriber?.user_id && formattedUsers.length > 0) {
          const existingUser = formattedUsers.find(
            u => u.id.toString() === usersubscriber.user_id.toString()
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
  }, [usersubscriber]);

  // Log state changes for debugging
  useEffect(() => {
    console.log('Current subscribers state:', subscribers);
  }, [subscribers]);

  useEffect(() => {
    console.log('Current users state:', users);
  }, [users]);

  useEffect(() => {
    console.log('Current selectedSubscriber state:', selectedSubscriber);
  }, [selectedSubscriber]);

  useEffect(() => {
    console.log('Current selectedUser state:', selectedUser);
  }, [selectedUser]);

  const onFormSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedSubscriber || !selectedUser) {
      return;
    }
    
    // Pass both the selected subscriber and user data to the parent component's onSubmit
    onSubmit({
      id: usersubscriber?.id, // Pass the ID if it exists (for updates)
      subscriber_id: selectedSubscriber.id,
      subscriber_name: selectedSubscriber.name,
      user_id: selectedUser.id,
      user_username: selectedUser.username
    });
  };

  return (
    <form onSubmit={onFormSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subscriber</label>
        
        {isLoadingSubscribers ? (
          <div className="mt-1">Loading subscribers...</div>
        ) : errorSubscribers ? (
          <div className="text-red-500 mt-1">{errorSubscribers}</div>
        ) : (
          <div>
            {subscribers.length > 0 ? (
              <>
                <p className="text-xs text-gray-500 mb-1">Available subscribers: {subscribers.length}</p>
                <DropDownList
                  data={subscribers}
                  textField="text"
                  dataItemKey="id"
                  value={selectedSubscriber}
                  onChange={(e) => {
                    console.log("Subscriber selected:", e.value);
                    setSelectedSubscriber(e.value);
                  }}
                  placeholder="Select a subscriber..."
                  required
                  className="w-full"
                />
              </>
            ) : (
              <div>No subscribers available</div>
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
          disabled={!selectedSubscriber || !selectedUser || isLoadingSubscribers || isLoadingUsers}
        >
          Save
        </Button>
      </div>
    </form>
  );
};