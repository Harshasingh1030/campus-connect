import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  XCircle,
  Users,
  MoreVertical,
  Loader2
} from 'lucide-react';
import { eventService } from '../../services';
import { StatusBadge } from '../../components/Badge';
import { EventFormModal } from '../../components/EventFormModal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { CATEGORIES } from '../../data/seedData';

export function AdminEventsPage() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    action: null,
    isDestructive: false
  });
  const [isActionLoading, setIsActionLoading] = useState(false);
  const toast = useToast();

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const data = await eventService.getEvents({
        search,
        status: statusFilter,
        category: categoryFilter
      });
      setEvents(data);
    } catch (err) {
      toast.error('Failed to load events.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [search, statusFilter, categoryFilter]);

  const handleSaveEvent = async (formData) => {
    if (eventToEdit) {
      await eventService.updateEvent(eventToEdit.id, formData);
      toast.success('Event updated successfully.');
    } else {
      await eventService.createEvent(formData);
      toast.success('Event created and published successfully.');
    }
    setEventToEdit(null);
    await loadEvents();
  };

  const handleTogglePublish = async (event) => {
    try {
      if (event.status === 'published') {
        await eventService.unpublishEvent(event.id);
        toast.info(`Event "${event.title}" unpublished (set to draft).`);
      } else {
        await eventService.publishEvent(event.id);
        toast.success(`Event "${event.title}" published to student portal.`);
      }
      await loadEvents();
    } catch (err) {
      toast.error(err.message || 'Status transition failed.');
    }
  };

  const handleCancelEvent = (event) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cancel Event?',
      message: `Are you sure you want to cancel "${event.title}"? This event will no longer accept registrations, but existing ticket records will be preserved.`,
      isDestructive: true,
      action: async () => {
        setIsActionLoading(true);
        try {
          await eventService.cancelEvent(event.id);
          toast.warning(`Event "${event.title}" has been cancelled.`);
          setConfirmDialog({ isOpen: false });
          await loadEvents();
        } catch (err) {
          toast.error(err.message || 'Failed to cancel event.');
        } finally {
          setIsActionLoading(false);
        }
      }
    });
  };

  const handleDeleteDraft = (event) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Draft Event?',
      message: `Are you sure you want to permanently delete draft "${event.title}"? This action cannot be undone.`,
      isDestructive: true,
      action: async () => {
        setIsActionLoading(true);
        try {
          await eventService.deleteDraftEvent(event.id);
          toast.info(`Draft event "${event.title}" deleted.`);
          setConfirmDialog({ isOpen: false });
          await loadEvents();
        } catch (err) {
          toast.error(err.message || 'Failed to delete draft event.');
        } finally {
          setIsActionLoading(false);
        }
      }
    });
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--color-navy-950)', marginBottom: '0.25rem' }}>
            Event Management
          </h1>
          <p style={{ color: 'var(--color-navy-500)', fontSize: '0.9rem' }}>
            Create, edit, publish, or cancel university-wide campus events.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            setEventToEdit(null);
            setIsFormModalOpen(true);
          }}
        >
          <Plus size={16} />
          Create New Event
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={16} color="var(--color-navy-400)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
            placeholder="Search events by title or venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div style={{ minWidth: '140px' }}>
          <select
            className="form-select"
            style={{ fontSize: '0.85rem', padding: '0.6rem 0.75rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Category Filter */}
        <div style={{ minWidth: '140px' }}>
          <select
            className="form-select"
            style={{ fontSize: '0.85rem', padding: '0.6rem 0.75rem' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Events Table Card */}
      <div className="card" style={{ padding: '0.5rem 0', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-navy-500)' }}>
            <Loader2 size={28} className="animate-spin" color="var(--color-primary)" style={{ marginBottom: '8px' }} />
            <p>Loading events table...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state" style={{ padding: '3.5rem 1.5rem' }}>
            <h3 className="empty-state-title">No Events Found</h3>
            <p className="empty-state-desc">Try resetting your status or category filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-slate-200)', backgroundColor: 'var(--color-slate-50)', color: 'var(--color-navy-500)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Event</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Date & Venue</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Registrations / Capacity</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((evt) => {
                  const regCount = evt.registeredCount || 0;
                  const maxCap = evt.maxParticipants || 1;
                  const pct = Math.min(100, Math.round((regCount / maxCap) * 100));

                  return (
                    <tr key={evt.id} style={{ borderBottom: '1px solid var(--color-slate-100)', transition: 'background-color 0.15s' }}>
                      {/* Event Title & Thumbnail */}
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={evt.posterUrl}
                            alt=""
                            style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=100&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--color-navy-950)', fontSize: '0.925rem' }}>
                              {evt.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-navy-500)', marginTop: '2px' }}>
                              Host: {evt.organizer}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '1rem 1rem' }}>
                        <span className="badge badge-primary">{evt.category}</span>
                      </td>

                      {/* Date & Venue */}
                      <td style={{ padding: '1rem 1rem' }}>
                        <div style={{ color: 'var(--color-navy-900)', fontWeight: 600, fontSize: '0.825rem' }}>
                          {evt.eventDate}
                        </div>
                        <div style={{ color: 'var(--color-navy-500)', fontSize: '0.75rem', marginTop: '2px' }}>
                          {evt.venue}
                        </div>
                      </td>

                      {/* Registrations / Capacity */}
                      <td style={{ padding: '1rem 1rem', minWidth: '160px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--color-navy-800)' }}>
                            {regCount} / {maxCap}
                          </span>
                          <span style={{ color: 'var(--color-navy-500)' }}>{pct}%</span>
                        </div>
                        <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--color-slate-200)', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${pct}%`,
                              height: '100%',
                              backgroundColor: pct >= 100 ? 'var(--color-danger)' : 'var(--color-primary)'
                            }}
                          />
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '1rem 1rem' }}>
                        <StatusBadge status={evt.status} />
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {/* View details */}
                          <Link
                            to={`/events/${evt.id}`}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '4px 6px' }}
                            title="View Public Page"
                          >
                            <Eye size={16} />
                          </Link>

                          {/* Edit */}
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '4px 6px' }}
                            onClick={() => {
                              setEventToEdit(evt);
                              setIsFormModalOpen(true);
                            }}
                            title="Edit Event"
                          >
                            <Edit2 size={16} />
                          </button>

                          {/* Toggle publish status */}
                          {evt.status !== 'cancelled' && (
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '4px 6px' }}
                              onClick={() => handleTogglePublish(evt)}
                              title={evt.status === 'published' ? 'Unpublish to Draft' : 'Publish Event'}
                            >
                              {evt.status === 'published' ? <EyeOff size={16} color="var(--color-warning-text)" /> : <Eye size={16} color="var(--color-success)" />}
                            </button>
                          )}

                          {/* Cancel or Delete draft */}
                          {evt.status === 'draft' ? (
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '4px 6px', color: 'var(--color-danger)' }}
                              onClick={() => handleDeleteDraft(evt)}
                              title="Delete Draft"
                            >
                              <Trash2 size={16} />
                            </button>
                          ) : evt.status === 'published' ? (
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '4px 6px', color: 'var(--color-danger)' }}
                              onClick={() => handleCancelEvent(evt)}
                              title="Cancel Event"
                            >
                              <XCircle size={16} />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit / Create Event Modal */}
      <EventFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEventToEdit(null);
        }}
        onSave={handleSaveEvent}
        eventToEdit={eventToEdit}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDestructive={confirmDialog.isDestructive}
        isLoading={isActionLoading}
        onConfirm={confirmDialog.action}
        onCancel={() => setConfirmDialog({ isOpen: false })}
      />
    </div>
  );
}
