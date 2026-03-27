/* ── my-login-app/src/components/PageLayout.jsx ── */

import React from 'react';
import Navbar from './Navbar.jsx';
import Footer from './footer.jsx';

const PageLayout = ({ children, fixed = false, bgImage = null, bgOpacity = 1 }) => {
  return (
    <div

      className={`flex flex-col ${fixed ? 'h-screen overflow-hidden' : 'min-h-screen'}`}
    >
      {/* ── Optional background image ── */}
      {bgImage && (
        <div
          aria-hidden
          style={{
            position: 'fixed', 
            inset: 0, 
            zIndex: -1,
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover', 
            backgroundPosition: 'center',
            opacity: bgOpacity
          }}
        />
      )}

      {/* ── Navbar — positions itself internally, no wrapper needed ── */}
      <Navbar />

      {/* ── Page body ── */}
      <main
        className="flex-1"
        style={{
          paddingTop: 'var(--padding-main-top)',
          paddingBottom: 'var(--height-footer)',
        }}
      >
        {children}
      </main>

      {/* ── Footer — positions itself internally, no wrapper needed ── */}
      <Footer />

    </div>
  );
};

export default PageLayout;