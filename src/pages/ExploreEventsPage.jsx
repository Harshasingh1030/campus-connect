import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventService, registrationService } from '../services';
import { EventCard } from '../components/EventCard';
import { EventFilters } from '../components/EventFilters';
import { useAuth } from '../context/AuthContext';
import { Calendar, SearchX, Loader2 } from 'lucide-react';

export function ExploreEventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [events, setEvents] = useState([]);
  const [studentRegistrations, setStudentRegistrations] = useState([]);
  const [venues, setVenues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter state
  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    category: searchParams.get('category') || 'all',
    startDate: searchParams.get('startDate') || '',
    venue: searchParams.get('venue') || 'all',
    sortBy: searchParams.get('sort') || 'date'
  });

  // Load events and user registrations
  useEffect(() => {
    async function loadEventsData() {
      setIsLoading(true);
      try {
        const fetchedEvents = await eventService.getEvents({
          ...filters,
          publicOnly: true
        });
        setEvents(fetchedEvents);

        // Extract distinct venues for the dropdown
        const allVenues = [...new Set(fetchedEvents.map((e) => e.venue).filter(Boolean))];
        setVenues(allVenues);

        // Load student registrations if logged in
        if (user?.id) {
          const regs = await registrationService.getStudentRegistrations(user.id);
          const confirmedRegs = regs.filter((r) => r.status === 'confirmed').map((r) => r.eventId);
          setStudentRegistrations(confirmedRegs);
        } else {
          setStudentRegistrations([]);
        }
      } catch (err) {
        console.error('Failed to load explore events:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadEventsData();
  }, [filters, user]);

  return (
    <div style={{ padding: '2.5rem 0 4rem 0', minHeight: '80vh' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', color: 'var(--color-navy-950)', marginBottom: '0.45rem' }}>
            Explore Campus Events
          </h1>
          <p style={{ color: 'var(--color-navy-500)', fontSize: '1rem' }}>
            Discover workshops, hackathons, sports tournaments, and student life activities.
          </p>
        </div>

        {/* Filters & Search Component */}
        <EventFilters
          filters={filters}
          setFilters={setFilters}
          venues={venues}
        />

        {/* Results Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--color-navy-600)', fontWeight: 600 }}>
            Showing {events.length} {events.length === 1 ? 'event' : 'events'}
          </span>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
            <Loader2 size={32} className="animate-spin" color="var(--color-primary)" style={{ marginBottom: '1rem' }} />
            <p style={{ color: 'var(--color-navy-500)', fontSize: '0.95rem' }}>Searching event catalog...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state-icon">
              <SearchX size={32} />
            </div>
            <h3 className="empty-state-title">No Events Found</h3>
            <p className="empty-state-desc">
              We couldn't find any campus events matching your active search criteria. Try clearing your filters or search keywords.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() =>
                setFilters({
                  search: '',
                  category: 'all',
                  startDate: '',
                  venue: 'all',
                  sortBy: 'date'
                })
              }
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
            {events.map((evt) => (
              <EventCard
                key={evt.id}
                event={evt}
                isRegistered={studentRegistrations.includes(evt.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
