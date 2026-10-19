import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Download,
  QrCode,
  CheckCircle2,
  XCircle,
  Calendar,
  Filter,
  Check,
  X,
  Loader2
} from 'lucide-react';
import { registrationService, attendanceService, eventService } from '../../services';
import { StatusBadge } from '../../components/Badge';
import { AttendanceScannerModal } from '../../components/AttendanceScannerModal';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useToast } from '../../context/ToastContext';

export function AdminParticipantsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [attendanceFilter, setAttendanceFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [scannerOpen, setScannerOpen] = useState(false);
  const [regToCancel, setRegToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const toast = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const allEvents = await eventService.getEvents();
      setEvents(allEvents);

      const allRegs = await registrationService.getEventRegistrations(selectedEventId);
      setRegistrations(allRegs);
    } catch (err) {
      toast.error('Failed to load participant data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedEventId]);

  // Client filtering for fast responsiveness
  const filteredRegistrations = registrations.filter((r) => {
    // Search keyword
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const match =
        r.studentName.toLowerCase().includes(q) ||
        r.studentEmail.toLowerCase().includes(q) ||
        (r.studentRegNo && r.studentRegNo.toLowerCase().includes(q)) ||
        (r.ticketCode && r.ticketCode.toLowerCase().includes(q)) ||
        (r.eventTitle && r.eventTitle.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Status filter
    if (statusFilter !== 'all' && r.status !== statusFilter) {
      return false;
    }

    // Attendance filter
    if (attendanceFilter !== 'all' && r.attendance !== attendanceFilter) {
      return false;
    }

    return true;
  });

  const handleMarkAttendance = async (regId, newStatus) => {
    try {
      await attendanceService.markAttendance(regId, newStatus);
      toast.success(`Attendance updated to ${newStatus.toUpperCase()}.`);
      // Update local state smoothly
      setRegistrations((prev) =>
        prev.map((r) => (r.id === regId ? { ...r, attendance: newStatus } : r))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update attendance.');
    }
  };

  const handleExportCsv = () => {
    try {
      const selectedEvent = events.find((e) => e.id === selectedEventId);
      const title = selectedEvent ? selectedEvent.title : 'All_Campus_Events';
      attendanceService.exportToCsv(filteredRegistrations, title);
      toast.success('Participant report CSV downloaded successfully.');
    } catch (err) {
      toast.error(err.message || 'CSV export failed.');
    }
  };

  const handleCancelRegistration = async () => {
    if (!regToCancel) return;
    setIsCancelling(true);
    try {
      await registrationService.cancelRegistration(regToCancel.id);
      toast.info('Student registration cancelled.');
      setRegToCancel(null);
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel registration.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--color-navy-950)', marginBottom: '0.25rem' }}>
            Registrations & Attendance
          </h1>
          <p style={{ color: 'var(--color-navy-500)', fontSize: '0.9rem' }}>
            Track attendee rosters, verify digital tickets, and export CSV reports.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setScannerOpen(true)}
          >
            <QrCode size={16} color="var(--color-primary)" />
            Verify Ticket Code
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleExportCsv}
            disabled={filteredRegistrations.length === 0}
          >
            <Download size={16} />
            Export CSV ({filteredRegistrations.length})
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={16} color="var(--color-navy-400)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.25rem', fontSize: '0.85rem' }}
            placeholder="Search by student name, roll ID, or ticket code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Event selector */}
        <div style={{ minWidth: '220px' }}>
          <select
            className="form-select"
            style={{ fontSize: '0.85rem', padding: '0.6rem 0.75rem' }}
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            <option value="all">All Events Catalog</option>
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title.substring(0, 35)}...
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div style={{ minWidth: '130px' }}>
          <select
            className="form-select"
            style={{ fontSize: '0.85rem', padding: '0.6rem 0.75rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Attendance */}
        <div style={{ minWidth: '140px' }}>
          <select
            className="form-select"
            style={{ fontSize: '0.85rem', padding: '0.6rem 0.75rem' }}
            value={attendanceFilter}
            onChange={(e) => setAttendanceFilter(e.target.value)}
          >
            <option value="all">All Attendance</option>
            <option value="present">Present (Checked In)</option>
            <option value="pending">Pending</option>
            <option value="absent">Absent</option>
          </select>
        </div>
      </div>

      {/* Participant Table */}
      <div className="card" style={{ padding: '0.5rem 0', overflow: 'hidden' }}>
        {isLoading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-navy-500)' }}>
            <Loader2 size={28} className="animate-spin" color="var(--color-primary)" style={{ marginBottom: '8px' }} />
            <p>Loading participant rosters...</p>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="empty-state" style={{ padding: '3.5rem 1.5rem' }}>
            <div className="empty-state-icon">
              <Users size={32} />
            </div>
            <h3 className="empty-state-title">No Participants Match</h3>
            <p className="empty-state-desc">
              No registration records found for the selected event and search criteria.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-slate-200)', backgroundColor: 'var(--color-slate-50)', color: 'var(--color-navy-500)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Student Attendee</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Ticket Code</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Event Title</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Registered At</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Attendance</th>
                  <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((reg) => (
                  <tr key={reg.id} style={{ borderBottom: '1px solid var(--color-slate-100)' }}>
                    {/* Student Info */}
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--color-navy-950)' }}>
                        {reg.studentName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-navy-500)' }}>
                        {reg.studentRegNo || 'ID N/A'} • {reg.studentEmail}
                      </div>
                    </td>

                    {/* Ticket Code */}
                    <td style={{ padding: '0.85rem 1rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-navy-800)' }}>
                      {reg.ticketCode || reg.id}
                    </td>

                    {/* Event Title */}
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--color-navy-800)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {reg.eventTitle}
                    </td>

                    {/* Registered Date */}
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--color-navy-500)', fontSize: '0.8rem' }}>
                      {new Date(reg.registeredAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <StatusBadge status={reg.status} />
                    </td>

                    {/* Attendance Check-in */}
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{
                            padding: '3px 8px',
                            fontSize: '0.75rem',
                            backgroundColor: reg.attendance === 'present' ? 'var(--color-success)' : 'var(--color-slate-100)',
                            color: reg.attendance === 'present' ? '#ffffff' : 'var(--color-navy-700)',
                            borderRadius: '4px'
                          }}
                          onClick={() => handleMarkAttendance(reg.id, 'present')}
                          title="Mark Present"
                        >
                          <Check size={12} />
                          Present
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm"
                          style={{
                            padding: '3px 8px',
                            fontSize: '0.75rem',
                            backgroundColor: reg.attendance === 'absent' ? 'var(--color-danger)' : 'var(--color-slate-100)',
                            color: reg.attendance === 'absent' ? '#ffffff' : 'var(--color-navy-700)',
                            borderRadius: '4px'
                          }}
                          onClick={() => handleMarkAttendance(reg.id, 'absent')}
                          title="Mark Absent"
                        >
                          <X size={12} />
                          Absent
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                      {reg.status === 'confirmed' && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--color-danger)', fontSize: '0.75rem', padding: '3px 8px' }}
                          onClick={() => setRegToCancel(reg)}
                          title="Cancel registration"
                        >
                          Cancel Pass
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Scanner Modal */}
      <AttendanceScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onAttendanceUpdated={() => loadData()}
      />

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(regToCancel)}
        title="Cancel Participant Registration?"
        message={`Are you sure you want to cancel the registration for student ${regToCancel?.studentName} (${regToCancel?.ticketCode})?`}
        confirmLabel="Cancel Pass"
        isDestructive={true}
        isLoading={isCancelling}
        onConfirm={handleCancelRegistration}
        onCancel={() => setRegToCancel(null)}
      />
    </div>
  );
}
