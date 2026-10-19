import React, { useState } from 'react';
import { X, QrCode, Search, CheckCircle2, AlertCircle, User, Calendar, MapPin, Loader2 } from 'lucide-react';
import { attendanceService } from '../services';
import { useToast } from '../context/ToastContext';

export function AttendanceScannerModal({ isOpen, onClose, onAttendanceUpdated }) {
  const [ticketInput, setTicketInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const toast = useToast();

  if (!isOpen) return null;

  const handleVerify = async (codeToVerify) => {
    const code = codeToVerify || ticketInput;
    if (!code || !code.trim()) {
      toast.warning('Please enter a ticket code or registration ID.');
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const result = await attendanceService.verifyTicket(code.trim());
      setVerificationResult(result);
      if (result.valid) {
        if (result.isAlreadyCheckedIn) {
          toast.info('Ticket is valid. Note: Participant already checked in.');
        } else {
          toast.success('Valid ticket confirmed.');
        }
      } else {
        toast.error(result.message || 'Ticket is not valid.');
      }
    } catch (err) {
      toast.error(err.message || 'Verification failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleMarkStatus = async (status) => {
    if (!verificationResult?.registration) return;
    setIsUpdating(true);
    try {
      const updated = await attendanceService.markAttendance(
        verificationResult.registration.id,
        status
      );
      toast.success(`Participant marked as ${status.toUpperCase()}.`);
      setVerificationResult((prev) => ({
        ...prev,
        registration: updated,
        isAlreadyCheckedIn: status === 'present',
        message: `Attendance updated to ${status.toUpperCase()}`
      }));
      if (onAttendanceUpdated) {
        onAttendanceUpdated(updated);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update attendance status.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content" style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <QrCode size={22} color="var(--color-primary)" />
              Ticket Verification & Check-In
            </h3>
            <span className="demo-mode-tag" style={{ marginTop: '4px' }}>
              Simulated Scanner Demo
            </span>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '4px' }} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Simulated Scanner / Input Bar */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" htmlFor="ticketCodeInput">
              Enter Ticket Code or Registration ID
            </label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  id="ticketCodeInput"
                  type="text"
                  className="form-input"
                  placeholder="e.g. CC-HCK-2026-8941"
                  value={ticketInput}
                  onChange={(e) => setTicketInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                  autoFocus
                />
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleVerify()}
                disabled={isVerifying}
              >
                {isVerifying ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                Verify
              </button>
            </div>
            <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-navy-500)' }}>Quick fill:</span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'var(--color-slate-100)' }}
                onClick={() => {
                  setTicketInput('CC-HCK-2026-8941');
                  handleVerify('CC-HCK-2026-8941');
                }}
              >
                CC-HCK-2026-8941
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'var(--color-slate-100)' }}
                onClick={() => {
                  setTicketInput('CC-AWS-2026-3190');
                  handleVerify('CC-AWS-2026-3190');
                }}
              >
                CC-AWS-2026-3190
              </button>
            </div>
          </div>

          {/* Verification Results Card */}
          {verificationResult && (
            <div
              style={{
                border: `1px solid ${verificationResult.valid ? 'var(--color-slate-200)' : 'var(--color-danger)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                backgroundColor: verificationResult.valid ? 'var(--color-slate-50)' : 'var(--color-danger-bg)'
              }}
            >
              {verificationResult.valid ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={24} color="var(--color-success)" />
                      <div>
                        <h4 style={{ fontSize: '1rem', color: 'var(--color-navy-950)' }}>
                          {verificationResult.registration.studentName}
                        </h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-navy-600)' }}>
                          {verificationResult.registration.studentRegNo} • {verificationResult.registration.department}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`badge badge-${verificationResult.registration.attendance === 'present' ? 'success' : 'warning'}`}
                    >
                      {verificationResult.registration.attendance?.toUpperCase()}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.85rem', color: 'var(--color-navy-700)', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="var(--color-primary)" />
                      <strong>Event:</strong> {verificationResult.registration.eventTitle}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} color="var(--color-primary)" />
                      <strong>Venue:</strong> {verificationResult.registration.venue}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={14} color="var(--color-primary)" />
                      <strong>Email:</strong> {verificationResult.registration.studentEmail}
                    </div>
                  </div>

                  {/* Attendance Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--color-slate-200)', paddingTop: '1rem' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => handleMarkStatus('present')}
                      disabled={isUpdating || verificationResult.registration.attendance === 'present'}
                    >
                      {verificationResult.registration.attendance === 'present' ? 'Already Checked In' : 'Confirm Check-In (Present)'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleMarkStatus('absent')}
                      disabled={isUpdating || verificationResult.registration.attendance === 'absent'}
                    >
                      Mark Absent
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <AlertCircle size={22} color="var(--color-danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '0.95rem', color: 'var(--color-danger-text)', fontWeight: 700 }}>
                      Invalid Ticket
                    </h4>
                    <p style={{ fontSize: '0.825rem', color: 'var(--color-danger-text)', marginTop: '2px' }}>
                      {verificationResult.message}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Architecture note */}
          <p style={{ fontSize: '0.75rem', color: 'var(--color-navy-500)', marginTop: '1.25rem', fontStyle: 'italic' }}>
            Production Note: In AWS deployment, the QR code scan invokes an authenticated Lambda function (`POST /admin/attendance/verify`) verifying digital signature against DynamoDB.
          </p>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
