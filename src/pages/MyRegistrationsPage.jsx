import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Ticket,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Compass,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { registrationService } from '../services';
import { StatusBadge } from '../components/Badge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { RegistrationTicketModal } from '../components/RegistrationTicketModal';

export function MyRegistrationsPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [registrations, setRegistrations] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming | past | cancelled
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [ticketToView, setTicketToView] = useState(null);
  const [regToCancel, setRegToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const loadRegistrations = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const data = await registrationService.getStudentRegistrations(user.id);
      setRegistrations(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load registrations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, [user]);

  const todayStr = new Date().toISOString().split('T')[0];

  const upcomingRegs = registrations.filter(
    (r) => r.status === 'confirmed' && (r.eventDate >= todayStr || !r.eventDate)
  );

  const pastRegs = registrations.filter(
    (r) => r.status === 'confirmed' && r.eventDate < todayStr
  );

  const cancelledRegs = registrations.filter((r) => r.status === 'cancelled');

  let currentList = upcomingRegs;
  if (activeTab === 'past') currentList = pastRegs;
  if (activeTab === 'cancelled') currentList = cancelledRegs;

  const handleConfirmCancel = async () => {
    if (!regToCancel) return;
    setIsCancelling(true);
    try {
      await registrationService.cancelRegistration(regToCancel.id, user.id);
      toast.info('Registration has been successfully cancelled.');
      setRegToCancel(null);
      await loadRegistrations();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel registration.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem 0', minHeight: '80vh' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', color: 'var(--color-navy-950)', marginBottom: '0.45rem' }}>
            My Event Registrations
          </h1>
          <p style={{ color: 'var(--color-navy-500)', fontSize: '1rem' }}>
            Manage your booked campus event passes, check attendance status, and download digital tickets.
          </p>
        </div>

        {/* Status Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid var(--color-slate-200)',
            marginBottom: '2rem'
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: activeTab === 'upcoming' ? 'var(--color-primary)' : 'var(--color-navy-600)',
              borderBottom: activeTab === 'upcoming' ? '2px solid var(--color-primary)' : '2px solid transparent',
              transition: 'all 0.15s ease'
            }}
          >
            Upcoming Passes ({upcomingRegs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('past')}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: activeTab === 'past' ? 'var(--color-primary)' : 'var(--color-navy-600)',
              borderBottom: activeTab === 'past' ? '2px solid var(--color-primary)' : '2px solid transparent',
              transition: 'all 0.15s ease'
            }}
          >
            Past Events ({pastRegs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cancelled')}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: 600,
              fontSize: '0.9rem',
              color: activeTab === 'cancelled' ? 'var(--color-primary)' : 'var(--color-navy-600)',
              borderBottom: activeTab === 'cancelled' ? '2px solid var(--color-primary)' : '2px solid transparent',
              transition: 'all 0.15s ease'
            }}
          >
            Cancelled ({cancelledRegs.length})
          </button>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0' }}>
            <Loader2 size={32} className="animate-spin" color="var(--color-primary)" style={{ marginBottom: '1rem' }} />
            <p style={{ color: 'var(--color-navy-500)' }}>Loading your tickets...</p>
          </div>
        ) : currentList.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state-icon">
              <Ticket size={32} />
            </div>
            <h3 className="empty-state-title">
              No {activeTab} registrations found
            </h3>
            <p className="empty-state-desc">
              {activeTab === 'upcoming'
                ? "You don't have any upcoming registered events at this time."
                : activeTab === 'past'
                ? "You haven't attended any past events yet."
                : "You don't have any cancelled registrations."}
            </p>
            {activeTab === 'upcoming' && (
              <Link to="/events" className="btn btn-primary btn-sm">
                <Compass size={16} /> Explore Upcoming Events
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {currentList.map((reg) => (
              <div
                key={reg.id}
                className="card"
                style={{
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1.25rem'
                }}
              >
                {/* Event info */}
                <div style={{ flex: '1 1 300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.45rem' }}>
                    <StatusBadge status={reg.status} />
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        backgroundColor: reg.attendance === 'present' ? 'var(--color-success-bg)' : 'var(--color-slate-100)',
                        color: reg.attendance === 'present' ? 'var(--color-success-text)' : 'var(--color-navy-600)'
                      }}
                    >
                      Attendance: {reg.attendance?.toUpperCase() || 'PENDING'}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--color-navy-500)' }}>
                      ID: {reg.ticketCode || reg.id}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy-950)', marginBottom: '0.5rem', fontWeight: 700 }}>
                    <Link to={`/events/${reg.eventId}`} style={{ color: 'inherit' }}>
                      {reg.eventTitle}
                    </Link>
                  </h3>

                  <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--color-navy-600)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Calendar size={15} color="var(--color-primary)" />
                      {reg.eventDate}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={15} color="var(--color-primary)" />
                      {reg.venue}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-navy-400)' }}>
                      Booked: {new Date(reg.registeredAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {reg.status === 'confirmed' && (
                    <>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setTicketToView(reg)}
                      >
                        <Ticket size={15} />
                        View / Print Pass
                      </button>

                      <button
                        type="button"
                        className="btn btn-danger-outline btn-sm"
                        onClick={() => setRegToCancel(reg)}
                      >
                        <XCircle size={15} />
                        Cancel Pass
                      </button>
                    </>
                  )}

                  <Link to={`/events/${reg.eventId}`} className="btn btn-secondary btn-sm">
                    Event Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Cancellation */}
      <ConfirmDialog
        isOpen={Boolean(regToCancel)}
        title="Cancel Event Registration?"
        message={`Are you sure you want to cancel your registration for "${regToCancel?.eventTitle}"? Your seat will be released and made available to other students.`}
        confirmLabel="Yes, Cancel Pass"
        cancelLabel="Keep Registration"
        isDestructive={true}
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setRegToCancel(null)}
      />

      {/* Ticket Pass Modal */}
      <RegistrationTicketModal
        isOpen={Boolean(ticketToView)}
        onClose={() => setTicketToView(null)}
        registration={ticketToView}
      />
    </div>
  );
}
