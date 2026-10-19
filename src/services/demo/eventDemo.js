/**
 * Demo Event Service
 * Manages event queries, creation, updates, and status transitions using localStorage.
 */

import { getStore, saveStore } from './storage';

export const eventDemoService = {
  async getEvents(filters = {}) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const store = getStore();
    let events = [...store.events];

    // Filter by published status for students unless explicitly requested
    if (filters.status && filters.status !== 'all') {
      events = events.filter((e) => e.status === filters.status);
    } else if (filters.publicOnly) {
      events = events.filter((e) => e.status === 'published');
    }

    // Keyword search
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      events = events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.shortDescription?.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.organizer.toLowerCase().includes(q) ||
          (e.tags && e.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      events = events.filter((e) => e.category.toLowerCase() === filters.category.toLowerCase());
    }

    // Date filter
    if (filters.startDate) {
      events = events.filter((e) => e.eventDate >= filters.startDate);
    }
    if (filters.endDate) {
      events = events.filter((e) => e.eventDate <= filters.endDate);
    }

    // Venue filter
    if (filters.venue && filters.venue !== 'all') {
      events = events.filter((e) => e.venue.toLowerCase().includes(filters.venue.toLowerCase()));
    }

    // Sorting
    if (filters.sortBy === 'popularity') {
      events.sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0));
    } else if (filters.sortBy === 'deadline') {
      events.sort((a, b) => new Date(a.registrationDeadline) - new Date(b.registrationDeadline));
    } else {
      // Default: sort by upcoming date
      events.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
    }

    return events;
  },

  async getEventById(id) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const store = getStore();
    const event = store.events.find((e) => e.id === id);
    if (!event) {
      throw new Error(`Event with ID "${id}" was not found.`);
    }
    return event;
  },

  async createEvent(eventData) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const store = getStore();

    // Validation
    if (!eventData.title?.trim()) {
      throw new Error('Event title is required.');
    }
    if (!eventData.eventDate) {
      throw new Error('Event date is required.');
    }
    const maxParticipants = parseInt(eventData.maxParticipants, 10);
    if (isNaN(maxParticipants) || maxParticipants <= 0) {
      throw new Error('Maximum participants must be a positive number.');
    }
    if (eventData.registrationDeadline && eventData.registrationDeadline > `${eventData.eventDate}T23:59`) {
      throw new Error('Registration deadline cannot be after the event start date.');
    }

    const newEvent = {
      id: `evt-${Date.now().toString(36)}`,
      title: eventData.title.trim(),
      shortDescription: eventData.shortDescription?.trim() || '',
      fullDescription: eventData.fullDescription?.trim() || '',
      category: eventData.category || 'technical',
      eventDate: eventData.eventDate,
      startTime: eventData.startTime || '09:00',
      endTime: eventData.endTime || '17:00',
      venue: eventData.venue?.trim() || 'Main Campus',
      organizer: eventData.organizer?.trim() || 'University Events Committee',
      organizerEmail: eventData.organizerEmail?.trim() || 'events@campus.edu',
      maxParticipants,
      registeredCount: 0,
      registrationDeadline: eventData.registrationDeadline || `${eventData.eventDate}T23:59`,
      eligibility: eventData.eligibility?.trim() || 'Open to all students',
      status: eventData.status || 'published',
      posterUrl: eventData.posterUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
      featured: Boolean(eventData.featured),
      price: eventData.price || 'Free',
      tags: Array.isArray(eventData.tags) ? eventData.tags : (eventData.tags || '').split(',').map(t => t.trim()).filter(Boolean),
      createdAt: new Date().toISOString()
    };

    store.events.unshift(newEvent);
    saveStore(store);
    return newEvent;
  },

  async updateEvent(id, updateData) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const store = getStore();
    const index = store.events.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error(`Event with ID "${id}" was not found.`);
    }

    const current = store.events[index];
    const maxParticipants = updateData.maxParticipants !== undefined
      ? parseInt(updateData.maxParticipants, 10)
      : current.maxParticipants;

    if (maxParticipants < current.registeredCount) {
      throw new Error(`Cannot reduce capacity below currently registered count (${current.registeredCount}).`);
    }

    const updated = {
      ...current,
      ...updateData,
      maxParticipants,
      tags: Array.isArray(updateData.tags)
        ? updateData.tags
        : typeof updateData.tags === 'string'
        ? updateData.tags.split(',').map(t => t.trim()).filter(Boolean)
        : current.tags,
      updatedAt: new Date().toISOString()
    };

    store.events[index] = updated;
    saveStore(store);
    return updated;
  },

  async publishEvent(id) {
    return this.updateEvent(id, { status: 'published' });
  },

  async unpublishEvent(id) {
    return this.updateEvent(id, { status: 'draft' });
  },

  async cancelEvent(id) {
    return this.updateEvent(id, { status: 'cancelled' });
  },

  async deleteDraftEvent(id) {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const store = getStore();
    const event = store.events.find((e) => e.id === id);
    if (!event) {
      throw new Error('Event not found.');
    }
    if (event.status !== 'draft') {
      throw new Error('Only draft events can be deleted. Published or active events should be cancelled instead.');
    }

    store.events = store.events.filter((e) => e.id !== id);
    saveStore(store);
    return true;
  },

  async getDashboardStats() {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const store = getStore();
    const now = new Date().toISOString().split('T')[0];

    const totalEvents = store.events.length;
    const publishedEvents = store.events.filter((e) => e.status === 'published').length;
    const upcomingEvents = store.events.filter((e) => e.eventDate >= now && e.status === 'published').length;
    
    const totalRegistrations = store.registrations.filter((r) => r.status === 'confirmed').length;
    const presentCount = store.registrations.filter((r) => r.attendance === 'present').length;
    const totalCapacity = store.events.reduce((sum, e) => sum + (e.maxParticipants || 0), 0);
    const totalBooked = store.events.reduce((sum, e) => sum + (e.registeredCount || 0), 0);

    // Calculate category breakdown
    const categoryStats = {};
    store.events.forEach((evt) => {
      const cat = evt.category || 'general';
      if (!categoryStats[cat]) {
        categoryStats[cat] = { count: 0, registrations: 0 };
      }
      categoryStats[cat].count += 1;
      categoryStats[cat].registrations += (evt.registeredCount || 0);
    });

    return {
      totalEvents,
      publishedEvents,
      upcomingEvents,
      totalRegistrations,
      presentCount,
      totalCapacity,
      totalBooked,
      attendanceRate: totalRegistrations > 0 ? Math.round((presentCount / totalRegistrations) * 100) : 0,
      categoryStats
    };
  }
};
