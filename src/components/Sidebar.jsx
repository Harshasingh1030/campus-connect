import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, QrCode, ArrowLeft, LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function Sidebar({ onOpenScanner }) {
  const { user, logout, switchRole, isDemo } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    await logout();
    toast.info('Logged out from administrator portal.');
    navigate('/');
  };

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--color-navy-950)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        borderRight: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      {/* Brand Header */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Link to="/admin" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800
            }}
          >
            CC
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              CampusConnect
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              Admin Console
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav style={{ padding: '1.25rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
        <NavLink
          to="/admin"
          end
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: isActive ? '#ffffff' : '#94a3b8',
            backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
            transition: 'all var(--transition-fast)'
          })}
        >
          <LayoutDashboard size={18} />
          Overview & Metrics
        </NavLink>

        <NavLink
          to="/admin/events"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: isActive ? '#ffffff' : '#94a3b8',
            backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
            transition: 'all var(--transition-fast)'
          })}
        >
          <Calendar size={18} />
          Event Management
        </NavLink>

        <NavLink
          to="/admin/participants"
          style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: isActive ? '#ffffff' : '#94a3b8',
            backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
            transition: 'all var(--transition-fast)'
          })}
        >
          <Users size={18} />
          Registrations & Attendance
        </NavLink>

        {/* Quick Action Button: Verify Ticket / Scan */}
        <div style={{ marginTop: '1.5rem', padding: '0 0.5rem' }}>
          <button
            type="button"
            onClick={onOpenScanner}
            className="btn btn-secondary btn-sm"
            style={{
              width: '100%',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <QrCode size={16} color="var(--color-warning)" />
            Scan / Verify Ticket
          </button>
        </div>

        {/* Return to Student View */}
        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Link
            to="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.65rem 1rem',
              color: '#94a3b8',
              fontSize: '0.8125rem',
              fontWeight: 500,
              borderRadius: 'var(--radius-md)'
            }}
          >
            <ArrowLeft size={16} />
            Switch to Student Portal
          </Link>
        </div>
      </nav>

      {/* Admin Profile Footer */}
      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
              {user?.name || 'Administrator'}
            </div>
            <div style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
              {user?.email || 'admin@campus.edu'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{ color: '#ef4444', padding: '4px' }}
            title="Sign Out"
            aria-label="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
