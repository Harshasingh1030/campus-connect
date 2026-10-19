import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Badge } from './Badge';

export function EventCard({ event, isRegistered = false }) {
  const registeredCount = event.registeredCount || 0;
  const maxParticipants = event.maxParticipants || 1;
  const remaining = Math.max(0, maxParticipants - registeredCount);
  const fillPercentage = Math.min(100, Math.round((registeredCount / maxParticipants) * 100));
  const isFull = remaining === 0;

  // Format date: e.g. "Sat, Nov 14, 2026"
  const formattedDate = event.eventDate
    ? new Date(event.eventDate).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'TBD';

  return (
    <div
      className="card card-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%'
      }}
    >
      {/* Poster Image Container */}
      <div style={{ position: 'relative', width: '100%', height: '190px', overflow: 'hidden', backgroundColor: 'var(--color-slate-100)' }}>
        <img
          src={event.posterUrl}
          alt={event.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
          }}
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80';
          }}
        />

        {/* Category Pill Tag */}
        <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2 }}>
          <Badge variant="primary" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', color: 'var(--color-primary)', fontWeight: 700, backdropFilter: 'blur(4px)', boxShadow: 'var(--shadow-sm)' }}>
            {event.category}
          </Badge>
        </div>

        {/* Registered Tag or Price Tag */}
        <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2 }}>
          {isRegistered ? (
            <span
              style={{
                backgroundColor: 'var(--color-success)',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 8px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <CheckCircle2 size={13} />
              Registered
            </span>
          ) : (
            <span
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                color: '#ffffff',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '9999px',
                backdropFilter: 'blur(4px)'
              }}
            >
              {event.price || 'Free'}
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Date and Organizer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--color-primary)', fontSize: '0.8125rem', fontWeight: 600 }}>
            <Calendar size={14} />
            {formattedDate}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-navy-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
            {event.organizer}
          </span>
        </div>

        {/* Title */}
        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--color-navy-950)',
            marginBottom: '0.45rem',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          <Link to={`/events/${event.id}`} style={{ color: 'inherit' }}>
            {event.title}
          </Link>
        </h3>

        {/* Short Description */}
        <p
          style={{
            fontSize: '0.85rem',
            color: 'var(--color-navy-600)',
            marginBottom: '1rem',
            lineHeight: 1.45,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {event.shortDescription || event.fullDescription}
        </p>

        {/* Venue */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-navy-500)', fontSize: '0.8125rem', marginBottom: '1.25rem' }}>
          <MapPin size={14} style={{ flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {event.venue}
          </span>
        </div>

        {/* Capacity Progress Bar */}
        <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--color-slate-100)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginBottom: '4px' }}>
            <span style={{ color: 'var(--color-navy-600)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={12} />
              {registeredCount} / {maxParticipants} filled
            </span>
            <span
              style={{
                fontWeight: 600,
                color: isFull ? 'var(--color-danger)' : remaining < 15 ? 'var(--color-warning-text)' : 'var(--color-success)'
              }}
            >
              {isFull ? 'Sold Out' : `${remaining} spots left`}
            </span>
          </div>

          <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--color-slate-200)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${fillPercentage}%`,
                height: '100%',
                backgroundColor: isFull
                  ? 'var(--color-danger)'
                  : fillPercentage > 85
                  ? 'var(--color-warning)'
                  : 'var(--color-primary)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: '1rem' }}>
          <Link
            to={`/events/${event.id}`}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {isRegistered ? 'View Registration' : isFull ? 'View Event Info' : 'Explore & Register'}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
