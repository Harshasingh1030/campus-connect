import React from 'react';

export function Badge({ children, variant = 'primary', className = '' }) {
  const variantClass = `badge-${variant}`;
  return (
    <span className={`badge ${variantClass} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  switch (status?.toLowerCase()) {
    case 'published':
    case 'confirmed':
    case 'present':
      return <Badge variant="success">{status}</Badge>;
    case 'draft':
    case 'pending':
      return <Badge variant="warning">{status}</Badge>;
    case 'cancelled':
    case 'absent':
      return <Badge variant="danger">{status}</Badge>;
    default:
      return <Badge variant="neutral">{status || 'unknown'}</Badge>;
  }
}
