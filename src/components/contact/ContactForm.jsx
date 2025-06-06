import React, { useState, useEffect } from 'react';
import { Button } from '@progress/kendo-react-buttons';

const ContactForm = ({ contact, selectedCustomer, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    title: '',
    department: '',
    ...contact
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (contact) {
      setFormData({ ...formData, ...contact });
    }
  }, [contact]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const contactData = {
        ...formData,
        customer_id: selectedCustomer?.id
      };
      onSubmit(contactData);
    }
  };

  return (
    <div className="p-4">
      {selectedCustomer && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-700">
            Creating contact for: <strong>{selectedCustomer.name}</strong>
          </p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{ maxWidth: 650 }}>
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            className="k-textbox w-full"
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          {errors.first_name && (
            <div className="text-red-600 text-sm mt-1">{errors.first_name}</div>
          )}
        </div>
        
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            className="k-textbox w-full"
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          {errors.last_name && (
            <div className="text-red-600 text-sm mt-1">{errors.last_name}</div>
          )}
        </div>
        
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="k-textbox w-full"
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          {errors.email && (
            <div className="text-red-600 text-sm mt-1">{errors.email}</div>
          )}
        </div>
        
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="k-textbox w-full"
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
          {errors.phone && (
            <div className="text-red-600 text-sm mt-1">{errors.phone}</div>
          )}
        </div>
        
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Title
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="k-textbox w-full"
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department
          </label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            className="k-textbox w-full"
            style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button
            type="button"
            onClick={onCancel}
            themeColor="light"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            themeColor="primary"
          >
            {contact ? 'Update Contact' : 'Create Contact'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;