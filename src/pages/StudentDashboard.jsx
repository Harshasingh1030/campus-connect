import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Ticket,
  ArrowRight,
  Sparkles,
  MapPin,
  Compass,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { eventService, registrationService } from '../services';
import { StatCard } from '../components/StatCard';
import { RegistrationTicketModal } from '../components/RegistrationTicketModal';

export function StudentDashboard() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      try {
        if (user?.id) {
          const userRegs = await registrationService.getStudentRegistrations(user.id);
          setRegistrations(userRegs);
        }

        const allEvents = await eventService.getEvents({ publicOnly: true });
        // Filter out already registered events for recommendations
        const registeredEventIds = registrations.map((r) => r.eventId);
        const unreg = allEvents.filter((e) => !registeredEventIds.includes(e.id)).slice(0, 3);
        setRecommendedEvents(unreg);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  const activeRegistrations = registrations.filter((r) => r.status === 'confirmed');
  const attendedCount = registrations.filter((r) => r.attendance === 'present').length;

  return (
    <div style={{ padding: '2.5rem 0 4rem 0', minHeight: '80vh' }}>
      <div className="container">
        {/* Welcome Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: '2rem 2.5rem',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
            marginBottom: '2.5rem',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: '#c7d2fe', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
              <Sparkles size={14} /> Student Portal
            </div>
            <h1 style={{ fontSize: '2rem', color: '#ffffff', fontWeight: 800, marginBottom: '0.35rem' }}>
              Welcome back, {user?.name || 'Student'}!
            </h1>
            <p style={{ color: '#e0e7ff', fontSize: '0.95rem' }}>
              {user?.department || 'Undergraduate'} • Roll ID: {user?.studentId || 'CS2023-048'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/events" className="btn btn-secondary btn-sm" style={{ backgroundColor: '#ffffff', color: 'var(--color-navy-900)' }}>
              <Compass size={16} /> Explore Events
            </Link>
            <Link to="/my-registrations" className="btn btn-primary btn-sm" style={{ backgroundColor: '#4f46e5', borderColor: '#6366f1' }}>
              <Ticket size={16} /> My Digital Tickets
            </Link>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <StatCard
            title="Confirmed Registrations"
            value={activeRegistrations.length}
            subtitle="Active passes on your account"
            icon={Ticket}
            iconBg="var(--color-primary-light)"
            iconColor="var(--color-primary)"
          />
          <StatCard
            title="Sessions Attended"
            value={attendedCount}
            subtitle="Check-in verified via QR pass"
            icon={CheckCircle2}
            iconBg="var(--color-success-bg)"
            iconColor="var(--color-success)"
          />
          <StatCard
            title="Campus Status"
            value="Active Student"
            subtitle="Eligible for all collegiate events"
            icon={Sparkles}
            iconBg="var(--color-warning-bg)"
            iconColor="var(--color-warning-text)"
          />
        </div>

        {/* Upcoming Registered Events */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--color-navy-950)' }}>
                Your Upcoming Event Passes
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-navy-500)' }}>
                Present the digital pass QR code at the event gate
              </p>
            </div>
            <Link to="/my-registrations" className="btn btn-ghost btn-sm" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              View all ({activeRegistrations.length}) →
            </Link>
          </div>

          {activeRegistrations.length === 0 ? (
            <div className="card empty-state" style={{ padding: '2.5rem 1.5rem' }}>
              <div className="empty-state-icon">
                <Ticket size={28} />
              </div>
              <h3 className="empty-state-title" style={{ fontSize: '1.1rem' }}>No Active Registrations</h3>
              <p className="empty-state-desc" style={{ fontSize: '0.875rem' }}>
                You have not registered for any upcoming events yet. Discover hackathons, workshops, and sports tournaments on campus!
              </p>
              <Link to="/events" className="btn btn-primary btn-sm">
                Explore Event Catalog
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {activeRegistrations.slice(0, 3).map((reg) => (
                <div
                  key={reg.id}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span className="badge badge-success">Confirmed</span>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-navy-600)' }}>
                        {reg.ticketCode}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', color: 'var(--color-navy-950)', marginBottom: '0.5rem', fontWeight: 700 }}>
                      {reg.eventTitle}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8125rem', color: 'var(--color-navy-600)', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} color="var(--color-primary)" />
                        Date: {reg.eventDate}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} color="var(--color-primary)" />
                        {reg.venue}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--color-slate-100)', paddingTop: '0.75rem' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => setSelectedTicket(reg)}
                    >
                      <Ticket size={14} />
                      View Pass
                    </button>
                    <Link to={`/events/${reg.eventId}`} className="btn btn-secondary btn-sm">
                      Event Info
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recommended Events */}
        {recommendedEvents.length > 0 && (
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.35rem', color: 'var(--color-navy-950)' }}>
                Recommended for You
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-navy-500)' }}>
                Trending campus activities based on your department and interests
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {recommendedEvents.map((evt) => (
                <div key={evt.id} className="card card-hover" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="badge badge-primary">{evt.category}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-navy-500)' }}>{evt.eventDate}</span>
                  </div>
                  <h3 style={{ fontSize: '1rem', color: 'var(--color-navy-950)', marginBottom: '0.5rem', fontWeight: 700 }}>
                    {evt.title}
                  </h3>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-navy-600)', marginBottom: '1rem', lineHeight: 1.45, flex: 1 }}>
                    {evt.shortDescription}
                  </p>
                  <Link to={`/events/${evt.id}`} className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                    View & Register <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ticket Pass Modal */}
      <RegistrationTicketModal
        isOpen={Boolean(selectedTicket)}
        onClose={() => setSelectedTicket(null)}
        registration={selectedTicket}
      />
    </div>
  );
}
