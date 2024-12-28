import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import '@progress/kendo-licensing';
import '@progress/kendo-react-intl';
import '@progress/kendo-theme-default/dist/all.css';

// Dynamic import for licensing
const initializeLicense = async () => {
  try {
    const licensing = await import('@progress/kendo-licensing');
    if (licensing && typeof licensing.License !== 'undefined') {
      licensing.License.activate(KENDO_LICENSE_KEY);
    } else if (window.kendoLicensing) {
      window.kendoLicensing.setLicenseKey(KENDO_LICENSE_KEY);
    }
  } catch (error) {
    console.error('License activation failed:', error);
  }
};

// Initialize before rendering
initializeLicense().then(() => {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});