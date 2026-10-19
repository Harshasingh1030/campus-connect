import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function UnauthorizedPage() {
  const { isDemo, switchRole } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSwitchToAdmin = async () => {
    await switchRole('admin');
    toast.success('Switched to administrator demo account.');
    navigate('/admin');
  };

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem', textAlign: 'center' }}>
      <div style={{ maxWidth: '480px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}
        >
          <ShieldAlert size={32} />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--color-navy-950)', marginBottom: '0.5rem' }}>
          403 - Access Denied
        </h1>
        <p style={{ color: 'var(--color-navy-600)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          You do not have administrative privileges to access this area of the campus portal. Production authorization is verified by AWS Lambda Authorizers.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
          {isDemo && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSwitchToAdmin}
              style={{ width: '100%', maxWidth: '280px', justifyContent: 'center', gap: '8px' }}
            >
              <Sparkles size={16} /> Switch to Admin Demo Profile
            </button>
          )}

          <Link
            to="/dashboard"
            className="btn btn-secondary"
            style={{ width: '100%', maxWidth: '280px', justifyContent: 'center', gap: '8px' }}
          >
            <ArrowLeft size={16} /> Return to Student Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
