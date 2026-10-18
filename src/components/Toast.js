'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      pointerEvents: 'none'
    }}>
      {toasts.map(t => {
        const isSuccess = t.type === 'success';
        const isError = t.type === 'error';
        const borderColor = isSuccess ? 'rgba(16, 185, 129, 0.4)' : isError ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)';
        const bgColor = isSuccess ? 'rgba(6, 78, 59, 0.95)' : isError ? 'rgba(127, 29, 29, 0.95)' : 'rgba(45, 29, 14, 0.95)';

        return (
          <div
            key={t.id}
            className="animate-scale-up"
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 18px',
              borderRadius: '12px',
              background: bgColor,
              border: `1px solid ${borderColor}`,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(12px)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 500,
              minWidth: '280px',
              maxWidth: '400px'
            }}
          >
            {isSuccess && <CheckCircle2 size={18} color="#34d399" />}
            {isError && <AlertCircle size={18} color="#f87171" />}
            {!isSuccess && !isError && <Info size={18} color="#fbbf24" />}
            
            <div style={{ flex: 1, lineHeight: 1.4 }}>{t.message}</div>

            <button
              onClick={() => onDismiss(t.id)}
              style={{
                background: 'transparent',
                color: 'rgba(255, 255, 255, 0.6)',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
