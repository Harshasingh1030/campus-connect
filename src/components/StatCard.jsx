import React from 'react';

export function StatCard({ title, value, subtitle, icon: Icon, iconBg = 'var(--color-primary-light)', iconColor = 'var(--color-primary)' }) {
  return (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-navy-500)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
          {title}
        </p>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-navy-950)', lineHeight: 1.1 }}>
          {value}
        </div>
        {subtitle && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-navy-500)', marginTop: '0.45rem' }}>
            {subtitle}
          </p>
        )}
      </div>
      {Icon && (
        <div
          style={{
            width: '46px',
            height: '46px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: iconBg,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Icon size={24} />
        </div>
      )}
    </div>
  );
}
