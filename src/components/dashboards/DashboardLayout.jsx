import React from 'react';

export default function DashboardLayout({ title, subtitle, date, onDateChange, children, division }) {
    return (
        <div className="container" style={{ paddingBottom: 60 }}>
            {/* Header */}
            <div className="pagehead" style={{ border: 'none', background: 'var(--bg-dark)', color: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                <div className="pagehead-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div className="pagehead-sub" style={{ opacity: 0.7 }}>DASHBOARD / {division}</div>
                        <div className="pagehead-title" style={{ color: '#fff' }}>{title}</div>
                        <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>{subtitle}</div>
                    </div>
                    <div className="row" style={{ gap: 12 }}>
                        <input
                            type="date"
                            className="input"
                            value={date}
                            onChange={(e) => onDateChange(e.target.value)}
                            style={{
                                background: 'rgba(255,255,255,0.1)',
                                color: '#fff',
                                border: 'none',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Content Content - Grid or Column */}
            <div style={{ display: 'grid', gap: 24 }}>
                {children}
            </div>
        </div>
    );
}
