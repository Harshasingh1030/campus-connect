import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Calendar, Users, ArrowRight, ShieldCheck, CheckCircle2, Award, Zap, Compass } from 'lucide-react';
import { eventService } from '../services';
import { CATEGORIES } from '../data/seedData';
import { EventCard } from '../components/EventCard';
import { useAuth } from '../context/AuthContext';

export function LandingPage() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [stats, setStats] = useState({ totalEvents: 12, totalRegistrations: 2840, categories: 6, universities: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function loadData() {
      try {
        const events = await eventService.getEvents({ publicOnly: true });
        const featured = events.filter((e) => e.featured).slice(0, 3);
        setFeaturedEvents(featured.length > 0 ? featured : events.slice(0, 3));

        if (eventService.getDashboardStats) {
          const ds = await eventService.getDashboardStats();
          setStats({
            totalEvents: ds.totalEvents || 12,
            totalRegistrations: ds.totalBooked || 2840,
            categories: 6,
            universities: 1
          });
        }
      } catch (err) {
        console.error('Failed to load landing data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 70%, #0b132b 100%)',
          color: '#ffffff',
          padding: '5rem 0 6rem 0',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle grid pattern background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            opacity: 0.35,
            pointerEvents: 'none'
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              color: '#c7d2fe',
              fontSize: '0.825rem',
              fontWeight: 700,
              marginBottom: '1.75rem'
            }}
          >
            <Sparkles size={16} color="#818cf8" />
            Official University Event & Registration System
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5.5vw, 4.25rem)',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              maxWidth: '850px',
              margin: '0 auto 1.5rem auto'
            }}
          >
            Discover. Register. Experience Campus Life.
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.25rem)',
              color: '#cbd5e1',
              maxWidth: '680px',
              margin: '0 auto 2.5rem auto',
              lineHeight: 1.6
            }}
          >
            A modern, unified platform for university hackathons, workshops, cultural fests, and athletic championships. Instant registration, digital QR ticketing, and real-time attendance.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/events" className="btn btn-primary btn-lg" style={{ minWidth: '180px', gap: '8px' }}>
              <Compass size={18} />
              Explore Events
            </Link>
            <Link
              to={user?.role === 'admin' ? '/admin/events' : '/login'}
              className="btn btn-secondary btn-lg"
              style={{ minWidth: '180px', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.25)' }}
            >
              Organize an Event
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Counter Bar */}
      <section style={{ backgroundColor: 'var(--color-white)', borderBottom: '1px solid var(--color-slate-200)', transform: 'translateY(-24px)', maxWidth: '1060px', margin: '-24px auto 3rem auto', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', padding: '1.75rem 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {stats.totalEvents}+
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-navy-600)', marginTop: '2px' }}>
              Active Campus Events
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-navy-950)' }}>
              {stats.totalRegistrations.toLocaleString()}+
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-navy-600)', marginTop: '2px' }}>
              Student Registrations
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-success)' }}>
              100%
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-navy-600)', marginTop: '2px' }}>
              Digital QR Admission
            </div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-warning-text)' }}>
              6 Categories
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-navy-600)', marginTop: '2px' }}>
              Tech, Arts, Sports & More
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="container" style={{ paddingBottom: '4.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Curated Highlights
            </span>
            <h2 style={{ fontSize: '1.85rem', color: 'var(--color-navy-950)', marginTop: '4px' }}>
              Featured Upcoming Events
            </h2>
          </div>
          <Link to="/events" className="btn btn-outline-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            View All Events
            <ArrowRight size={16} />
          </Link>
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-navy-500)' }}>
            Loading upcoming campus highlights...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem' }}>
            {featuredEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        )}
      </section>

      {/* Categories Showcase */}
      <section style={{ backgroundColor: 'var(--color-white)', borderTop: '1px solid var(--color-slate-200)', borderBottom: '1px solid var(--color-slate-200)', padding: '4.5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Broad Horizons
            </span>
            <h2 style={{ fontSize: '1.85rem', color: 'var(--color-navy-950)', marginTop: '4px' }}>
              Explore by Event Category
            </h2>
            <p style={{ color: 'var(--color-navy-500)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              From competitive coding hackathons to classical arts festivals and varsity tournaments.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
            {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
              <Link
                key={cat.id}
                to={`/events?category=${cat.id}`}
                className="card card-hover"
                style={{
                  padding: '1.5rem',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.75rem',
                  textDecoration: 'none'
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Zap size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', color: 'var(--color-navy-950)' }}>{cat.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-navy-500)' }}>Browse Events →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container" style={{ padding: '5rem 0' }}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem auto' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Seamless Workflow
          </span>
          <h2 style={{ fontSize: '1.85rem', color: 'var(--color-navy-950)', marginTop: '4px' }}>
            How CampusConnect Works
          </h2>
          <p style={{ color: 'var(--color-navy-500)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
            Three simple steps for students to never miss another collegiate experience.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem' }}>
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
                fontWeight: 800,
                fontSize: '1.25rem'
              }}
            >
              1
            </div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy-950)', marginBottom: '0.5rem' }}>
              Explore & Filter
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-navy-600)', lineHeight: 1.5 }}>
              Browse upcoming hackathons, sports meets, and seminars filtered by department, category, and date.
            </p>
          </div>

          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
                fontWeight: 800,
                fontSize: '1.25rem'
              }}
            >
              2
            </div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy-950)', marginBottom: '0.5rem' }}>
              Register Instantly
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-navy-600)', lineHeight: 1.5 }}>
              One-click registration secured with real-time capacity management and instant admission pass generation.
            </p>
          </div>

          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
                fontWeight: 800,
                fontSize: '1.25rem'
              }}
            >
              3
            </div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy-950)', marginBottom: '0.5rem' }}>
              Check-In with QR Pass
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-navy-600)', lineHeight: 1.5 }}>
              Present your digital event pass at the venue entrance for automated attendance verification by campus staff.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
