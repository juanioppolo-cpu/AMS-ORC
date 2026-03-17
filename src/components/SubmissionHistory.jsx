import React from 'react';

const CATEGORY_MAP = {
    'wellness': { templateId: 'ft_wellness', title: 'Historial de Wellness' },
    'nutrition': { templateId: 'ft_nutrition_anthro', title: 'Historial de Nutrición' },
    'strength': { templateId: 'ft_pf_strength', title: 'Historial de Fuerza' }
};

export default function SubmissionHistory({ athleteId, categoryKey, submissions, users, onEdit, onBack }) {
    const config = CATEGORY_MAP[categoryKey];
    const athlete = users.find(u => u.id === athleteId || u.athleteId === athleteId);

    // Sort submissions descending by date
    const filteredSubs = submissions.filter(s =>
        (s.subjectId === athleteId || s.athleteId === athleteId || s.userId === athleteId) &&
        s.templateId === config.templateId
    ).sort((a, b) => new Date(b.date) - new Date(a.date));

    return (
        <div className="container p-4">
            <div className="pagehead" style={{ marginBottom: 24, borderRadius: 12, overflow: 'hidden' }}>
                <div className="pagehead-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                        <button className="btn small secondary" style={{ padding: '6px 12px' }} onClick={onBack}>← Volver</button>
                        <div>
                            <div className="pagehead-sub">{athlete?.name}</div>
                            <div className="pagehead-title">{config?.title}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    {filteredSubs.length === 0 ? (
                        <div style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>No hay registros disponibles.</div>
                    ) : (
                        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                            {filteredSubs.map(s => (
                                <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #f1f5f9' }}>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#1e293b' }}>Registro del {s.date}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Creado: {new Date(s.createdAt).toLocaleString()}</div>
                                    </div>
                                    <button className="btn small primary" onClick={() => onEdit(s.id)}>Editar</button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
