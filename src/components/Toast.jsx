// src/components/Toast.jsx
import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function Toast({ toasts = [], onDismiss }) {
  if (!toasts.length) return null;

  const icons = {
    success: <CheckCircle2 size={16} color="#4caf7d" />,
    error: <AlertCircle size={16} color="#e05555" />,
    info: <Info size={16} color="#C8D9E6" />,
  };

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type || 'info'}`}>
          {icons[toast.type] || icons.info}
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            className="btn-icon"
            style={{ padding: 2, color: 'rgba(255,255,255,0.7)' }}
            onClick={() => onDismiss(toast.id)}
            aria-label="Close notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
