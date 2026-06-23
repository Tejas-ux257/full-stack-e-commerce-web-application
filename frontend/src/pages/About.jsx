import { Layers, Database, ShieldCheck, Cpu } from 'lucide-react';

export default function About() {
  return (
    <div className="fade-in" style={{ maxWidth: '900px', margin: '0 auto', padding: '20px 0' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '12px' }}>About ZenCart</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '40px' }}>
        ZenCart is a premium, full‑stack e‑commerce demo that showcases professional development practices. It combines a modern React + Vite frontend with a secure Express + Node.js backend, powered by a relational MySQL database.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Core Capabilities */}
        <div className="glass-panel" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <Cpu size={28} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Frontend Stack</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '14px', fontSize: '0.95rem' }}>
            React 18 with Vite delivers blazing‑fast development cycles and a sleek glass‑morphic UI.
          </p>
          <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>State Management:</strong> Context API handles auth, cart, and wishlist state.</li>
            <li><strong>API Client:</strong> Axios instance injects JWT tokens automatically.</li>
            <li><strong>Design System:</strong> HSL‑driven CSS variables, glass panels, micro‑animations.</li>
          </ul>
        </div>

        <div className="glass-panel" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <Layers size={28} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Backend Services</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '14px', fontSize: '0.95rem' }}>
            Express REST API with JWT authentication, role‑based guards, and Multer for image uploads.
          </p>
          <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Auth:</strong> Secure registration/login with bcrypt password hashing.</li>
            <li><strong>Media:</strong> Cloudinary integration for product image storage.</li>
            <li><strong>Metrics:</strong> Real‑time dashboard endpoints for orders, users, and sales.</li>
          </ul>
        </div>

        <div className="glass-panel" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <Database size={28} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Database Design</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '14px', fontSize: '0.95rem' }}>
            MySQL schema follows 3NF, with tables for users, roles, products, categories, wishlist, cart, orders, reviews, and notifications.
          </p>
          <ul style={{ paddingLeft: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Integrity:</strong> Foreign‑key constraints and cascade rules ensure consistency.</li>
            <li><strong>Transactions:</strong> Checkout uses atomic DB transactions to guarantee order integrity.</li>
            <li><strong>Scalability:</strong> Indexed fields enable fast product search and filtering.</li>
          </ul>
        </div>

        {/* Tech Specifications */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '30px' }}>
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
    </div>
  );
}
