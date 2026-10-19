import React, { useRef } from 'react';
import { X, Printer, Download, Calendar, MapPin, User, Hash, AlertCircle, ShieldCheck } from 'lucide-react';

export function RegistrationTicketModal({ isOpen, onClose, registration }) {
  const ticketRef = useRef(null);

  if (!isOpen || !registration) return null;

  const handlePrint = () => {
    window.print();
  };

  // Generate a deterministic SVG mock QR code grid based on ticketCode
  const generateQrPattern = (code = 'CC-DEMO-2026') => {
    const size = 9;
    const cells = [];
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      hash = (hash << 5) - hash + code.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // Corners: make standard QR position markers
        const isCorner =
          (r < 3 && c < 3) ||
          (r < 3 && c >= size - 3) ||
          (r >= size - 3 && c < 3);

        if (isCorner) {
          cells.push(true);
        } else {
          // pseudo-random deterministic fill
          const val = Math.sin((r * size + c + hash) * 12.9898) * 43758.5453;
          cells.push((val - Math.floor(val)) > 0.45);
        }
      }
    }
    return { size, cells };
  };

  const { size, cells } = generateQrPattern(registration.ticketCode || registration.id);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content" style={{ maxWidth: '580px', overflow: 'hidden' }}>
        <div className="modal-header no-print">
          <div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-navy-900)' }}>Digital Event Pass</h3>
            <span className="demo-mode-tag" style={{ marginTop: '4px' }}>
              Simulated Demo Ticket
            </span>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '6px' }} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Ticket Container */}
        <div className="modal-body" style={{ padding: '1.5rem', background: '#f8fafc' }}>
          <div
            ref={ticketRef}
            className="printable-ticket"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              border: '1px solid var(--color-slate-200)',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)'
            }}
          >
            {/* Header Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
                color: '#ffffff',
                padding: '1.5rem 1.75rem',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#4338ca',
                        fontWeight: 800,
                        fontSize: '14px'
                      }}
                    >
                      C
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#c7d2fe' }}>
                      CampusConnect
                    </span>
                  </div>
                  <h2 style={{ fontSize: '1.35rem', color: '#ffffff', fontWeight: 800, lineHeight: 1.25 }}>
                    {registration.eventTitle}
                  </h2>
                </div>
                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.18)',
                    color: '#ffffff',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}
                >
                  {registration.status}
                </span>
              </div>
            </div>

            {/* Ticket Body */}
            <div style={{ padding: '1.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '1.5rem' }}>
                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-navy-500)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Attendee Name
                    </span>
                    <p style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-navy-900)' }}>
                      {registration.studentName}
                    </p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-navy-600)' }}>
                      ID: {registration.studentRegNo || 'N/A'} • {registration.department || 'Undergraduate'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-navy-500)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Event Date
                      </span>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-navy-800)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} color="var(--color-primary)" />
                        {registration.eventDate}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-navy-500)', textTransform: 'uppercase', fontWeight: 600 }}>
                        Attendance
                      </span>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: registration.attendance === 'present' ? 'var(--color-success)' : 'var(--color-navy-800)' }}>
                        {registration.attendance?.toUpperCase() || 'PENDING'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-navy-500)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Venue
                    </span>
                    <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-navy-700)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} color="var(--color-primary)" />
                      {registration.venue || 'Campus Main Auditorium'}
                    </p>
                  </div>
                </div>

                {/* Simulated QR Code */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div
                    style={{
                      border: '2px dashed var(--color-slate-300)',
                      padding: '8px',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff'
                    }}
                  >
                    <svg width="110" height="110" viewBox={`0 0 ${size} ${size}`} style={{ shapeRendering: 'crispEdges' }}>
                      {cells.map((filled, idx) => {
                        const r = Math.floor(idx / size);
                        const c = idx % size;
                        return filled ? (
                          <rect key={idx} x={c} y={r} width="1" height="1" fill="#0f172a" />
                        ) : null;
                      })}
                    </svg>
                  </div>
                  <div style={{ marginTop: '6px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-navy-800)' }}>
                      {registration.ticketCode || registration.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tear-off / Disclaimer */}
              <div
                style={{
                  marginTop: '1.5rem',
                  paddingTop: '1rem',
                  borderTop: '1px dashed var(--color-slate-300)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--color-navy-500)',
                  fontSize: '0.725rem'
                }}
              >
                <ShieldCheck size={16} color="var(--color-primary)" />
                <span>
                  Demo Pass: In production, verified cryptographically via AWS Lambda against DynamoDB registration records.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="modal-footer no-print">
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            Close
          </button>
          <button type="button" onClick={handlePrint} className="btn btn-primary btn-sm">
            <Printer size={16} />
            Print / Save as PDF
          </button>
        </div>
      </div>
    </div>
  );
}
