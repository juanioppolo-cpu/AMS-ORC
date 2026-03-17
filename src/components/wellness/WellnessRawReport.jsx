import { useMemo, useState } from "react";
import Card from "../Card";

import Table from "../Table";

function toCSV(rows) {
    const headers = ["date", "division", "athleteName", "sleepQuality", "fatigue", "soreness", "stress", "mood", "totalScore", "notes"];
    const esc = (v) => `"${String(v ?? "").replaceAll('"', '""')}"`;
    const lines = [
        headers.join(","),
        ...rows.map(r => headers.map(h => esc(r[h])).join(",")),
    ];
    return lines.join("\n");
}

function getTrafficColor(totalScore) {
    if (totalScore <= 14) return 'var(--red)';
    if (totalScore <= 19) return 'var(--yellow)';
    return 'var(--green)';
}

export default function WellnessRawReport({ division, wellnessRows = [], athletesInDivision = [] }) {
    const [from, setFrom] = useState(new Date().toISOString().slice(0, 10));
    const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
    const [athlete, setAthlete] = useState("ALL");

    const filtered = useMemo(() => {
        const rows = wellnessRows.filter(r => r.division === division);
        const inRange = rows.filter(r => r.date >= from && r.date <= to);
        return athlete === "ALL" ? inRange : inRange.filter(r => r.athleteId === athlete);
    }, [wellnessRows, division, from, to, athlete]);

    const columns = [
        { key: "date", label: "Fecha" },
        { key: "athleteName", label: "Atleta", render: (r) => <span style={{ fontWeight: 600 }}>{r.athleteName}</span> },
        {
            key: "totalScore",
            label: "Total (/25)",
            render: (r) => (
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: getTrafficColor(r.totalScore) }} />
                    {r.totalScore}
                </div>
            )
        },
        { key: "sleepQuality", label: "Sueño", render: (r) => <span className={`badge ${r.sleepQuality <= 2 ? 'red' : ''}`}>{r.sleepQuality}</span> },
        { key: "fatigue", label: "Fatiga", render: (r) => <span className={`badge ${r.fatigue <= 2 ? 'red' : ''}`}>{r.fatigue}</span> },
        { key: "soreness", label: "Dolor", render: (r) => <span className={`badge ${r.soreness <= 2 ? 'red' : ''}`}>{r.soreness}</span> },
        { key: "stress", label: "Estrés", render: (r) => <span className={`badge ${r.stress <= 2 ? 'red' : ''}`}>{r.stress}</span> },
        { key: "mood", label: "Ánimo", render: (r) => <span className={`badge ${r.mood <= 2 ? 'red' : ''}`}>{r.mood}</span> },
        { key: "notes", label: "Notas", render: (r) => <span className="small" style={{ fontStyle: 'italic', opacity: 0.6 }}>{r.notes}</span> }
    ];

    const exportCSV = () => {
        const csv = toCSV(filtered);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `wellness_${division}_${from}_to_${to}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="container">
            <div className="pagehead" style={{ border: 'none', background: 'var(--bg-dark)', color: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div className="pagehead-sub" style={{ color: 'rgba(255,255,255,0.7)' }}>REPORTS / WELLNESS</div>
                        <h1 className="pagehead-title" style={{ color: '#fff', margin: 0 }}>Wellness Raw Data</h1>
                    </div>
                    <span className="pill" style={{ background: 'rgba(255,255,255,0.2)', border: 'none' }}>{division}</span>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Card title="Extraction Filters" subtitle="Define scope for audit or export">
                    <div className="row" style={{ flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                            <div className="small" style={{ fontWeight: 800, marginBottom: '4px' }}>Range From</div>
                            <input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                        </div>
                        <div>
                            <div className="small" style={{ fontWeight: 800, marginBottom: '4px' }}>Range To</div>
                            <input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                        </div>
                        <div style={{ flex: 1, minWidth: '150px' }}>
                            <div className="small" style={{ fontWeight: 800, marginBottom: '4px' }}>Athlete Selection</div>
                            <select className="select" style={{ width: '100%' }} value={athlete} onChange={(e) => setAthlete(e.target.value)}>
                                <option value="ALL">All Athletes</option>
                                {athletesInDivision.map(a => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ alignSelf: 'flex-end' }}>
                            <button className="btn primary" onClick={exportCSV} style={{ height: '38px', fontWeight: 700 }}>EXPORT CSV</button>
                        </div>
                    </div>
                </Card>

                <Card title="Entry Audit" subtitle={`Viewing ${filtered.length} matching records`}>
                    <Table columns={columns} rows={filtered} />
                    {filtered.length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }} className="small italic">
                            No entries found for the selected criteria.
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
