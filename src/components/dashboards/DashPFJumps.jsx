import Card from "../Card";

export default function DashPFJumps({ division, date, submissions = [], athletesInDivision = [] }) {
    const rows = submissions.filter(s => s.templateId === "ft_pf_jumps" && s.division === division);

    const lastByAthlete = new Map();
    for (const r of rows) {
        if (r.date > date) continue;
        const prev = lastByAthlete.get(r.subjectId);
        if (!prev || r.date > prev.date) lastByAthlete.set(r.subjectId, r);
    }

    const avg = (key) => {
        const arr = Array.from(lastByAthlete.values());
        if (!arr.length) return "-";
        const s = arr.reduce((acc, r) => acc + Number(r.values?.[key] ?? 0), 0);
        return (s / arr.length).toFixed(0);
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
                </Card>

                <Card title="Snapshot" subtitle="Promedios (última carga)">
                    <div className="row" style={{ gap: 18 }}>
                        <span className="pill">Broad Jump: {avg("broadJumpCm")} cm</span>
                        <span className="pill">Vertical Jump: {avg("verticalJumpCm")} cm</span>
                    </div>
                </Card>

                <Card title="Players to Review" subtitle="MVP: sin flags aún">
                    <div className="small">Después sumamos flags vs última medición (ej caída &gt;5%).</div>
                </Card>
            </div>
        </div>
    );
}
