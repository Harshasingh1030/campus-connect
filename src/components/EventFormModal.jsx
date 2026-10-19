import React, { useState, useEffect } from 'react';
import { X, Upload, Calendar, Clock, MapPin, Users, AlertCircle, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadService } from '../services';
import { CATEGORIES } from '../data/seedData';
import { useToast } from '../context/ToastContext';

export function EventFormModal({ isOpen, onClose, onSave, eventToEdit = null }) {
  const isEditing = Boolean(eventToEdit);
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    fullDescription: '',
    category: 'technical',
    eventDate: '',
    startTime: '09:00',
    endTime: '17:00',
    venue: '',
    organizer: '',
    organizerEmail: '',
    registrationDeadline: '',
    maxParticipants: 100,
    eligibility: 'Open to all university students',
    status: 'published',
    posterUrl: '',
    featured: false,
    tags: ''
  });

  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewNote, setPreviewNote] = useState('');

  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        title: eventToEdit.title || '',
        shortDescription: eventToEdit.shortDescription || '',
        fullDescription: eventToEdit.fullDescription || '',
        category: eventToEdit.category || 'technical',
        eventDate: eventToEdit.eventDate || '',
        startTime: eventToEdit.startTime || '09:00',
        endTime: eventToEdit.endTime || '17:00',
        venue: eventToEdit.venue || '',
        organizer: eventToEdit.organizer || '',
        organizerEmail: eventToEdit.organizerEmail || '',
        registrationDeadline: eventToEdit.registrationDeadline ? eventToEdit.registrationDeadline.substring(0, 16) : '',
        maxParticipants: eventToEdit.maxParticipants || 100,
        eligibility: eventToEdit.eligibility || '',
        status: eventToEdit.status || 'published',
        posterUrl: eventToEdit.posterUrl || '',
        featured: Boolean(eventToEdit.featured),
        tags: Array.isArray(eventToEdit.tags) ? eventToEdit.tags.join(', ') : ''
      });
      setPreviewNote('');
    } else {
      // Default dates for new event
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 14);
      const dateStr = tomorrow.toISOString().split('T')[0];

      setFormData({
        title: '',
        shortDescription: '',
        fullDescription: '',
        category: 'technical',
        eventDate: dateStr,
        startTime: '10:00',
        endTime: '16:00',
        venue: 'Main Campus Auditorium',
        organizer: 'Engineering Student Council',
        organizerEmail: 'council@campus.edu',
        registrationDeadline: `${dateStr}T09:00`,
        maxParticipants: 150,
        eligibility: 'Open to all enrolled university students',
        status: 'published',
        posterUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
        featured: false,
        tags: 'Technology, Campus, Workshop'
      });
      setPreviewNote('');
    }
    setErrors({});
  }, [eventToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Event title is required.';
    if (!formData.eventDate) errs.eventDate = 'Event date is required.';
    if (!formData.venue.trim()) errs.venue = 'Venue location is required.';
    if (!formData.organizer.trim()) errs.organizer = 'Organizer name is required.';
    
    const cap = parseInt(formData.maxParticipants, 10);
    if (isNaN(cap) || cap <= 0) {
      errs.maxParticipants = 'Participant capacity must be a positive number.';
    } else if (isEditing && cap < (eventToEdit.registeredCount || 0)) {
      errs.maxParticipants = `Cannot be lower than currently registered participants (${eventToEdit.registeredCount}).`;
    }

    if (formData.registrationDeadline && formData.eventDate) {
      const deadlineDate = formData.registrationDeadline.split('T')[0];
      if (deadlineDate > formData.eventDate) {
        errs.registrationDeadline = 'Deadline cannot be after the event date.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePosterFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadRes = await uploadService.uploadPoster(file);
      setFormData((prev) => ({ ...prev, posterUrl: uploadRes.url }));
      setPreviewNote(uploadRes.message || 'Image selected.');
      toast.info('Poster preview updated. In AWS production, this uploads directly to private Amazon S3 via presigned URL.');
    } catch (err) {
      toast.error(err.message || 'Failed to select image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the validation errors in the form.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content modal-content-lg">
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--color-navy-950)' }}>
              {isEditing ? 'Edit Event Details' : 'Create New Campus Event'}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-navy-500)', marginTop: '2px' }}>
              {isEditing ? 'Update event parameters and registration capacity' : 'Publish an event to the university student portal'}
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px' }} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
            {/* Title & Category */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="eventTitle">
                  Event Title <span className="required">*</span>
                </label>
                <input
                  id="eventTitle"
                  type="text"
                  className={`form-input ${errors.title ? 'error' : ''}`}
                  placeholder="e.g. Annual Autonomous Drone Championship"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
                {errors.title && <span className="form-error">{errors.title}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="eventCategory">
                  Category <span className="required">*</span>
                </label>
                <select
                  id="eventCategory"
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Short Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="shortDesc">
                Short Summary (Card Preview)
              </label>
              <input
                id="shortDesc"
                type="text"
                className="form-input"
                placeholder="A concise 1-2 sentence overview for the event card"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              />
            </div>

            {/* Full Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="fullDesc">
                Full Description & Agenda
              </label>
              <textarea
                id="fullDesc"
                rows={3}
                className="form-textarea"
                placeholder="Comprehensive details, competition tracks, rules, schedule, prizes..."
                value={formData.fullDescription}
                onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
              />
            </div>

            {/* Date, Time & Venue */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="eventDate">
                  Event Date <span className="required">*</span>
                </label>
                <input
                  id="eventDate"
                  type="date"
                  className={`form-input ${errors.eventDate ? 'error' : ''}`}
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                />
                {errors.eventDate && <span className="form-error">{errors.eventDate}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="startTime">
                  Start Time
                </label>
                <input
                  id="startTime"
                  type="time"
                  className="form-input"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="endTime">
                  End Time
                </label>
                <input
                  id="endTime"
                  type="time"
                  className="form-input"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>

            {/* Venue & Organizer */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="venue">
                  Venue Location <span className="required">*</span>
                </label>
                <input
                  id="venue"
                  type="text"
                  className={`form-input ${errors.venue ? 'error' : ''}`}
                  placeholder="e.g. Computing Lab 4, Tech Block"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                />
                {errors.venue && <span className="form-error">{errors.venue}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="organizer">
                  Organizer Organization <span className="required">*</span>
                </label>
                <input
                  id="organizer"
                  type="text"
                  className={`form-input ${errors.organizer ? 'error' : ''}`}
                  placeholder="e.g. ACM Student Chapter"
                  value={formData.organizer}
                  onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                />
                {errors.organizer && <span className="form-error">{errors.organizer}</span>}
              </div>
            </div>

            {/* Capacity, Deadline & Eligibility */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="maxParticipants">
                  Participant Capacity <span className="required">*</span>
                </label>
                <input
                  id="maxParticipants"
                  type="number"
                  min="1"
                  className={`form-input ${errors.maxParticipants ? 'error' : ''}`}
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                />
                {errors.maxParticipants && <span className="form-error">{errors.maxParticipants}</span>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="regDeadline">
                  Registration Deadline
                </label>
                <input
                  id="regDeadline"
                  type="datetime-local"
                  className={`form-input ${errors.registrationDeadline ? 'error' : ''}`}
                  value={formData.registrationDeadline}
                  onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                />
                {errors.registrationDeadline && <span className="form-error">{errors.registrationDeadline}</span>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="eligibility">
                Eligibility & Prerequisites
              </label>
              <input
                id="eligibility"
                type="text"
                className="form-input"
                placeholder="e.g. Open to all undergraduate students; bring personal laptop"
                value={formData.eligibility}
                onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
              />
            </div>

            {/* Poster Upload & URL */}
            <div className="form-group">
              <label className="form-label">
                Event Poster (Amazon S3 Presigned URL Flow)
              </label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <label
                  className="btn btn-secondary btn-sm"
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Upload size={16} />
                  {isUploading ? 'Preparing Preview...' : 'Choose Poster Image'}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handlePosterFileChange}
                    disabled={isUploading}
                  />
                </label>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-navy-500)' }}>
                  PNG, JPG, or WEBP up to 5MB
                </span>
              </div>

              {formData.posterUrl && (
                <div
                  style={{
                    marginTop: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--color-slate-100)',
                    border: '1px solid var(--color-slate-200)'
                  }}
                >
                  <img
                    src={formData.posterUrl}
                    alt="Poster preview"
                    style={{ width: '64px', height: '44px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-navy-800)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {formData.posterUrl}
                    </p>
                    <span className="demo-mode-tag" style={{ fontSize: '0.65rem' }}>
                      Local Preview / Ready for S3 PUT
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Publication Status & Featured Flag */}
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginTop: '0.5rem', padding: '1rem', backgroundColor: 'var(--color-slate-50)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <label className="form-label" style={{ marginBottom: '4px' }}>Publication Status</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={formData.status === 'published'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    />
                    Published (Active)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={formData.status === 'draft'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    />
                    Draft (Unpublished)
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '1.25rem' }}>
                <input
                  id="featuredToggle"
                  type="checkbox"
                  style={{ width: '16px', height: '16px' }}
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                />
                <label htmlFor="featuredToggle" style={{ fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>
                  Feature on Landing Hero
                </label>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary btn-sm" disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting || isUploading}>
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : null}
              {isEditing ? 'Save Changes' : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
