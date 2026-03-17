import Card from "../Card";

export default function DashPFStrength({ division, date, submissions, athletesInDivision }) {
    const rows = submissions.filter(s => s.templateId === "ft_pf_strength" && s.division === division);

    // última por atleta (hasta la fecha seleccionada)
    const lastByAthlete = new Map();
    for (const r of rows) {
        if (r.date > date) continue;
        const prev = lastByAthlete.get(r.subjectId);
        if (!prev || r.date > prev.date) lastByAthlete.set(r.subjectId, r);
    }

    const kpiAvg = (key) => {
        const arr = Array.from(lastByAthlete.values());
        if (!arr.length) return "-";
        const s = arr.reduce((acc, r) => acc + Number(r.values?.[key] ?? 0), 0);
        return (s / arr.length).toFixed(1);
    };

    const missing = athletesInDivision.filter(a => !lastByAthlete.has(a.athleteId));

    return (
        <div className="container">
            <div style={{ display: "grid", gap: 12 }}>
                <Card title="Coverage" subtitle={`Última carga hasta ${date}`}>
                    <div className="row">
                        <span className="pill">With data: {lastByAthlete.size}</span>
                        <span className="pill">Missing: {missing.length}</span>
                    </div>
                    {missing.length > 0 && (
                        <div style={{ marginTop: 10 }}>
                            <div className="small">Missing athletes:</div>
                            <div className="row" style={{ marginTop: 6 }}>
                                {missing.map(a => <span key={a.athleteId} className="badge yellow">{a.name}</span>)}
                            </div>
                        </div>
                    )}
                </Card>

                <Card title="Snapshot (Last Values)" subtitle="Promedios por división (última carga)">
                    <div className="row" style={{ gap: 18 }}>
                        <span className="pill">Press Plano: {kpiAvg("pressPlanoKg")} kg</span>
                        <span className="pill">Dominadas: {kpiAvg("dominadasKg")} kg</span>
                        <span className="pill">Sentadillas: {kpiAvg("sentadillasKg")} kg</span>
                        <span className="pill">Peso Muerto: {kpiAvg("pesoMuertoKg")} kg</span>
                    </div>
                </Card>

                <Card title="Exceptions" subtitle="MVP: sin flags automáticos (los sumamos después)">
                    <div className="small">Cuando quieras, agregamos flags vs última medición (ej caída &gt;10%).</div>
                </Card>
            </div>
        </div>
    );
}
