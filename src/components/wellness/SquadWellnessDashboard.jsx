import Card from "../Card";

function flaggedReason(row) {
    const reasons = [];
    if (row.sleepQuality <= 2) reasons.push(`Sueño=${row.sleepQuality}`);
    if (row.fatigue <= 2) reasons.push(`Fatiga=${row.fatigue}`);
    if (row.soreness <= 2) reasons.push(`Dolor=${row.soreness}`);
    if (row.stress <= 2) reasons.push(`Estrés=${row.stress}`);
    if (row.mood <= 2) reasons.push(`Ánimo=${row.mood}`);
    return reasons.join(", ");
}

function getTrafficColor(totalScore) {
    if (totalScore <= 14) return 'var(--red)';
    if (totalScore <= 19) return 'var(--yellow)';
    return 'var(--green)';
}

export default function SquadWellnessDashboard({ division, wellnessRows = [], athletesInDivision = [], date }) {

    const todays = wellnessRows.filter(r => r.division === division && r.date === date);

    // Compliance: submissions missing
    const submittedIds = new Set(todays.map(r => r.athleteId));
    const missing = athletesInDivision.filter(a => !submittedIds.has(a.id)); // Using .id as it's the primary key in users

    // Flags: exceptions only
    const flagged = todays
        .filter(r => flaggedReason(r).length > 0)
        .map(r => ({ ...r, reason: flaggedReason(r) }));

    // Squad summary
    const avg = (key) => {
        if (todays.length === 0) return "-";
        const s = todays.reduce((acc, r) => acc + (Number(r[key]) || 0), 0);
        return (s / todays.length).toFixed(1);
    };

    return (
        <div className="container">
            <div className="pagehead" style={{ border: 'none', background: 'var(--bg-dark)', color: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div className="pagehead-sub" style={{ color: 'rgba(255,255,255,0.7)' }}>DASHBOARDS / WELLNESS</div>
                        <h1 className="pagehead-title" style={{ color: '#fff', margin: 0 }}>Wellness — Coach View</h1>
                    </div>
                    <span className="pill" style={{ background: 'rgba(255,255,255,0.2)', border: 'none' }}>{division}</span>
                </div>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
                <Card title="Compliance" subtitle="Submissions status for the current session">
                    <div className="row" style={{ marginBottom: 12 }}>
                        <span className="pill">Today</span>
                        <span className="pill" style={{ background: 'var(--blue)', color: '#fff', border: 'none' }}>Submitted: {todays.length}</span>
                        <span className="pill" style={{ background: missing.length > 0 ? 'var(--red)' : 'var(--green)', color: '#fff', border: 'none' }}>Missing: {missing.length}</span>
                    </div>

                    {missing.length > 0 ? (
                        <div>
                            <div className="small" style={{ marginBottom: 6, fontWeight: 700 }}>PENDING SUBMISSIONS:</div>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                {missing.map(a => <span key={a.id} className="badge" style={{ background: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B' }}>{a.name}</span>)}
                            </div>
                        </div>
                    ) : (
                        <div className="small italic text-muted">All assigned athletes have submitted their wellness data.</div>
                    )}
                </Card>

                <Card title="Alertas del Día (Rojo en alguna métrica)" subtitle="Atletas que reportaron 1 o 2 en algún parámetro hoy">
                    {flagged.length === 0 ? (
                        <div className="small italic text-muted">No se detectaron señales de alerta en esta división hoy.</div>
                    ) : (
                        <div style={{ display: "grid", gap: 8 }}>
                            {flagged.map(r => (
                                <div key={r.id} className="row" style={{ justifyContent: "space-between", padding: '12px', background: '#FFF5F5', borderRadius: '6px', border: '1px solid #FED7D7' }}>
                                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                        {/* Status Light indicating total score */}
                                        <div style={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: getTrafficColor(r.totalScore) }} title={`Total: ${r.totalScore}/25`} />
                                        <div>
                                            <div style={{ fontWeight: 800, color: 'var(--gray-900)', display: "flex", alignItems: "center", gap: 8 }}>
                                                {r.athleteName}
                                                <span className="badge small" style={{ fontWeight: 600, backgroundColor: "white", border: "1px solid #e5e7eb", color: "#6b7280" }}>Total: {r.totalScore}</span>
                                            </div>
                                            <div className="small" style={{ opacity: 0.8, color: "var(--red)", marginTop: 2, fontWeight: 500 }}>
                                                Alerta: {r.reason}
                                            </div>
                                        </div>
                                    </div>
                                    <button className="btn small primary" style={{ background: 'var(--red)' }}>TRIAGE</button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <Card title="Squad Summary" subtitle="Promedios del equipo para la sesión actual">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '20px' }}>
                        <div>
                            <div className="small" style={{ fontWeight: 800 }}>PROMEDIO TOTAL</div>
                            <div className="kpi" style={{ fontSize: '28px', color: getTrafficColor(avg("totalScore")) }}>{avg("totalScore")}</div>
                        </div>
                        <div>
                            <div className="small" style={{ fontWeight: 800 }}>CALIDAD SUEÑO</div>
                            <div className="kpi" style={{ fontSize: '28px' }}>{avg("sleepQuality")}</div>
                        </div>
                        <div>
                            <div className="small" style={{ fontWeight: 800 }}>FATIGA</div>
                            <div className="kpi" style={{ fontSize: '28px' }}>{avg("fatigue")}</div>
                        </div>
                        <div>
                            <div className="small" style={{ fontWeight: 800 }}>DOLOR</div>
                            <div className="kpi" style={{ fontSize: '28px' }}>{avg("soreness")}</div>
                        </div>
                        <div>
                            <div className="small" style={{ fontWeight: 800 }}>ESTRÉS</div>
                            <div className="kpi" style={{ fontSize: '28px' }}>{avg("stress")}</div>
                        </div>
                        <div>
                            <div className="small" style={{ fontWeight: 800 }}>Ánimo</div>
                            <div className="kpi" style={{ fontSize: '28px' }}>{avg("mood")}</div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
