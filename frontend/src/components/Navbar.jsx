import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar-container">
      <div className="container navbar">
        <Link to="/" className="logo">
          <div className="logo-icon"></div>
          <span>IIC</span>
        </Link>
        
        <nav className="nav-links">
          <Link to="/" className={isActive('/') ? 'active' : ''}>Home</Link>
          <Link to="/about" className={isActive('/about') ? 'active' : ''}>About</Link>
          <Link to="/team" className={isActive('/team') ? 'active' : ''}>Team</Link>
          <Link to="/events" className={isActive('/events') ? 'active' : ''}>Events</Link>
          <Link to="/gallery" className={isActive('/gallery') ? 'active' : ''}>Gallery</Link>
        </nav>

        <div className="nav-actions">
          <Link to="/events" className="btn btn-outline">Explore</Link>
          
          {!user ? (
            <Link to="/auth" className="btn btn-primary">Join Us</Link>
          ) : (
            <>
              {user.role === 'admin' && (
                <Link to="/dashboard" className="btn btn-secondary">Admin Dashboard</Link>
              )}
              <button onClick={handleLogout} className="btn btn-outline" style={{borderColor: 'var(--border)', color: 'var(--text-main)', backgroundColor: 'transparent'}}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
