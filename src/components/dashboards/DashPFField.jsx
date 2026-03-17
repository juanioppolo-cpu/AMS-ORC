import Card from "../Card";

export default function DashPFField({ division, date, submissions }) {
    const rows = submissions.filter(s =>
        s.templateId === "ft_pf_field" &&
        s.division === division &&
        s.date === date
    );

    const best = (key, isLowerBetter = false) => {
        if (!rows.length) return null;
        const sorted = [...rows].sort((a, b) => {
            const av = Number(a.values?.[key] ?? 0);
            const bv = Number(b.values?.[key] ?? 0);
            return isLowerBetter ? (av - bv) : (bv - av);
        });
        return sorted[0];
    };

    const worst = (key, isLowerBetter = false) => {
        if (!rows.length) return null;
        const sorted = [...rows].sort((a, b) => {
            const av = Number(a.values?.[key] ?? 0);
            const bv = Number(b.values?.[key] ?? 0);
            return isLowerBetter ? (bv - av) : (av - bv);
        });
        return sorted[0];
    };

    const broncoBest = best("broncoSec", true);
    const broncoWorst = worst("broncoSec", true);
    const yoyoBest = best("yoyoIR1", false);
    const yoyoWorst = worst("yoyoIR1", false);
    const speedBest = best("velocidad10mSec", true);
    const speedWorst = worst("velocidad10mSec", true);

    const name = (r) => r ? (r.values?.athleteName ?? "") : "";

    return (
        <div className="container">
            <div style={{ display: "grid", gap: 12 }}>
                <Card title="Daily Intake" subtitle={`Cargas de campo — ${date}`}>
                    <div className="row">
                        <span className="pill">Entries: {rows.length}</span>
                    </div>
                </Card>

                <Card title="Top / Bottom (Today)" subtitle="Lectura rápida por métrica">
                    {!rows.length ? (
                        <div className="small">No field testing entries for this date.</div>
                    ) : (
                        <div style={{ display: "grid", gap: 10 }}>
                            <div className="row" style={{ justifyContent: "space-between" }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>Bronco (sec)</div>
                                    <div className="small">Best: {broncoBest?.values?.broncoSec} • Worst: {broncoWorst?.values?.broncoSec}</div>
                                </div>
                                <span className="badge green">LOWER=BETTER</span>
                            </div>

                            <div className="row" style={{ justifyContent: "space-between" }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>Yo-Yo IR1</div>
                                    <div className="small">Best: {yoyoBest?.values?.yoyoIR1} • Worst: {yoyoWorst?.values?.yoyoIR1}</div>
                                </div>
                                <span className="badge yellow">HIGHER=BETTER</span>
                            </div>

                            <div className="row" style={{ justifyContent: "space-between" }}>
                                <div>
                                    <div style={{ fontWeight: 700 }}>Velocidad (sec)</div>
                                    <div className="small">Best: {speedBest?.values?.velocidad10mSec} • Worst: {speedWorst?.values?.velocidad10mSec}</div>
                                </div>
                                <span className="badge green">LOWER=BETTER</span>
                            </div>
                        </div>
                    )}
                </Card>

                <Card title="Note" subtitle="MVP">
                    <div className="small">Después agregamos “Players to Review” (caídas vs histórico), como Teamworks.</div>
                </Card>
            </div>
        </div>
    );
}
