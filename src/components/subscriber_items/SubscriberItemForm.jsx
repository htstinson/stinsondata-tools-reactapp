import React, { useState, useEffect } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import { useNavigate } from 'react-router-dom';

export const SubscriberItemForm = ({ subscriberItem, onSubmit, onCancel }) => {
  const navigate = useNavigate();
  const [subscribers, setSubscribers] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedSubscriber, setSelectedSubscriber] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    // If editing, set the selected values
    if (subscriberItem && subscribers.length > 0 && items.length > 0) {
      const subscriber = subscribers.find(s => s.id === subscriberItem.subscriber_id);
      const item = items.find(i => i.id === subscriberItem.item_id);
      setSelectedSubscriber(subscriber);
      setSelectedItem(item);
    }
  }, [subscriberItem, subscribers, items]);

  const fetchDropdownData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch subscribers
      const subscribersResponse = await fetch('https://thousandhillsdigital.net/api/v1/subscribers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!subscribersResponse.ok) {
        if (subscribersResponse.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`HTTP error! status: ${subscribersResponse.status}`);
      }

      const subscribersData = await subscribersResponse.json();
      setSubscribers(subscribersData);

      // Fetch items
      const itemsResponse = await fetch('https://thousandhillsdigital.net/api/v1/items', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!itemsResponse.ok) {
        throw new Error(`HTTP error! status: ${itemsResponse.status}`);
      }

      const itemsData = await itemsResponse.json();
      setItems(itemsData);

    } catch (err) {
      setError(err.message);
      console.error('Error fetching dropdown data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedSubscriber || !selectedItem) {
      alert('Please select both a subscriber and an item');
      return;
    }

    onSubmit({
      ...subscriberItem,
      subscriber_id: selectedSubscriber.id,
      item_id: selectedItem.id
    });
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subscriber</label>
        <DropDownList
          data={subscribers}
          textField="name"
          dataItemKey="id"
          value={selectedSubscriber}
          onChange={(e) => setSelectedSubscriber(e.value)}
          required
          style={{ width: '100%' }}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
        <DropDownList
          data={items}
          textField="name"
          dataItemKey="id"
          value={selectedItem}
          onChange={(e) => setSelectedItem(e.value)}
          required
          style={{ width: '100%' }}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button onClick={onCancel} themeColor="light">
          Cancel
        </Button>
        <Button type="submit" themeColor="primary">
          Save
        </Button>
      </div>
    </form>
  );
};