import Card from "../Card";

export default function DashManagerAttendance({ division, date, submissions, athletesInDivision }) {
    const rows = submissions.filter(s =>
        s.templateId === "ft_manager_attendance" &&
        s.division === division &&
        s.date === date
    );

    const byAthlete = new Map(rows.map(r => [r.subjectId, r]));
    const missing = athletesInDivision.filter(a => !byAthlete.has(a.athleteId));

    const statusCounts = { Presente: 0, Ausente: 0, Tarde: 0, Lesionado: 0, Enfermo: 0, Permiso: 0 };
    for (const r of rows) {
        const st = r.values?.status;
        if (statusCounts[st] !== undefined) statusCounts[st] += 1;
    }

    const exceptions = rows.filter(r => ["Ausente", "Tarde", "Lesionado", "Enfermo", "Permiso"].includes(r.values?.status));

    return (
        <div className="container">
            <div style={{ display: "grid", gap: 12 }}>
                <Card title="Compliance" subtitle={`Asistencia cargada para ${date}`}>
                    <div className="row">
                        <span className="pill">Submitted: {rows.length}</span>
                        <span className="pill">Missing: {missing.length}</span>
                    </div>
                    {missing.length > 0 && (
                        <div style={{ marginTop: 10 }}>
                            <div className="small">Missing entries:</div>
                            <div className="row" style={{ marginTop: 6 }}>
                                {missing.map(a => <span key={a.athleteId} className="badge yellow">{a.name}</span>)}
                            </div>
                        </div>
                    )}
                </Card>

                <Card title="Exceptions / Triage" subtitle="Solo casos a revisar">
                    {exceptions.length === 0 ? (
                        <div className="small">No exceptions.</div>
                    ) : (
                        <div style={{ display: "grid", gap: 8 }}>
                            {exceptions.map(r => (
                                <div key={r.id} className="row" style={{ justifyContent: "space-between" }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{athletesInDivision.find(a => a.athleteId === r.subjectId)?.name ?? "Athlete"}</div>
                                        <div className="small">{r.values?.status}{r.values?.reason ? ` — ${r.values.reason}` : ""}</div>
                                    </div>
                                    <span className="badge red">REVIEW</span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <Card title="Snapshot" subtitle="Conteos rápidos">
                    <div className="row" style={{ gap: 18 }}>
                        {Object.entries(statusCounts).map(([k, v]) => (
                            <span key={k} className="pill">{k}: {v}</span>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
