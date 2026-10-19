import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Share2,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Mail,
  ShieldCheck,
  Ticket,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { eventService, registrationService } from '../services';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Badge } from '../components/Badge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { RegistrationTicketModal } from '../components/RegistrationTicketModal';

export function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userRegistration, setUserRegistration] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  useEffect(() => {
    async function loadEvent() {
      setIsLoading(true);
      try {
        const fetched = await eventService.getEventById(id);
        setEvent(fetched);

        if (user?.id) {
          const status = await registrationService.checkRegistrationStatus(id, user.id);
          setIsRegistered(status.isRegistered);
          setUserRegistration(status.registration);
        }
      } catch (err) {
        toast.error(err.message || 'Event not found.');
      } finally {
        setIsLoading(false);
      }
    }
    loadEvent();
  }, [id, user]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} className="animate-spin" color="var(--color-primary)" style={{ marginBottom: '1rem' }} />
        <p style={{ color: 'var(--color-navy-500)' }}>Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2>Event Not Found</h2>
        <p style={{ color: 'var(--color-navy-500)', margin: '1rem 0 1.5rem 0' }}>
          The requested event could not be found or has been removed.
        </p>
        <Link to="/events" className="btn btn-primary">
          Back to Events
        </Link>
      </div>
    );
  }

  const registeredCount = event.registeredCount || 0;
  const maxParticipants = event.maxParticipants || 1;
  const remainingSeats = Math.max(0, maxParticipants - registeredCount);
  const isFull = remainingSeats === 0;

  const now = new Date().toISOString();
  const isDeadlinePassed = event.registrationDeadline && now > event.registrationDeadline;

  const formattedDate = new Date(event.eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedDeadline = event.registrationDeadline
    ? new Date(event.registrationDeadline).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Before event starts';

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Event link copied to clipboard!');
  };

  const handleRegisterConfirm = async () => {
    if (!isAuthenticated) {
      toast.warning('Please sign in or create an account to register.');
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    setIsRegistering(true);
    try {
      const reg = await registrationService.registerForEvent(event.id, user);
      setIsRegistered(true);
      setUserRegistration(reg);
      setEvent((prev) => ({ ...prev, registeredCount: (prev.registeredCount || 0) + 1 }));

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      toast.success('Registration confirmed! Admission pass generated.');
      setConfirmOpen(false);
      setTicketModalOpen(true);
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
      setConfirmOpen(false);
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 5rem 0' }}>
      <div className="container">
        {/* Breadcrumb Back Link */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/events"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-navy-600)' }}
          >
            <ArrowLeft size={16} />
            Back to Explore Events
          </Link>
        </div>

        {/* Hero Banner Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', marginBottom: '3rem', alignItems: 'start' }}>
          {/* Left: Poster */}
          <div className="card" style={{ overflow: 'hidden', borderRadius: 'var(--radius-xl)' }}>
            <img
              src={event.posterUrl}
              alt={event.title}
              style={{ width: '100%', maxHeight: '420px', objectFit: 'cover' }}
            />
          </div>

          {/* Right: Quick Action & Details */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.75rem' }}>
              <Badge variant="primary">{event.category}</Badge>
              <span className="badge badge-neutral">{event.price || 'Free Admission'}</span>
              {event.status !== 'published' && (
                <span className="badge badge-warning">{event.status.toUpperCase()}</span>
              )}
            </div>

            <h1 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: 'var(--color-navy-950)', lineHeight: 1.25, marginBottom: '1rem' }}>
              {event.title}
            </h1>

            <p style={{ fontSize: '1.05rem', color: 'var(--color-navy-600)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              {event.shortDescription || event.fullDescription}
            </p>

            {/* Quick Meta Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.875rem', backgroundColor: 'var(--color-slate-100)', borderRadius: 'var(--radius-md)' }}>
                <Calendar size={20} color="var(--color-primary)" />
                <div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--color-navy-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Date & Day
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-navy-900)' }}>
                    {formattedDate}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0.875rem', backgroundColor: 'var(--color-slate-100)', borderRadius: 'var(--radius-md)' }}>
                <Clock size={20} color="var(--color-primary)" />
                <div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--color-navy-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Session Timing
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-navy-900)' }}>
                    {event.startTime} - {event.endTime}
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Action Box */}
            <div className="card" style={{ padding: '1.5rem', backgroundColor: 'var(--color-slate-50)', border: '1px solid var(--color-slate-200)' }}>
              {/* Capacity indicator */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--color-navy-700)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Users size={16} />
                  {remainingSeats} of {maxParticipants} seats remaining
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-navy-500)' }}>
                  Deadline: {formattedDeadline}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-slate-200)', borderRadius: '9999px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: `${Math.min(100, Math.round((registeredCount / maxParticipants) * 100))}%`,
                    height: '100%',
                    backgroundColor: isFull ? 'var(--color-danger)' : 'var(--color-primary)'
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {isRegistered ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: 1, backgroundColor: 'var(--color-success)' }}
                    onClick={() => setTicketModalOpen(true)}
                  >
                    <Ticket size={18} />
                    View Digital Ticket
                  </button>
                ) : isDeadlinePassed ? (
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} disabled>
                    Registration Closed (Deadline Passed)
                  </button>
                ) : isFull ? (
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} disabled>
                    Event Capacity Full
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => setConfirmOpen(true)}
                  >
                    Register Now
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleShare}
                  aria-label="Share event link"
                >
                  <Share2 size={18} />
                  Share
                </button>
              </div>

              {isRegistered && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-success)', fontSize: '0.8125rem', marginTop: '0.75rem', fontWeight: 600 }}>
                  <CheckCircle2 size={16} />
                  You are confirmed for this event! Click "View Digital Ticket" for admission QR pass.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Description and Organizer Details */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
          {/* Main Content */}
          <div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--color-navy-950)', marginBottom: '1rem' }}>
              About This Event
            </h2>
            <div style={{ color: 'var(--color-navy-700)', lineHeight: 1.7, fontSize: '0.95rem', whiteSpace: 'pre-line', marginBottom: '2rem' }}>
              {event.fullDescription || event.shortDescription}
            </div>

            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy-950)', marginBottom: '0.75rem' }}>
              Eligibility & Guidelines
            </h3>
            <div
              style={{
                padding: '1.25rem',
                backgroundColor: 'var(--color-slate-100)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-navy-800)',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                borderLeft: '4px solid var(--color-primary)'
              }}
            >
              {event.eligibility || 'Open to all enrolled university students.'}
            </div>
          </div>

          {/* Sidebar Info: Venue & Organizer */}
          <div>
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--color-navy-950)', marginBottom: '1rem' }}>
                Location & Venue
              </h3>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'var(--color-navy-700)', fontSize: '0.9rem' }}>
                <MapPin size={20} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--color-navy-900)' }}>{event.venue}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-navy-500)', marginTop: '2px' }}>
                    University Main Campus Grounds
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--color-navy-950)', marginBottom: '1rem' }}>
                Event Host & Organizer
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-navy-500)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Organizing Body
                  </span>
                  <div style={{ fontWeight: 700, color: 'var(--color-navy-900)' }}>
                    {event.organizer}
                  </div>
                </div>
                {event.organizerEmail && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-primary)' }}>
                    <Mail size={16} />
                    <a href={`mailto:${event.organizerEmail}`} style={{ color: 'inherit' }}>
                      {event.organizerEmail}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Confirm Event Registration"
        message={`Are you sure you want to register for "${event.title}"? Your digital QR ticket will be issued immediately upon confirmation.`}
        confirmLabel="Confirm & Register"
        cancelLabel="Cancel"
        isLoading={isRegistering}
        onConfirm={handleRegisterConfirm}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Ticket Modal */}
      <RegistrationTicketModal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        registration={userRegistration}
      />
    </div>
  );
}
