import { Link } from 'react-router-dom';
import { Camera, BriefcaseBusiness } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-container">
      <div className="container footer-content">
        <div className="footer-brand">
          <div className="logo-white">
             <div className="logo-icon-white"></div>
             <span>IIC</span>
          </div>
          <p className="footer-desc">
            Nurturing innovation and entrepreneurship at the grassroots level. Empowering students to build the future.
          </p>
        </div>

        <div className="footer-links">
          <h4>QUICK LINKS</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/team">Team</Link></li>
            <li><Link to="/gallery">Gallery</Link></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>RESOURCES</h4>
          <ul>
            <li><Link to="/about#application-flow">Application Flow</Link></li>
            <li><Link to="/about#mentor-network">Mentor Network</Link></li>
            <li><Link to="/faqs">FAQs</Link></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>CONTACT</h4>
          <p>Main Campus, Innovation Block</p>
          <p>iic@college.edu</p>
          <p>+1 234 567 890</p>
          <div className="social-links">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <Camera size={18} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <BriefcaseBusiness size={18} />
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container bottom-content">
          <p>&copy; 2026 IIC Hub. All rights reserved.</p>
          <div className="bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
