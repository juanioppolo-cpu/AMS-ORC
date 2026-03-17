import React, { useState } from 'react';

export default function Sidebar({ isOpen, onClose, division, divisionsAllowed, onDivisionChange, users, formSubmissions = [], onViewCategory }) {
    const [expandedAthleteId, setExpandedAthleteId] = useState(null);

    if (!isOpen) return null;

    const showDivisionSelect = divisionsAllowed?.length > 1;
    const athletesInDivision = users.filter(u => u.role === "Athlete" && (u.divisions ?? []).includes(division));

    const toggleAthlete = (e, athleteId) => {
        e.stopPropagation();
        setExpandedAthleteId(expandedAthleteId === athleteId ? null : athleteId);
    };

    const getAthleteStats = (athleteId) => {
        const subs = formSubmissions.filter(s => s.subjectId === athleteId || s.athleteId === athleteId || s.userId === athleteId);
        return {
            wellness: subs.filter(s => s.templateId === "ft_wellness").length,
            nutrition: subs.filter(s => s.templateId === "ft_nutrition_anthro").length,
            strength: subs.filter(s => s.templateId === "ft_pf_strength").length,
        };
    };

    return (
        <>
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 998,
                }}
                onClick={onClose}
            />
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: 280,
                    height: '100vh',
                    backgroundColor: 'white',
                    boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
                    zIndex: 999,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease',
                    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)'
                }}
            >
                <div style={{ padding: 20, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>Equipos</h2>
                    <button className="btn icon-only" style={{ color: '#64748b' }} onClick={onClose}>✕</button>
                </div>

                {showDivisionSelect && (
                    <div style={{ padding: 20, borderBottom: '1px solid #eee' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: 8, fontWeight: 600 }}>DIVISIÓN</label>
                        <select
                            className="select"
                            style={{ width: '100%' }}
                            value={division}
                            onChange={(e) => onDivisionChange(e.target.value)}
                        >
                            {divisionsAllowed.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                )}

                <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: 12, fontWeight: 600 }}>ROSTER ({athletesInDivision.length})</label>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {athletesInDivision.map(athlete => {
                            const isExpanded = expandedAthleteId === athlete.id;
                            const stats = isExpanded ? getAthleteStats(athlete.id) : null;

                            return (
                                <React.Fragment key={athlete.id}>
                                    <li
                                        style={{
                                            padding: '12px 16px',
                                            borderBottom: isExpanded ? 'none' : '1px solid #f1f5f9',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 12,
                                            cursor: 'pointer',
                                            transition: 'background-color 0.2s',
                                            margin: '0 -20px',
                                            backgroundColor: isExpanded ? '#f8fafc' : 'transparent'
                                        }}
                                        onClick={(e) => toggleAthlete(e, athlete.id)}
                                    >
                                        <div style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: '50%',
                                            backgroundColor: '#e2e8f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 600,
                                            color: '#64748b',
                                            fontSize: '0.9rem'
                                        }}>
                                            {athlete.name.charAt(0)}
                                        </div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{ fontWeight: 500, color: '#334155', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{athlete.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{athlete.role || 'Athlete'}</div>
                                        </div>
                                        <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                                            {isExpanded ? '▲' : '▼'}
                                        </div>
                                    </li>

                                    {isExpanded && (
                                        <div style={{
                                            backgroundColor: '#f8fafc',
                                            padding: '0 16px 12px 16px',
                                            margin: '0 -20px',
                                            borderBottom: '1px solid #f1f5f9',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 6
                                        }}>
                                            <button
                                                className="btn small"
                                                style={{ justifyContent: 'space-between', padding: '6px 12px', background: 'white', border: '1px solid #e2e8f0', color: '#475569' }}
                                                onClick={() => { onClose(); onViewCategory(athlete.id, 'wellness'); }}
                                            >
                                                <span>🧘 Wellness</span>
                                                <span style={{ fontWeight: 600, color: '#0ea5e9' }}>{stats.wellness}</span>
                                            </button>
                                            <button
                                                className="btn small"
                                                style={{ justifyContent: 'space-between', padding: '6px 12px', background: 'white', border: '1px solid #e2e8f0', color: '#475569' }}
                                                onClick={() => { onClose(); onViewCategory(athlete.id, 'nutrition'); }}
                                            >
                                                <span>🥗 Nutrición</span>
                                                <span style={{ fontWeight: 600, color: '#f59e0b' }}>{stats.nutrition}</span>
                                            </button>
                                            <button
                                                className="btn small"
                                                style={{ justifyContent: 'space-between', padding: '6px 12px', background: 'white', border: '1px solid #e2e8f0', color: '#475569' }}
                                                onClick={() => { onClose(); onViewCategory(athlete.id, 'strength'); }}
                                            >
                                                <span>🏋️ Fuerza</span>
                                                <span style={{ fontWeight: 600, color: '#3b82f6' }}>{stats.strength}</span>
                                            </button>
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                        {athletesInDivision.length === 0 && (
                            <li style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '20px 0' }}>
                                No hay atletas en esta división.
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </>
    );
}
