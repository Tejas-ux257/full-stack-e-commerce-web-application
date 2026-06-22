import { useState } from 'react';
import API from '../api/api';
import Toast from '../components/Toast';
import { Send, MapPin, Phone, Mail } from 'lucide-react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setToast({ message: 'Please fill in all fields', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await API.post('/contacts', form);
      setToast({ message: 'Your message has been sent successfully!', type: 'success' });
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Failed to send message. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px', textAlign: 'center' }}>Contact Us</h1>
      <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '40px' }}>
        Have questions or feedback? Drop us a line and we will get back to you shortly.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '40px', marginTop: '20px' }}>
        {/* Info Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <MapPin size={24} color="var(--accent-primary)" />
            <div>
              <h5 style={{ fontWeight: '700' }}>Our Location</h5>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Bengaluru, Karnataka, India</p>
            </div>
          </div>
          
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Phone size={24} color="var(--accent-primary)" />
            <div>
              <h5 style={{ fontWeight: '700' }}>Call Us</h5>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>+91 98765 43210</p>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Mail size={24} color="var(--accent-primary)" />
            <div>
              <h5 style={{ fontWeight: '700' }}>Email Us</h5>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>support@zencart.com</p>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '30px' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="john@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              className="form-input"
              rows="4"
              placeholder="Type your message here..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              style={{ resize: 'vertical' }}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Sending...' : <>Send Message <Send size={16} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
