import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';
import { IntlProvider, LocalizationProvider } from '@progress/kendo-react-intl';
import Dashboard from './components/dashboard/Dashboard.jsx';
import ContactUs from './components/ContactUs';
import Users from './components/user/Users';
import Profile from './components/user/Profile';
import Admin from './components/admin/Admin';
import Navbar from './components/Navbar';
import Customers from './components/customer/Customers';
import { UserProvider, useUser } from './components/UserContext.jsx';
import { SubscriptionProvider } from './components/Navbar.jsx';
import JWTDebugger from './components/JWTDebugger';
import './App.css';
import bgVideo from './assets/aerial-drone-view-flight-over-pine-tree-forest-in-mountain-at-sunset-SBV-338777383-HD.mp4';
import { api } from './api';
import Footer from './components/footer/footer.jsx';

// ─── Background images ────────────────────────────────────────────────────────
const IMG2 = 'https://d2wu2xky5xagy7.cloudfront.net/photo-1470252649378-9c29740c9fa8.jpeg'
//const IMG1 = "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=1600&q=80";

//const IMG2 = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=80";
const IMG1 = 'https://d2wu2xky5xagy7.cloudfront.net/photo-1506905925346-21bda4d32df4.jpeg';

// ─── Protected Route ──────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useUser();
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  return currentUser ? children : <Navigate to="/login" replace />;
};

// ─── Item Edit Form ───────────────────────────────────────────────────────────
const ItemForm = ({ item, onSubmit, onCancel }) => {
  const [name, setName] = useState(item?.name || '');
  const handleSubmit = (e) => { e.preventDefault(); onSubmit({ ...item, name }); };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <Input value={name} onChange={(e) => setName(e.value)} required className="mt-1" />
      </div>
      <div className="flex justify-end space-x-2">
        <Button onClick={onCancel} themeColor="light">Cancel</Button>
        <Button type="submit" themeColor="primary">Save</Button>
      </div>
    </form>
  );
};

// ─── Login ────────────────────────────────────────────────────────────────────
const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const { login, currentUser } = useUser();

  useEffect(() => {
    if (currentUser) navigate('/');
  }, [currentUser, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');
    try {
      const data = await api.login(`/api/v1/login`, JSON.stringify({ username, password }))
      login(data.token);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 text-red-600">{error}</div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input id="email" name="username" type="email" required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address" />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input id="password" name="password" type="password" required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password" />
            </div>
          </div>
          <div>
            <Button type="submit" themeColor="primary" className="group relative w-full">
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Debug Page ───────────────────────────────────────────────────────────────
const DebugPage = () => (
  <div className="container mx-auto pt-20">
    <Navbar />
    <div className="p-4 mt-16">
      <h1 className="text-2xl font-bold mb-4">Authentication Debugging</h1>
      <JWTDebugger />
    </div>
  </div>
);

// ─── Public Layout ────────────────────────────────────────────────────────────
const PublicLayout = () => {
  const [scrollY, setScrollY] = useState(0);
  const containerRef = React.useRef(null);

  const handleScroll = (e) => setScrollY(e.target.scrollTop);

  const progress1 = Math.min(scrollY / 600, 1);
  const progress2 = Math.min(Math.max((scrollY - 600) / 300, 0), 1);

  const img1Opacity = 1 - progress1 * 0.6;
  const img2Opacity = progress1 - progress2 * 0.6;
  const img3Opacity = progress2;

  const heroOpacity   = Math.max(1 - scrollY / 300, 0);
  const heroTranslate = scrollY * 0.4;

  const section2Opacity   = Math.min((scrollY - 300) / 300, 1);
  const section2Translate = Math.max(60 - (scrollY - 300) * 0.3, 0);

  const section3Opacity   = Math.min((scrollY - 700) / 300, 1);
  const section3Translate = Math.max(60 - (scrollY - 700) * 0.3, 0);

  const linkStyle = { color: "rgba(255,255,255,0.5)", textDecoration: "none" };
  const onEnter = e => e.target.style.color = "#fff";
  const onLeave = e => e.target.style.color = "rgba(255,255,255,0.5)";

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height: "100vh", width: "100vw", overflowY: "scroll", position: "fixed", top: 0, left: 0 }}
    >
      {/* Navbar */}
      <Navbar style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 }} />

      {/* Scrollable area */}
      <div style={{ height: "450vh", fontFamily: "'Segoe UI', sans-serif" }}>

        {/* Sticky background layers */}
        <div style={{ position: "sticky", top: 0, height: 0, zIndex: 0 }}>
          <div style={{ position: "absolute", inset: "0 0 0 0", height: "100vh" }}>

            {/* Scene 1 — video */}
            <div style={{ position: "absolute", inset: 0, opacity: img1Opacity }}>
              <video autoPlay muted loop playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}>
                <source src={bgVideo} type="video/mp4" />
              </video>
            </div>

            {/* Scene 2 — image */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${IMG2})`,
              backgroundSize: "cover", backgroundPosition: "center",
              opacity: img2Opacity,
            }} />

            {/* Scene 3 — image */}
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${IMG1})`,
              backgroundSize: "cover", backgroundPosition: "center",
              opacity: img3Opacity,
            }} />

            {/* Dark overlay */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 100%)"
            }} />
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ position: "relative", zIndex: 1 }}>

          {/* Hero Section */}
          <div style={{
            height: "100vh", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", textAlign: "center",
            padding: "0 2rem",
            opacity: heroOpacity,
            transform: `translateY(-${heroTranslate}px)`,
          }}>
            <p style={{
              color: "rgba(255,255,255,0.7)", letterSpacing: "0.3em",
              textTransform: "uppercase", fontSize: "0.85rem", marginBottom: "1rem"
            }}>
              Scroll to explore
            </p>
            <h1 style={{
              color: "#fff", fontSize: "clamp(2.5rem, 7vw, 6rem)",
              fontWeight: 800, lineHeight: 1.1, margin: "0 0 1.5rem",
              textShadow: "0 4px 30px rgba(0,0,0,0.4)"
            }}>
              Thousand Hills<br />Digital
            </h1>
            <p style={{
              color: "rgba(255,255,255,0.85)", fontSize: "1.2rem",
              maxWidth: "500px", lineHeight: 1.6,
              textShadow: "0 2px 10px rgba(0,0,0,0.5)"
            }}>
              Modern tools for modern businesses. Manage customers, users, and
              operations — all in one place.
            </p>
            <div style={{ marginTop: "3rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", letterSpacing: "0.15em" }}>SCROLL</span>
              <div style={{
                width: "1px", height: "50px",
                background: "linear-gradient(to bottom, rgba(255,255,255,0.6), transparent)",
                animation: "pulse 1.5s ease-in-out infinite"
              }} />
            </div>
          </div>

          {/* Second Section */}
          <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center",
            justifyContent: "center", padding: "4rem 2rem",
          }}>
            <div style={{
              maxWidth: "680px", textAlign: "center",
              opacity: section2Opacity,
              transform: `translateY(${section2Translate}px)`,
            }}>
              <p style={{
                color: "rgba(255,220,120,0.9)", letterSpacing: "0.25em",
                textTransform: "uppercase", fontSize: "0.8rem", marginBottom: "1rem"
              }}>
                Get Started
              </p>
              <h2 style={{
                color: "#fff", fontSize: "clamp(2rem, 5vw, 4rem)",
                fontWeight: 700, lineHeight: 1.2, margin: "0 0 1.5rem",
                textShadow: "0 4px 20px rgba(0,0,0,0.5)"
              }}>
                Everything You Need,<br />Right Here
              </h2>
              <p style={{
                color: "rgba(255,255,255,0.8)", fontSize: "1.1rem",
                lineHeight: 1.8, marginBottom: "2.5rem",
                textShadow: "0 2px 8px rgba(0,0,0,0.5)"
              }}>
                From customer management to user administration, Thousand Hills Digital
                gives your team the tools to move faster and work smarter.
              </p>
              <a href="/login" style={{ textDecoration: "none" }}>
                <button style={{
                  padding: "0.9rem 2.5rem",
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.4)",
                  borderRadius: "50px", color: "#fff",
                  fontSize: "1rem", cursor: "pointer", letterSpacing: "0.05em",
                  transition: "background 0.3s, transform 0.2s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.3)"; e.currentTarget.style.transform = "scale(1.05)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; e.currentTarget.style.transform = "scale(1)"; }}
                >
                  Sign In to Get Started
                </button>
              </a>
            </div>
          </div>

          {/* Third Section */}
          <div style={{
            minHeight: "100vh", display: "flex", alignItems: "center",
            justifyContent: "center", padding: "4rem 2rem 5rem",
          }}>
            <div style={{
              maxWidth: "680px", textAlign: "center",
              opacity: section3Opacity,
              transform: `translateY(${section3Translate}px)`,
            }}>
              <p style={{
                color: "rgba(180,220,255,0.9)", letterSpacing: "0.25em",
                textTransform: "uppercase", fontSize: "0.8rem", marginBottom: "1rem"
              }}>
                Your Vision
              </p>
              <h2 style={{
                color: "#fff", fontSize: "clamp(2rem, 5vw, 4rem)",
                fontWeight: 700, lineHeight: 1.2, margin: "0 0 1.5rem",
                textShadow: "0 4px 20px rgba(0,0,0,0.5)"
              }}>
                Built for the<br />Way You Work
              </h2>
              <p style={{
                color: "rgba(255,255,255,0.8)", fontSize: "1.1rem",
                lineHeight: 1.8, marginBottom: "2.5rem",
                textShadow: "0 2px 8px rgba(0,0,0,0.5)"
              }}>
                Every team is different. Thousand Hills Digital adapts to your
                workflow — not the other way around.
              </p>
            </div>
          </div>

        </div>{/* end scrollable content */}
      </div>{/* end 450vh */}

      <Footer />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scaleY(0.8); }
          50%       { opacity: 1;   transform: scaleY(1); }
        }
        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

// ─── Root App ─────────────────────────────────────────────────────────────────
const App = () => (
  <LocalizationProvider>
    <IntlProvider locale="en">
      <UserProvider>
        <SubscriptionProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/"        element={<PublicLayout />} />
              <Route path="/login"   element={<Login />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/debug"   element={<DebugPage />} />

              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/users"     element={<ProtectedRoute><Users /></ProtectedRoute>} />
              <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/admin"     element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SubscriptionProvider>
      </UserProvider>
    </IntlProvider>
  </LocalizationProvider>
);

export default App;