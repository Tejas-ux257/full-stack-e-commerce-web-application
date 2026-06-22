import { Layers, Database, ShieldCheck, Cpu } from 'lucide-react';

export default function About() {
  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 0' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '12px' }}>Project Architecture</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '40px' }}>
        ZenCart is a production-ready, full-stack e-commerce showcase designed with modern web patterns and strict database normalization. 
      </p>

      {/* Tech Specifications */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Frontend Spec */}
        <div className="glass-panel" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <Cpu size={28} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Frontend Architecture</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '14px', fontSize: '0.95rem' }}>
            Built using <strong>React 18</strong> with <strong>Vite</strong> as the build tool, enabling high-performance development compilation and bundle loading.
          </p>
          <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>State Management:</strong> React Context API (`AuthContext`) manages auth token state, active profile details, cart badges and wishlist counts.</li>
            <li><strong>API Client:</strong> Axios instance with automatic request interceptors to inject JWT headers on authenticated requests.</li>
            <li><strong>Component Styling:</strong> Native modular CSS variables featuring a responsive HSL design system and glassmorphic panels.</li>
          </ul>
        </div>

        {/* Backend Spec */}
        <div className="glass-panel" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <Layers size={28} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Backend API Gateway</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '14px', fontSize: '0.95rem' }}>
            An <strong>Express REST API</strong> server driving secure CRUD management with structured layers separating routes, controllers, and middlewares.
          </p>
          <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Authentication:</strong> Encrypted password hashing with <code>bcryptjs</code> and session signatures using <code>jsonwebtoken</code>.</li>
            <li><strong>Middlewares:</strong> Role-based guards (Admin/User access levels) and multipart image parsing using Multer.</li>
            <li><strong>Image Store:</strong> Integrated Cloudinary SDK storage with local uploads folders fallback handling.</li>
          </ul>
        </div>

        {/* Relational DB Spec */}
        <div className="glass-panel" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <Database size={28} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Database & Data Engineering</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '14px', fontSize: '0.95rem' }}>
            A normalized <strong>MySQL Relational Design</strong> structured to avoid redundancies while maintaining data consistency.
          </p>
          <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Normalization:</strong> 3NF structure splitting Products, Categories, Users, Roles, Carts, Orders, and Reviews.</li>
            <li><strong>Relational Integrity:</strong> Strict FOREIGN KEY constraints utilizing <code>ON DELETE CASCADE</code> or <code>ON DELETE SET NULL</code> clauses.</li>
            <li><strong>Transaction Controls:</strong> Checkout transactions manage atomic actions (saving order details, checking stock availability, writing order items, updating product quantities, and clearing active cart items).</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
