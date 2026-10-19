import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Shield, RotateCcw, Cloud, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function Footer() {
  const { isDemo, resetDemoState } = useAuth();
  const toast = useToast();

  const handleResetData = () => {
    if (window.confirm('Reset all demo events, users, and registrations back to initial seed data?')) {
      resetDemoState();
      toast.info('Demo state restored to original seed values.');
    }
  };

  return (
    <footer
      style={{
        backgroundColor: 'var(--color-navy-950)',
        color: '#ffffff',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        paddingTop: '3.5rem',
        paddingBottom: '2.5rem',
        marginTop: 'auto'
      }}
    >
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          {/* Col 1: Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 800
                }}
              >
                <Calendar size={18} />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                CampusConnect
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '300px', marginBottom: '1.25rem' }}>
              The unified event discovery, registration, and attendance management portal for colleges and university campuses.
            </p>
            {isDemo && (
              <button
                type="button"
                onClick={handleResetData}
                className="btn btn-secondary btn-sm"
                style={{
                  fontSize: '0.75rem',
                  padding: '4px 10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  color: '#cbd5e1',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}
              >
                <RotateCcw size={12} />
                Reset Demo Data
              </button>
            )}
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              Platform
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: '#94a3b8' }}>
              <li>
                <Link to="/" style={{ transition: 'color 0.2s', color: 'inherit' }}>
                  Home & Featured
                </Link>
              </li>
              <li>
                <Link to="/events" style={{ transition: 'color 0.2s', color: 'inherit' }}>
                  Explore All Events
                </Link>
              </li>
              <li>
                <Link to="/my-registrations" style={{ transition: 'color 0.2s', color: 'inherit' }}>
                  My Registrations & Tickets
                </Link>
              </li>
              <li>
                <Link to="/dashboard" style={{ transition: 'color 0.2s', color: 'inherit' }}>
                  Student Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Administration & AWS Integration */}
          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              Admin & Cloud Architecture
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: '#94a3b8' }}>
              <li>
                <Link to="/admin" style={{ transition: 'color 0.2s', color: 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={14} color="var(--color-primary)" />
                  Admin Control Center
                </Link>
              </li>
              <li>
                <Link to="/admin/events" style={{ transition: 'color 0.2s', color: 'inherit' }}>
                  Manage & Publish Events
                </Link>
              </li>
              <li>
                <Link to="/admin/participants" style={{ transition: 'color 0.2s', color: 'inherit' }}>
                  Attendance & CSV Export
                </Link>
              </li>
              <li style={{ marginTop: '0.5rem' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(79, 70, 229, 0.15)',
                    border: '1px solid rgba(79, 70, 229, 0.3)',
                    color: '#c7d2fe',
                    fontSize: '0.725rem'
                  }}
                >
                  <Cloud size={13} />
                  Target: AWS Serverless (S3, API GW, Lambda, DynamoDB)
                </div>
              </li>
            </ul>
          </div>

          {/* Col 4: University Support */}
          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              Campus Support
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              Have questions regarding event registrations, club hosting, or technical support?
            </p>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
              <strong>Email:</strong> events@campus.edu<br />
              <strong>Office:</strong> Student Activity Center, Room 204
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            paddingTop: '2rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8rem',
            color: '#64748b'
          }}
        >
          <div>
            © {new Date().getFullYear()} CampusConnect. University Event & Registration Management System.
          </div>
          <div>
            Static React SPA • AWS Serverless Cloud Native Architecture
          </div>
        </div>
      </div>
    </footer>
  );
}
