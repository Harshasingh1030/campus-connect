import React from 'react';
import { Search, Filter, Calendar, MapPin, ArrowUpDown, X } from 'lucide-react';
import { CATEGORIES } from '../data/seedData';

export function EventFilters({ filters, setFilters, venues = [] }) {
  const handleCategoryClick = (catId) => {
    setFilters((prev) => ({ ...prev, category: catId }));
  };

  const handleReset = () => {
    setFilters({
      search: '',
      category: 'all',
      startDate: '',
      venue: 'all',
      sortBy: 'date'
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.category !== 'all' ||
    filters.startDate ||
    filters.venue !== 'all' ||
    filters.sortBy !== 'date';

  return (
    <div className="card" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
      {/* Search Bar + Sort */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search
            size={18}
            color="var(--color-navy-500)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search events by title, keyword, or speaker..."
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
          />
          {filters.search && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-slate-400)' }}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Date Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="date"
            className="form-input"
            style={{ width: '160px', padding: '0.6rem 0.75rem', fontSize: '0.85rem' }}
            value={filters.startDate}
            onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
            aria-label="Filter from date"
          />
        </div>

        {/* Venue Filter */}
        {venues.length > 0 && (
          <div style={{ minWidth: '150px' }}>
            <select
              className="form-select"
              style={{ padding: '0.6rem 0.75rem', fontSize: '0.85rem' }}
              value={filters.venue}
              onChange={(e) => setFilters((prev) => ({ ...prev, venue: e.target.value }))}
              aria-label="Filter by venue"
            >
              <option value="all">All Venues</option>
              {venues.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sort Selector */}
        <div style={{ minWidth: '160px' }}>
          <select
            className="form-select"
            style={{ padding: '0.6rem 0.75rem', fontSize: '0.85rem' }}
            value={filters.sortBy}
            onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
            aria-label="Sort events"
          >
            <option value="date">Date: Upcoming First</option>
            <option value="popularity">Popularity: Most Registered</option>
            <option value="deadline">Registration Deadline</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleReset}
            style={{ color: 'var(--color-danger)' }}
          >
            <X size={14} />
            Reset Filters
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginTop: '1rem',
          paddingTop: '0.85rem',
          borderTop: '1px solid var(--color-slate-100)'
        }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = filters.category === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat.id)}
              style={{
                padding: '0.35rem 0.85rem',
                borderRadius: '9999px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                transition: 'all 0.15s ease',
                backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-slate-100)',
                color: isActive ? '#ffffff' : 'var(--color-navy-700)',
                border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--color-slate-200)'
              }}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
