/* ── my-login-app/src/components/ContactUs.jsx ── */

import React, { useState } from 'react';
import PageLayout from './PageLayout.jsx';
import { api } from '../api';
import { Button } from '@progress/kendo-react-buttons';

const IMG2 = api.cdn('/bg2.jpeg');

const ContactUs = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium mb-1 text-left";

  return (
    <PageLayout bgImage={IMG2} bgOpacity={0.7}>
      <div className="max-w-2xl mx-auto pb-18 px-4  sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            Get in Touch
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-primary)' }}>
            We'd love to hear from you — fill out the form and we'll get back to you shortly.
          </p>
        </div>

        <div className="p-8 rounded-lg shadow-md" style={{ background: 'var(--color-form-background)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* First + Last name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className={labelClass} style={{ color: 'var(--color-text-primary)' }}>
                  First Name
                </label>
                <input
                  type="text" id="firstName" name="firstName"
                  value={formData.firstName} onChange={handleChange}
                  className={inputClass} required
                />
              </div>
              <div>
                <label htmlFor="lastName" className={labelClass} style={{ color: 'var(--color-text-primary)' }}>
                  Last Name
                </label>
                <input
                  type="text" id="lastName" name="lastName"
                  value={formData.lastName} onChange={handleChange}
                  className={inputClass} required
                />
              </div>
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className={labelClass} style={{ color: 'var(--color-text-primary)' }}>
                  Email
                </label>
                <input
                  type="email" id="email" name="email"
                  value={formData.email} onChange={handleChange}
                  className={inputClass} required
                />
              </div>
              <div>
                <label htmlFor="phone" className={labelClass} style={{ color: 'var(--color-text-primary)' }}>
                  Phone
                </label>
                <input
                  type="tel" id="phone" name="phone"
                  value={formData.phone} onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className={labelClass} style={{ color: 'var(--color-text-primary)' }}>
                Subject
              </label>
              <input
                type="text" id="subject" name="subject"
                value={formData.subject} onChange={handleChange}
                className={inputClass} required
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className={labelClass} style={{ color: 'var(--color-text-primary)' }}>
                Message
              </label>
              <textarea
                id="message" name="message"
                value={formData.message} onChange={handleChange}
                rows="4" className={inputClass} required
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" themeColor="primary">Send Message</Button>
            </div>

          </form>
        </div>

      </div>
    </PageLayout>
  );
};

export default ContactUs;