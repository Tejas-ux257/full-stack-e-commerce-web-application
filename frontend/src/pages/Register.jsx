import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setToast({ message: 'Please fill in all fields', type: 'error' });
      return;
    }

    if (password !== confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }

    if (password.length < 6) {
      setToast({ message: 'Password must be at least 6 characters long', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await register(username, email, password);
      setToast({ message: 'Account created successfully! Welcome to ZenCart.', type: 'success' });
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      console.error(err);
      setToast({ message: err.response?.data?.message || 'Registration failed. Try again.', type: 'error' });
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
          <h2>Create Account</h2>
          <p>Sign up to shop premium items, write reviews and track orders</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Creating account...' : <>Register <UserPlus size={16} /></>}
          </button>
        </form>

        <div className="form-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
}
