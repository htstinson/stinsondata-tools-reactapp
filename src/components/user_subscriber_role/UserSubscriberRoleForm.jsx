import React, { useState, useEffect } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { DropDownList } from '@progress/kendo-react-dropdowns';

export const UserSubscriberForm = ({ usersubscriber, onSubmit, onCancel }) => {
  const [usersubscribers, setUserSubscribers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUserSubscriber, setSelectedUserSubscriber] = useState(undefined);
  const [selectedRole, setSelectedRole] = useState(undefined);
  const [isLoadingUserSubscribers, setIsLoadingUserSubscribers] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [errorUserSubscribers, setErrorUserSubscribers] = useState(null);
  const [errorRoles, setErrorRoles] = useState(null);
 
  // Fetch user subscribers from the API on component mount
  useEffect(() => {
    const fetchUserSubscribers = async () => {
      setIsLoadingUserSubscribers(true);
      setErrorUserSubscribers(null);
      
      try {
        // Get authentication token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        const response = await fetch('https://thousandhillsdigital.net/api/v1/usersubscriberview', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('User_Subscriber data from API:', data);
        
        // Adjust mapping based on actual API response structure
        const formattedUserSubscribers = Array.isArray(data) 
          ? data.map(userSubscriber => ({
              id: userSubscriber.id,
              user_id: userSubscriber.user_id,         // Keep original fields for the API
              subscriber_id: userSubscriber.subscriber_id, // Keep original fields for the API
              name: userSubscriber.subscriber_name + " - " + userSubscriber.user_username,
              text: userSubscriber.subscriber_name + " - " + userSubscriber.user_username,
            }))
          : [];
        
        console.log('Formatted user subscribers:', formattedUserSubscribers);
        setUserSubscribers(formattedUserSubscribers);
        
        // Set selected user subscriber after data has loaded
        if (usersubscriber?.id && formattedUserSubscribers.length > 0) {
          const existingUserSubscriber = formattedUserSubscribers.find(
            us => us.id.toString() === usersubscriber.user_subscriber_id?.toString()
          );
          
          console.log('Found existing user subscriber:', existingUserSubscriber);
          if (existingUserSubscriber) {
            setSelectedUserSubscriber(existingUserSubscriber);
          }
        }
      } catch (err) {
        setErrorUserSubscribers('Failed to load user subscribers. Please try again later.');
        console.error('Error fetching user subscribers:', err);
      } finally {
        setIsLoadingUserSubscribers(false);
      }
    };
    
    fetchUserSubscribers();
  }, [usersubscriber]);

  // Fetch roles from the API on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      setIsLoadingRoles(true);
      setErrorRoles(null);
      
      try {
        // Get authentication token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        const response = await fetch('https://thousandhillsdigital.net/api/v1/roles', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Role data from API:', data);
        
        // Adjust mapping based on actual API response structure
        const formattedRoles = Array.isArray(data) 
          ? data.map(role => ({
              id: role.id,
              name: role.name,
              text: role.name
            }))
          : [];
        
        console.log('Formatted roles:', formattedRoles);
        setRoles(formattedRoles);
        
        // Set selected role after data has loaded
        if (usersubscriber?.role_id && formattedRoles.length > 0) {
          const existingRole = formattedRoles.find(
            r => r.id.toString() === usersubscriber.role_id.toString()
          );
          
          console.log('Found existing role:', existingRole);
          if (existingRole) {
            setSelectedRole(existingRole);
          }
        }
      } catch (err) {
        setErrorRoles('Failed to load roles. Please try again later.');
        console.error('Error fetching roles:', err);
      } finally {
        setIsLoadingRoles(false);
      }
    };
    
    fetchRoles();
  }, [usersubscriber]);

  // Log state changes for debugging
  useEffect(() => {
    console.log('Current user subscribers state:', usersubscribers);
  }, [usersubscribers]);

  useEffect(() => {
    console.log('Current roles state:', roles);
  }, [roles]);

  useEffect(() => {
    console.log('Current selectedUserSubscriber state:', selectedUserSubscriber);
  }, [selectedUserSubscriber]);

  useEffect(() => {
    console.log('Current selectedRole state:', selectedRole);
  }, [selectedRole]);

  const onFormSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedUserSubscriber || !selectedRole) {
      return;
    }
    
    // Pass both the selected user subscriber and role data to the parent component's onSubmit
    onSubmit({
      id: usersubscriber?.id, // Pass the ID if it exists (for updates)
      user_subscriber_id: selectedUserSubscriber.id,
      role_id: selectedRole.id,
    });
  };

  return (
    <form onSubmit={onFormSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">User Subscriber</label>
        
        {isLoadingUserSubscribers ? (
          <div className="mt-1">Loading user subscribers...</div>
        ) : errorUserSubscribers ? (
          <div className="text-red-500 mt-1">{errorUserSubscribers}</div>
        ) : (
          <div>
            {usersubscribers.length > 0 ? (
              <>
                <p className="text-xs text-gray-500 mb-1">Available user subscribers: {usersubscribers.length}</p>
                <DropDownList
                  data={usersubscribers}
                  textField="text"
                  dataItemKey="id"
                  value={selectedUserSubscriber}
                  onChange={(e) => {
                    console.log("User subscriber selected:", e.value);
                    setSelectedUserSubscriber(e.value);
                  }}
                  placeholder="Select a user subscriber..."
                  required
                  className="w-full"
                />
              </>
            ) : (
              <div>No user subscribers available</div>
            )}
          </div>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
        
        {isLoadingRoles ? (
          <div className="mt-1">Loading roles...</div>
        ) : errorRoles ? (
          <div className="text-red-500 mt-1">{errorRoles}</div>
        ) : (
          <div>
            {roles.length > 0 ? (
              <>
                <p className="text-xs text-gray-500 mb-1">Available roles: {roles.length}</p>
                <DropDownList
                  data={roles}
                  textField="text"
                  dataItemKey="id"
                  value={selectedRole}
                  onChange={(e) => {
                    console.log("Role selected:", e.value);
                    setSelectedRole(e.value);
                  }}
                  placeholder="Select a role..."
                  required
                  className="w-full"
                />
              </>
            ) : (
              <div>No roles available</div>
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
          disabled={!selectedUserSubscriber || !selectedRole || isLoadingUserSubscribers || isLoadingRoles}
        >
          Save
        </Button>
      </div>
    </form>
  );
};