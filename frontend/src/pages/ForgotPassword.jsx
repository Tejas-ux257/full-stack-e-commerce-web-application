import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/api';
import Toast from '../components/Toast';
import { KeyRound, ShieldAlert, ArrowRight } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = request token, 2 = reset password
  
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [mockTokenAlert, setMockTokenAlert] = useState(''); // Store the returned mock token to show on screen
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    if (!email) {
      setToast({ message: 'Please enter your email address', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/forgot-password', { email });
      setToast({ message: 'Reset token generated (mock email sent)', type: 'success' });
      
      // Store mock token for user convenience in showcase environment
      setMockTokenAlert(res.data.token);
      setToken(res.data.token); // Prefill for them to see how it works!
      setStep(2);
    } catch (err) {
      console.error(err);
      setToast({ message: err.response?.data?.message || 'Email not found', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!token || !newPassword || !confirmPassword) {
      setToast({ message: 'Please fill in all fields', type: 'error' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }

    if (newPassword.length < 6) {
      setToast({ message: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await API.post('/auth/reset-password', {
        email,
        token,
        newPassword
      });
      setToast({ message: 'Password reset successful! Redirecting...', type: 'success' });
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error(err);
      setToast({ message: err.response?.data?.message || 'Invalid or expired token', type: 'error' });
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
        
        {step === 1 ? (
          <>
            <div className="auth-header">
              <h2>Forgot Password</h2>
              <p>Enter your email below and we will generate a password reset token for you</p>
            </div>

            <form onSubmit={handleRequestToken}>
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

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Sending...' : <>Get Reset Token <ArrowRight size={16} /></>}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="auth-header">
              <h2>Reset Password</h2>
              <p>Enter the reset token along with your new password details</p>
            </div>

            {mockTokenAlert && (
              <div className="glass-panel" style={{ padding: '16px', background: 'rgba(245, 158, 11, 0.08)', borderColor: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <ShieldAlert size={28} style={{ flexShrink: 0 }} />
                <div>
                  <strong>Showcase Mock Token Generated:</strong>
                  <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 'bold', margin: '4px 0' }}>{mockTokenAlert}</div>
                  Please copy the token above and paste it below. In production, this token would be sent to your email inbox.
                </div>
              </div>
            )}

            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <label className="form-label">Verification Token</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter token code"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
                {loading ? 'Resetting password...' : <>Update Password <KeyRound size={16} /></>}
              </button>
            </form>
          </>
        )}

        <div className="form-footer">
          Back to <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
