import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { calculateAnthropometrics } from '../../utils/anthropometricCalcs';

// Example generic placeholder for an athlete photo or an image if photoUrl is provided
const PlaceholderAvatar = ({ name, photoUrl, size = 120 }) => {
    if (photoUrl) {
        return (
            <img
                src={photoUrl}
                alt={`Photo of ${name}`}
                style={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    margin: '0 auto',
                    border: '4px solid white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    display: 'block'
                }}
            />
        );
    }
    return (
        <div style={{
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: size * 0.4,
            fontWeight: 'bold',
            color: '#64748b',
            margin: '0 auto',
            border: '4px solid white',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
            {name ? name.charAt(0).toUpperCase() : '?'}
        </div>
    );
};

export default function AthleteProfileDashboard({ athleteId, users, submissions, athletesInDivision, onAthleteSelect }) {
    const athlete = useMemo(() => users.find(u => u.id === athleteId), [users, athleteId]);

    const profileData = useMemo(() => {
        if (!athleteId || !submissions) return {};

        const athleteSubs = submissions.filter(s => {
            const matchId = s.userId === athleteId || s.athleteId === athleteId || s.subjectId === athleteId;
            if (matchId) return true;
            if (athlete?.athleteId) {
                return s.userId === athlete.athleteId || s.athleteId === athlete.athleteId || s.subjectId === athlete.athleteId;
            }
            return false;
        });

        // Helper to get latest by template
        const getLatest = (templateId) => {
            const subs = athleteSubs.filter(s => s.templateId === templateId);
            if (!subs.length) return null;
            return subs.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
        };

        const wellness = getLatest('ft_wellness');
        const medical = getLatest('ft_medical_eval');
        const nutritionRaw = getLatest('ft_nutrition_anthro');

        // Physical is split into 3 templates: strength, jumps, field
        const physicalStrength = getLatest('ft_pf_strength');
        const physicalJumps = getLatest('ft_pf_jumps');
        const physicalField = getLatest('ft_pf_field');

        const physical = (physicalStrength || physicalJumps || physicalField) ? {
            date: physicalStrength?.date || physicalJumps?.date || physicalField?.date,
            data: {
                ...physicalStrength?.values,
                ...physicalJumps?.values,
                ...physicalField?.values
            }
        } : null;

        // --- Medical Calculations ---
        const allMedical = athleteSubs.filter(s => s.templateId === 'ft_medical_eval').sort((a, b) => new Date(a.date) - new Date(b.date));

        let lesionCount = 0;
        let daysLost = 0;
        const injuriesByZone = {};

        // Simple estimation of days lost by tracking "Injured" periods
        let currentInjuryStart = null;

        allMedical.forEach((sub, idx) => {
            // Count unique reported injuries
            if (sub.values?.injuryType) {
                lesionCount++;
                const zone = sub.values.zone || 'Desconocida';
                injuriesByZone[zone] = (injuriesByZone[zone] || 0) + 1;
            }

            // Estimate days lost
            const status = sub.data?.status;
            if (status === 'Injured' && !currentInjuryStart) {
                currentInjuryStart = new Date(sub.date);
            } else if (status === 'Cleared' && currentInjuryStart) {
                const clearDate = new Date(sub.date);
                const diffTime = Math.abs(clearDate - currentInjuryStart);
                daysLost += Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                currentInjuryStart = null;
            }
        });

        // If currently injured, calculate days lost until today
        if (currentInjuryStart) {
            const diffTime = Math.abs(new Date() - currentInjuryStart);
            daysLost += Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }

        const medicalStats = {
            latest: medical,
            lesionCount,
            daysLost,
            injuriesByZone
        };

        // --- Manager Attendance Calculations ---
        const attendanceSubs = athleteSubs.filter(s => s.templateId === 'ft_manager_attendance');
        let totalSessions = 0;
        let presentCount = 0;

        attendanceSubs.forEach(sub => {
            const status = sub.values?.status;
            // Depending on logic, Tarde is usually present. Let's count Presente and Tarde as attended.
            if (status) {
                totalSessions++;
                if (status === 'Presente' || status === 'Tarde') {
                    presentCount++;
                }
            }
        });

        const attendancePct = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : null;

        // --- Wellness Trend (Last 7 Days) ---
        const allWellness = athleteSubs
            .filter(s => s.templateId === 'ft_wellness')
            .sort((a, b) => new Date(a.date) - new Date(b.date)); // Oldest to newest

        // Take last 7
        const wellnessHistory = allWellness.slice(-7).map(w => {
            const sq = Number(w.values?.sleepQuality ?? 0);
            const fa = Number(w.values?.fatigue ?? 0);
            const so = Number(w.values?.soreness ?? 0);
            const st = Number(w.values?.stress ?? 0);
            const mo = Number(w.values?.mood ?? 0);
            const score = sq + fa + so + st + mo;
            return {
                date: w.date.substring(5), // Keep MM-DD for chart X-Axis
                score: score
            };
        });

        // Extend the latest wellness to include the total score for the UI
        let latestWellnessExt = null;
        if (wellness && wellness.values) {
            const sq = Number(wellness.values.sleepQuality ?? 0);
            const fa = Number(wellness.values.fatigue ?? 0);
            const so = Number(wellness.values.soreness ?? 0);
            const st = Number(wellness.values.stress ?? 0);
            const mo = Number(wellness.values.mood ?? 0);
            latestWellnessExt = {
                ...wellness,
                totalScore: sq + fa + so + st + mo,
                metrics: { sleepQuality: sq, fatigue: fa, soreness: so, stress: st, mood: mo }
            };
        }

        // --- Nutrition Calculations ---
        let nutrition = null;
        if (nutritionRaw && nutritionRaw.values) {
            try {
                // Ensure gender is injected for the equation, athletes default to Hombre if missing
                const calcValues = { ...nutritionRaw.values, genero: athlete.genero || 'Hombre', edad: athlete.edad || 20 };
                const calcResult = calculateAnthropometrics(calcValues);

                nutrition = {
                    date: nutritionRaw.date,
                    peso: nutritionRaw.values.pesoBrutoKg,
                    talla: nutritionRaw.values.tallaCm,
                    sum6: calcResult.suma6Pliegues?.toFixed(1) || '-',
                    masaMuscular: calcResult.masaMuscularKg?.toFixed(1) || '-',
                    masaAdiposa: calcResult.masaAdiposaKg?.toFixed(1) || '-',
                    imo: calcResult.indicesMuscOseo?.toFixed(2) || '-'
                };
            } catch (e) {
                console.error("Failed anthropometric calcs", e);
                // Fallback basic
                nutrition = {
                    date: nutritionRaw.date,
                    peso: nutritionRaw.values.pesoBrutoKg,
                    talla: nutritionRaw.values.tallaCm,
                    sum6: '-', masaMuscular: '-', masaAdiposa: '-', imo: '-'
                };
            }
        }

        return {
            wellness: latestWellnessExt,
            wellnessTrend: wellnessHistory,
            medical: medicalStats,
            physical,
            nutrition,
            attendance: { pct: attendancePct, total: totalSessions }
        };
    }, [athleteId, submissions, athlete]);

    if (!athlete) {
        return <div className="container p-4">Atleta no encontrado.</div>;
    }

    const { wellness, wellnessTrend, medical, physical, nutrition, attendance } = profileData;

    return (
        <div className="container p-4">
            <div className="pagehead" style={{ marginBottom: 24, borderRadius: 12, overflow: 'hidden' }}>
                <div className="pagehead-inner">
                    <div>
                        <div className="pagehead-sub">PERFIL 360</div>
                        <div className="pagehead-title" style={{ display: 'flex', alignItems: 'center' }}>
                            {athletesInDivision && onAthleteSelect ? (
                                <select
                                    value={athlete.id}
                                    onChange={(e) => onAthleteSelect(e.target.value)}
                                    style={{
                                        background: 'transparent',
                                        color: 'white',
                                        border: 'none',
                                        borderBottom: '2px solid rgba(255,255,255,0.4)',
                                        borderRadius: 0,
                                        padding: '0 0 4px 0',
                                        outline: 'none',
                                        cursor: 'pointer',
                                        fontSize: '1.5rem',
                                        fontWeight: 'bold',
                                        appearance: 'none'
                                    }}
                                >
                                    {athletesInDivision.map(a => <option key={a.id} value={a.id} style={{ color: 'black' }}>{a.name}</option>)}
                                </select>
                            ) : (
                                athlete.name
                            )}
                            {athletesInDivision && onAthleteSelect && (
                                <span style={{ fontSize: '1rem', marginLeft: 8, opacity: 0.7 }}>▼</span>
                            )}
                        </div>
                    </div>
                    <span className="pill">{athlete.divisions?.[0] || 'Unknown'}</span>
                </div>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: 20,
                alignItems: 'start'
            }}>
                {/* 1. Perfil Personal */}
                <div className="card" style={{ gridRow: 'span 2' }}>
                    <div className="card-body" style={{ textAlign: 'center', padding: '32px 20px' }}>
                        <PlaceholderAvatar name={athlete.name} photoUrl={athlete.photoUrl} />
                        <h2 style={{ marginTop: 16, fontSize: '1.4rem', fontWeight: 700, color: '#1e293b' }}>{athlete.name}</h2>
                        <div style={{ color: '#64748b', marginBottom: 24 }}>{athlete.role}</div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, textAlign: 'left', marginTop: 16 }}>
                            <div style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 8 }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>EDAD</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 500, color: '#334155' }}>{athlete.edad || 20} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>años</span></div>
                            </div>
                            <div style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 8 }}>
                                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>POSICIÓN</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 500, color: '#334155' }}>{athlete.puesto || 'Jugador'}</div>
                            </div>
                            {attendance.total > 0 && (
                                <div style={{ gridColumn: 'span 2', padding: 12, backgroundColor: '#f0fdf4', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #bbf7d0' }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>ASISTENCIA ENTRENAMIENTOS</div>
                                        <div style={{ fontSize: '0.8rem', color: '#15803d' }}>Basado en {attendance.total} sesiones</div>
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#16a34a' }}>
                                        {attendance.pct}%
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. Estado Médico e Historial */}
                <div className="card">
                    <div className="card-body">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <span style={{ fontSize: '1.5rem' }}>🩺</span>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Médico e Historial</h3>
                        </div>
                        {medical?.latest ? (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                    <div style={{
                                        display: 'inline-block',
                                        padding: '4px 12px',
                                        borderRadius: 999,
                                        fontSize: '0.85rem',
                                        fontWeight: 600,
                                        backgroundColor: medical.latest.data.status === 'Injured' ? '#fecaca' : '#dcfce3',
                                        color: medical.latest.data.status === 'Injured' ? '#dc2626' : '#16a34a',
                                    }}>
                                        {medical.latest.data.status === 'Injured' ? 'Lesionado' : 'Apto'}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                        Último: {medical.latest.date}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                    <div style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 8 }}>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>CANT. LESIONES</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#dc2626' }}>{medical.lesionCount}</div>
                                    </div>
                                    <div style={{ padding: 12, backgroundColor: '#f8fafc', borderRadius: 8 }}>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>DÍAS PERDIDOS</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#ea580c' }}>{medical.daysLost} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#94a3b8' }}>días</span></div>
                                    </div>
                                </div>

                                {Object.keys(medical.injuriesByZone).length > 0 && (
                                    <div style={{ marginBottom: 12 }}>
                                        <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, marginBottom: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 4 }}>LESIONES POR ZONA</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                            {Object.entries(medical.injuriesByZone).map(([zone, count]) => (
                                                <div key={zone} style={{ padding: '2px 8px', backgroundColor: '#f1f5f9', borderRadius: 4, fontSize: '0.8rem', color: '#475569' }}>
                                                    <strong>{zone}:</strong> {count}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {medical.latest.data.status === 'Injured' && medical.latest.values && (
                                    <div style={{ padding: 12, backgroundColor: '#fdf2f8', borderRadius: 8 }}>
                                        <div style={{ fontSize: '0.8rem', color: '#be185d', fontWeight: 600, marginBottom: 4 }}>LESIÓN ACTUAL</div>
                                        <div style={{ fontSize: '0.95rem', color: '#831843', fontWeight: 500 }}>{medical.latest.values.diagnosis}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#9d174d', marginTop: 4 }}>
                                            📍 {medical.latest.values.zone} {medical.latest.values.hemisphere}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Sin registros médicos o historial.</div>
                        )}
                    </div>
                </div>

                {/* 3. Wellness */}
                <div className="card">
                    <div className="card-body">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <span style={{ fontSize: '1.5rem' }}>🧘</span>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Wellness Diario</h3>
                        </div>
                        {wellness ? (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: wellness.totalScore <= 14 ? '#ef4444' : wellness.totalScore <= 19 ? '#f97316' : '#10b981', lineHeight: 1 }}>
                                        {wellness.totalScore || '-'} <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 500 }}>/ 25</span>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                        {wellness.date}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px', marginTop: 16, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>SUEÑO</span>
                                            <span style={{ fontWeight: 600, color: wellness.metrics.sleepQuality <= 2 ? '#ef4444' : '#334155' }}>{wellness.metrics.sleepQuality}/5</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>FATIGA</span>
                                            <span style={{ fontWeight: 600, color: wellness.metrics.fatigue <= 2 ? '#ef4444' : '#334155' }}>{wellness.metrics.fatigue}/5</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>DOLOR</span>
                                            <span style={{ fontWeight: 600, color: wellness.metrics.soreness <= 2 ? '#ef4444' : '#334155' }}>{wellness.metrics.soreness}/5</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>ESTRÉS</span>
                                            <span style={{ fontWeight: 600, color: wellness.metrics.stress <= 2 ? '#ef4444' : '#334155' }}>{wellness.metrics.stress}/5</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>ÁNIMO</span>
                                            <span style={{ fontWeight: 600, color: wellness.metrics.mood <= 2 ? '#ef4444' : '#334155' }}>{wellness.metrics.mood}/5</span>
                                        </div>
                                    </div>
                                    {/* 7-Day Trend Chart */}
                                    {wellnessTrend && wellnessTrend.length > 1 && (
                                        <div style={{ marginTop: 24, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                                            <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, marginBottom: 12 }}>TENDENCIA 7 DÍAS</div>
                                            <div style={{ height: 160, width: '100%', marginLeft: -16 }}>
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={wellnessTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                                        <YAxis domain={[0, 25]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={30} />
                                                        <Tooltip
                                                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                                            labelStyle={{ fontWeight: 'bold', color: '#334155' }}
                                                        />
                                                        <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Sin registros de wellness recientes.</div>
                        )}
                    </div>
                </div>
                <div className="card">
                    <div className="card-body">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <span style={{ fontSize: '1.5rem' }}>🏋️</span>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Preparación Física</h3>
                        </div>
                        {physical ? (
                            <div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 16 }}>
                                    Última evaluación: {physical.date}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    {/* Sub-section: Fuerza */}
                                    <div style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 8 }}>
                                        <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, marginBottom: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 4 }}>FUERZA</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Sentadilla</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{physical.data.sentadillasKg || '-'} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#94a3b8' }}>kg</span></span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Press Plano</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{physical.data.pressPlanoKg || '-'} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#94a3b8' }}>kg</span></span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Peso Muerto</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{physical.data.pesoMuertoKg || '-'} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#94a3b8' }}>kg</span></span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Dominadas</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{physical.data.dominadasKg || '-'} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#94a3b8' }}>kg</span></span>
                                        </div>
                                    </div>

                                    {/* Sub-section: Campo */}
                                    <div style={{ backgroundColor: '#f8fafc', padding: 12, borderRadius: 8 }}>
                                        <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, marginBottom: 8, borderBottom: '1px solid #e2e8f0', paddingBottom: 4 }}>CAMPO</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Bronco</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{physical.data.broncoSec || '-'} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#94a3b8' }}>s</span></span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Yo-Yo IR1</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{physical.data.yoyoIR1 || '-'}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Velocidad Máxima</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>{physical.data.velocidad10mSec || '-'} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#94a3b8' }}>s</span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Sin registros estadísticos físicos.</div>
                        )}
                    </div>
                </div>

                {/* 5. Nutrición (Antropometría) */}
                <div className="card">
                    <div className="card-body">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <span style={{ fontSize: '1.5rem' }}>🥗</span>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Nutrición (Antropometría)</h3>
                        </div>
                        {nutrition ? (
                            <div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 16 }}>
                                    Control del {nutrition.date}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
                                    <div style={{ padding: 12, border: '1px solid #e2e8f0', borderRadius: 8, textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: 4 }}>PESO</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#334155' }}>
                                            {nutrition.peso || '-'} <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>kg</span>
                                        </div>
                                    </div>
                                    <div style={{ padding: 12, border: '1px solid #e2e8f0', borderRadius: 8, textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: 4 }}>ESTATURA</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#334155' }}>
                                            {nutrition.talla || '-'} <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>cm</span>
                                        </div>
                                    </div>
                                    <div style={{ padding: 12, border: '1px solid #e2e8f0', borderRadius: 8, textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: 4 }}>PLIEGUES (Σ6)</div>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#334155' }}>
                                            {nutrition.sum6} <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>mm</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 8 }}>
                                    <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, marginBottom: 12, borderBottom: '1px solid #e2e8f0', paddingBottom: 4 }}>COMPOSICIÓN CORPORAL</div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Masa Adiposa</span>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#eab308' }}>{nutrition.masaAdiposa} <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 400 }}>kg</span></span>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>Masa Muscular</span>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#ef4444' }}>{nutrition.masaMuscular} <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 400 }}>kg</span></span>
                                    </div>

                                    <div style={{ height: 1, backgroundColor: '#e2e8f0', margin: '8px 0' }} />

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Índice Músculo-Óseo (IMO)</span>
                                        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3b82f6', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: 4 }}>{nutrition.imo}</span>
                                    </div>
                                </div>

                            </div>
                        ) : (
                            <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Sin registros nutricionales recientes.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
