import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Calendar, User, Shield, LogOut, Menu, X, Sparkles, ChevronDown, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export function Navbar() {
  const { user, isAuthenticated, isAdmin, isStudent, isDemo, logout, switchRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    toast.info('You have been logged out.');
    navigate('/');
  };

  const handleRoleSwitch = async (role) => {
    await switchRole(role);
    setUserDropdownOpen(false);
    toast.success(`Switched to demo ${role.toUpperCase()} account.`);
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <header
      style={{
        backgroundColor: 'var(--color-white)',
        borderBottom: '1px solid var(--color-slate-200)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.4)'
            }}
          >
            <Calendar size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-navy-950)', letterSpacing: '-0.02em' }}>
              Campus<span style={{ color: 'var(--color-primary)' }}>Connect</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.675rem', fontWeight: 600, color: 'var(--color-navy-500)', letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1 }}>
              University Events
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '1.75rem' }} className="desktop-nav">
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive ? 'var(--color-primary)' : 'var(--color-navy-700)',
              transition: 'color var(--transition-fast)'
            })}
          >
            Home
          </NavLink>
          <NavLink
            to="/events"
            style={({ isActive }) => ({
              fontSize: '0.9rem',
              fontWeight: 600,
              color: isActive ? 'var(--color-primary)' : 'var(--color-navy-700)',
              transition: 'color var(--transition-fast)'
            })}
          >
            Explore Events
          </NavLink>
          {isAuthenticated && (
            <NavLink
              to="/my-registrations"
              style={({ isActive }) => ({
                fontSize: '0.9rem',
                fontWeight: 600,
                color: isActive ? 'var(--color-primary)' : 'var(--color-navy-700)',
                transition: 'color var(--transition-fast)'
              })}
            >
              My Registrations
            </NavLink>
          )}
          {isAuthenticated && (
            <NavLink
              to={isAdmin ? '/admin' : '/dashboard'}
              style={({ isActive }) => ({
                fontSize: '0.9rem',
                fontWeight: 600,
                color: isActive ? 'var(--color-primary)' : 'var(--color-navy-700)',
                transition: 'color var(--transition-fast)'
              })}
            >
              {isAdmin ? 'Admin Dashboard' : 'Student Portal'}
            </NavLink>
          )}
        </nav>

        {/* Right Section: Role Switcher & Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Demo Quick Switcher Badge */}
          {isDemo && (
            <div
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                border: '1px solid rgba(79, 70, 229, 0.2)'
              }}
              className="demo-switcher-desktop"
            >
              <Sparkles size={14} color="var(--color-primary)" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                Demo:
              </span>
              <button
                type="button"
                onClick={() => handleRoleSwitch('student')}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: user?.role === 'student' ? 700 : 500,
                  color: user?.role === 'student' ? 'var(--color-primary)' : 'var(--color-navy-600)',
                  textDecoration: user?.role === 'student' ? 'underline' : 'none'
                }}
              >
                Student
              </button>
              <span style={{ color: 'var(--color-slate-300)' }}>|</span>
              <button
                type="button"
                onClick={() => handleRoleSwitch('admin')}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: user?.role === 'admin' ? 700 : 500,
                  color: user?.role === 'admin' ? 'var(--color-primary)' : 'var(--color-navy-600)',
                  textDecoration: user?.role === 'admin' ? 'underline' : 'none'
                }}
              >
                Admin
              </button>
            </div>
          )}

          {/* User Account State */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-slate-200)',
                  backgroundColor: 'var(--color-slate-50)'
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isAdmin ? 'var(--color-navy-800)' : 'var(--color-primary)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}
                >
                  {isAdmin ? <Shield size={16} /> : user.name?.charAt(0) || 'U'}
                </div>
                <div style={{ textAlign: 'left', display: 'none' }} className="user-name-desktop">
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-navy-900)' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-navy-500)', textTransform: 'capitalize' }}>
                    {user.role}
                  </div>
                </div>
                <ChevronDown size={14} color="var(--color-navy-500)" />
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '110%',
                    width: '230px',
                    backgroundColor: 'var(--color-white)',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--color-slate-200)',
                    padding: '8px',
                    zIndex: 110,
                    animation: 'slideUp 0.15s ease'
                  }}
                >
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-slate-100)', marginBottom: '4px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-navy-900)' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-navy-500)' }}>{user.email}</div>
                    <span className={`badge badge-${isAdmin ? 'warning' : 'primary'}`} style={{ marginTop: '6px' }}>
                      {user.role.toUpperCase()}
                    </span>
                  </div>

                  {isAdmin ? (
                    <>
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="btn btn-ghost btn-sm"
                        style={{ width: '100%', justifyContent: 'flex-start' }}
                      >
                        <Shield size={16} /> Admin Dashboard
                      </Link>
                      <Link
                        to="/admin/events"
                        onClick={() => setUserDropdownOpen(false)}
                        className="btn btn-ghost btn-sm"
                        style={{ width: '100%', justifyContent: 'flex-start' }}
                      >
                        <Calendar size={16} /> Manage Events
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="btn btn-ghost btn-sm"
                        style={{ width: '100%', justifyContent: 'flex-start' }}
                      >
                        <User size={16} /> Student Dashboard
                      </Link>
                      <Link
                        to="/my-registrations"
                        onClick={() => setUserDropdownOpen(false)}
                        className="btn btn-ghost btn-sm"
                        style={{ width: '100%', justifyContent: 'flex-start' }}
                      >
                        <CheckCircle size={16} /> My Registrations
                      </Link>
                    </>
                  )}

                  <div style={{ borderTop: '1px solid var(--color-slate-100)', marginTop: '4px', paddingTop: '4px' }}>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="btn btn-ghost btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--color-danger)' }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ padding: '6px', color: 'var(--color-navy-800)' }}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: 'var(--color-white)',
            borderBottom: '1px solid var(--color-slate-200)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
          className="mobile-drawer"
        >
          <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600 }}>
            Home
          </Link>
          <Link to="/events" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600 }}>
            Explore Events
          </Link>
          {isAuthenticated && (
            <Link to="/my-registrations" onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600 }}>
              My Registrations
            </Link>
          )}
          {isAuthenticated && (
            <Link to={isAdmin ? '/admin' : '/dashboard'} onClick={() => setMobileMenuOpen(false)} style={{ fontWeight: 600 }}>
              {isAdmin ? 'Admin Dashboard' : 'Student Portal'}
            </Link>
          )}

          {isDemo && (
            <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--color-slate-200)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-navy-500)', display: 'block', marginBottom: '6px' }}>
                Quick Demo Switcher:
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    handleRoleSwitch('student');
                    setMobileMenuOpen(false);
                  }}
                >
                  Student Profile
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    handleRoleSwitch('admin');
                    setMobileMenuOpen(false);
                  }}
                >
                  Admin Profile
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .demo-switcher-desktop { display: inline-flex !important; }
          .user-name-desktop { display: block !important; }
          .mobile-menu-btn { display: none !important; }
          .mobile-drawer { display: none !important; }
        }
      `}</style>
    </header>
  );
}
