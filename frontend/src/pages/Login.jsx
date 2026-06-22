import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { LogIn } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setToast({ message: 'Please fill in all fields', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      setToast({ message: 'Welcome back! Logged in successfully.', type: 'success' });
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      console.error(err);
      setToast({ message: err.response?.data?.message || 'Invalid email or password', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="auth-wrapper glass-panel">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Login to your ZenCart account to manage cart, checkout orders and save wishlists</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label className="form-label">Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: '500' }}>
                Forgot Password?
              </Link>
            </div>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Logging in...' : <>Login <LogIn size={16} /></>}
          </button>
        </form>

        <div className="form-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
}
