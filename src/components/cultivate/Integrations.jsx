{/* ── my-login-app/src/components/cultivate/Integrations.jsx ── */}

import React from 'react';

const Integrations = () => {
  return (
    <div className="px-4 pt-0 sm:px-0 mt-2">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold pl-4">Integrations</h2>
      </div>

      <div className="p-6 rounded-lg shadow-sm" style={{ background: 'var(--color-form-background)' }}>
        <p className="text-gray-600">
          <a href='https://claude.ai' target="_blank" rel="noopener noreferrer">Claude</a><br /> 
          <a href='https://app.dnbhoovers.com/index' target="_blank" rel="noopener noreferrer">D&B Hoovers</a><br /> 
          <a href='https://apps.docusign.com/send/home' target="_blank" rel="noopener noreferrer">Docusign</a><br />
          <a href='https://stinsondata.monday.com' target="_blank" rel="noopener noreferrer">Monday - Project Management</a><br />
          <a href='https://tvappbuilder.com/dashboard' target="_blank" rel="noopener noreferrer">TV App Builder</a><br />
          <a href='https://usea1-areteadvisors.sentinelone.net/login' target="_blank" rel="noopener noreferrer">SentinelOne</a><br />
        </p>
      </div>
    </div>
  );
};

export default Integrations;