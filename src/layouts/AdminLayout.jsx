import React, { useState } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { AttendanceScannerModal } from '../components/AttendanceScannerModal';
import { useAuth } from '../context/AuthContext';
import { Shield, Sparkles, QrCode } from 'lucide-react';

export function AdminLayout() {
  const { user, isAdmin, isLoading, isDemo } = useAuth();
  const [scannerOpen, setScannerOpen] = useState(false);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="badge badge-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
            Loading Admin Console...
          </div>
        </div>
      </div>
    );
  }

  // Frontend route protection for UX (Actual authorization enforced on AWS backend via Lambda)
  if (!user || !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <Sidebar onOpenScanner={() => setScannerOpen(true)} />

      {/* Main Admin Content Area */}
      <div className="admin-main">
        {/* Admin Header Bar */}
        <header
          style={{
            height: '64px',
            backgroundColor: 'var(--color-white)',
            borderBottom: '1px solid var(--color-slate-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-navy-500)' }}>
              Campus Administration /
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-navy-900)' }}>
              Staff Portal
            </span>
            {isDemo && (
              <span className="demo-mode-tag" style={{ marginLeft: '6px' }}>
                Simulated Storage Mode
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setScannerOpen(true)}
              className="btn btn-outline-primary btn-sm"
            >
              <QrCode size={16} />
              Verify Ticket
            </button>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-slate-100)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-navy-800)'
              }}
            >
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-success)'
                }}
              />
              {user.name} (Admin)
            </div>
          </div>
        </header>

        {/* Dynamic Nested Route Content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>

      {/* Global Ticket Verification Scanner Modal */}
      <AttendanceScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
      />
    </div>
  );
}
