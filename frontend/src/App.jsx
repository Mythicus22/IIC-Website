import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import Team from './pages/Team';
import Gallery from './pages/Gallery';
import AdminDashboard from './pages/AdminDashboard';
import Auth from './pages/Auth';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import FAQs from './pages/FAQs';

// Scroll to hash after navigation
const ScrollToHash = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" />;
  if (user.role !== 'admin') return <Navigate to="/" />;
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <ScrollToHash />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { fontFamily: 'var(--font-body)', fontSize: '0.95rem', borderRadius: '10px', padding: '12px 16px' },
              success: { style: { background: '#2C2C8C', color: '#fff', border: '1px solid #4A4AD8' }, iconTheme: { primary: '#FBE200', secondary: '#2C2C8C' } },
              error: { style: { background: '#1E293B', color: '#fff', border: '1px solid #EF4444' }, iconTheme: { primary: '#EF4444', secondary: '#fff' } },
            }}
          />
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/events" element={<Events />} />
              <Route path="/team" element={<Team />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/faqs" element={<FAQs />} />
              <Route
                path="/dashboard"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
            </Routes>
          </Layout>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
