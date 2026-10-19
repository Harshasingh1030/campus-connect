import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  CheckCircle2,
  TrendingUp,
  Plus,
  QrCode,
  ArrowRight,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { eventService, registrationService } from '../../services';
import { StatCard } from '../../components/StatCard';
import { StatusBadge } from '../../components/Badge';
import { EventFormModal } from '../../components/EventFormModal';
import { AttendanceScannerModal } from '../../components/AttendanceScannerModal';
import { useToast } from '../../context/ToastContext';

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const toast = useToast();

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const ds = await eventService.getDashboardStats();
      setStats(ds);

      const allRegs = await registrationService.getEventRegistrations('all');
      setRecentRegistrations(allRegs.slice(0, 6));

      // Build chart data from category breakdown
      if (ds.categoryStats) {
        const formattedChart = Object.keys(ds.categoryStats).map((catKey) => ({
          category: catKey.charAt(0).toUpperCase() + catKey.slice(1),
          registrations: ds.categoryStats[catKey].registrations || 0,
          events: ds.categoryStats[catKey].count || 0
        }));
        setChartData(formattedChart);
      }
    } catch (err) {
      toast.error('Failed to load administrative analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCreateEvent = async (formData) => {
    await eventService.createEvent(formData);
    toast.success('New campus event published successfully.');
    await loadDashboardData();
  };

  if (isLoading || !stats) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} className="animate-spin" color="var(--color-primary)" style={{ marginBottom: '1rem' }} />
        <p style={{ color: 'var(--color-navy-500)' }}>Aggregating campus event metrics...</p>
      </div>
    );
  }

  // Chart accent colors
  const BAR_COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#0ea5e9', '#10b981', '#f59e0b'];

  return (
    <div>
      {/* Title & Quick Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', color: 'var(--color-navy-950)', marginBottom: '0.25rem' }}>
            Campus Event Administration
          </h1>
          <p style={{ color: 'var(--color-navy-500)', fontSize: '0.9rem' }}>
            Real-time registration capacity, venue bookings, and attendance monitoring.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setScannerOpen(true)}
          >
            <QrCode size={16} color="var(--color-primary)" />
            Scan Ticket
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus size={16} />
            Create Event
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard
          title="Total Events"
          value={stats.totalEvents}
          subtitle={`${stats.publishedEvents} published, ${stats.upcomingEvents} upcoming`}
          icon={Calendar}
          iconBg="var(--color-primary-light)"
          iconColor="var(--color-primary)"
        />
        <StatCard
          title="Confirmed Registrations"
          value={stats.totalRegistrations}
          subtitle={`${stats.totalBooked} / ${stats.totalCapacity} total seats filled`}
          icon={Users}
          iconBg="rgba(14, 165, 233, 0.12)"
          iconColor="var(--color-info)"
        />
        <StatCard
          title="Verified Attendance"
          value={stats.presentCount}
          subtitle={`${stats.attendanceRate}% check-in conversion rate`}
          icon={CheckCircle2}
          iconBg="var(--color-success-bg)"
          iconColor="var(--color-success)"
        />
        <StatCard
          title="Campus Capacity"
          value={`${Math.round((stats.totalBooked / (stats.totalCapacity || 1)) * 100)}%`}
          subtitle="Overall seat utilization rate"
          icon={TrendingUp}
          iconBg="var(--color-warning-bg)"
          iconColor="var(--color-warning-text)"
        />
      </div>

      {/* Chart & Quick Actions Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Recharts Registration Breakdown */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--color-navy-950)' }}>
                Registration Distribution by Category
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-navy-500)' }}>
                Comparison of student sign-ups across event genres
              </p>
            </div>
            <span className="badge badge-primary">Active Term</span>
          </div>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="registrations" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Operations Box */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--color-navy-950)', marginBottom: '0.5rem' }}>
              Administrative Actions
            </h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--color-navy-500)', marginBottom: '1.25rem' }}>
              Common workflows for managing students and venue staff
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <Link
                to="/admin/events"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'space-between', padding: '0.75rem 1rem' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={16} color="var(--color-primary)" />
                  Manage All Events
                </span>
                <ArrowRight size={14} />
              </Link>

              <Link
                to="/admin/participants"
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'space-between', padding: '0.75rem 1rem' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={16} color="var(--color-primary)" />
                  Participant List & Attendance
                </span>
                <ArrowRight size={14} />
              </Link>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setScannerOpen(true)}
                style={{ justifyContent: 'space-between', padding: '0.75rem 1rem' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <QrCode size={16} color="var(--color-primary)" />
                  Verify Ticket Code
                </span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div
            style={{
              padding: '0.875rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-slate-100)',
              marginTop: '1.25rem',
              fontSize: '0.75rem',
              color: 'var(--color-navy-600)',
              lineHeight: 1.45
            }}
          >
            <strong>AWS Serverless Notice:</strong> In production deployment, all registration counts are synchronized via DynamoDB atomic update operations (`ADD registeredCount 1`).
          </div>
        </div>
      </div>

      {/* Recent Registrations Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--color-navy-950)' }}>
              Recent Student Registrations
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-navy-500)' }}>
              Real-time feed of newly issued digital passes
            </p>
          </div>
          <Link to="/admin/participants" className="btn btn-ghost btn-sm" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            View All Participants →
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-slate-200)', color: 'var(--color-navy-500)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Ticket Code</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Student Name</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Event Title</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Registration Date</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Status</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Attendance</th>
              </tr>
            </thead>
            <tbody>
              {recentRegistrations.map((reg) => (
                <tr key={reg.id} style={{ borderBottom: '1px solid var(--color-slate-100)' }}>
                  <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-navy-800)' }}>
                    {reg.ticketCode || reg.id}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', fontWeight: 600, color: 'var(--color-navy-900)' }}>
                    {reg.studentName}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--color-navy-700)' }}>
                    {reg.eventTitle}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', color: 'var(--color-navy-500)' }}>
                    {new Date(reg.registeredAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <StatusBadge status={reg.status} />
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: reg.attendance === 'present' ? 'var(--color-success)' : 'var(--color-navy-500)'
                      }}
                    >
                      {reg.attendance?.toUpperCase() || 'PENDING'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Event Modal */}
      <EventFormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSave={handleCreateEvent}
      />

      {/* Ticket Scanner Modal */}
      <AttendanceScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onAttendanceUpdated={() => loadDashboardData()}
      />
    </div>
  );
}
