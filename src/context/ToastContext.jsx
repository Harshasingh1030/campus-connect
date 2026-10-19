import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newToast = { id, type, title, message };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const success = useCallback((message, title = 'Success') => addToast({ type: 'success', title, message }), [addToast]);
  const error = useCallback((message, title = 'Error') => addToast({ type: 'error', title, message, duration: 6000 }), [addToast]);
  const warning = useCallback((message, title = 'Attention') => addToast({ type: 'warning', title, message }), [addToast]);
  const info = useCallback((message, title = 'Information') => addToast({ type: 'info', title, message }), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, warning, info }}>
      {children}
      <div className="toast-container" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} role="alert">
            <div className="toast-icon">
              {t.type === 'success' && <CheckCircle2 size={20} color="var(--color-success)" />}
              {t.type === 'error' && <AlertCircle size={20} color="var(--color-danger)" />}
              {t.type === 'warning' && <AlertTriangle size={20} color="var(--color-warning)" />}
              {t.type === 'info' && <Info size={20} color="var(--color-info)" />}
            </div>
            <div style={{ flex: 1 }}>
              {t.title && <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '2px', color: 'var(--color-navy-900)' }}>{t.title}</div>}
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-navy-600)' }}>{t.message}</div>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              style={{ color: 'var(--color-slate-400)', padding: '2px' }}
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
