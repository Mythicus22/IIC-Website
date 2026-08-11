import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/useAuth';
import ScrollReveal from '../components/ScrollReveal';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading(isLogin ? 'Logging in...' : 'Creating account...');
    try {
      if (isLogin) {
        const data = await login(formData.email, formData.password);
        toast.success(`Welcome back, ${data.name}! ${data.role === 'admin' ? '(Admin)' : ''}`, { id: toastId });
        navigate(data.role === 'admin' ? '/dashboard' : '/');
      } else {
        const data = await register(formData.name, formData.email, formData.password);
        toast.success(`Account created! ${data.role === 'admin' ? 'Admin access granted 🔑' : 'Welcome to IIC!'}`, { id: toastId });
        navigate(data.role === 'admin' ? '/dashboard' : '/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authentication failed', { id: toastId });
    }
  };

  return (
    <div className="auth-page section container">
      <ScrollReveal>
        <div className="auth-container card">
          <div className="auth-header text-center">
            <h2 className="hero-title" style={{fontSize: '2.5rem'}}>{isLogin ? 'Welcome Back' : 'Join the IIC'}</h2>
            <p className="section-subtitle">
              {isLogin ? 'Log in to access your dashboard' : 'Create an account to start your journey'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="input-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
            )}
            
            <div className="input-group">
              <label>Email Address</label>
              <input 
                type="email" 
                className="input-field" 
                required 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <input 
                type="password" 
                className="input-field" 
                required 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1rem'}}>
              {isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>

          <div className="auth-footer text-center">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                className="btn-link" 
                onClick={() => { setIsLogin(!isLogin); setFormData({name: '', email: '', password: ''}); }}
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default Auth;
