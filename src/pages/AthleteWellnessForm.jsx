import { useMemo, useState } from "react";
import Card from "../components/Card";
import { saveWellness } from "../app/storage";

export default function AthleteWellnessForm({ user, division, wellnessRows, setWellnessRows, onOpenTemplate }) {
    const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
    const [sleepHours, setSleepHours] = useState("7");
    const [sleepQuality, setSleepQuality] = useState("3");
    const [soreness, setSoreness] = useState("3");
    const [stress, setStress] = useState("3");
    const [noteOpen, setNoteOpen] = useState(false);
    const [notes, setNotes] = useState("");

    const submit = () => {
        // Basic validation
        if (!sleepHours || !sleepQuality || !soreness || !stress) {
            alert("Please complete all sections.");
            return;
        }

        const row = {
            id: crypto.randomUUID ? crypto.randomUUID() : `w_${Date.now()}`,
            date: today,
            division,
            athleteId: user.athleteId ?? user.id,
            athleteName: user.name,
            sleepHours: Number(sleepHours),
            sleepQuality: Number(sleepQuality),
            soreness: Number(soreness),
            stress: Number(stress),
            notes: noteOpen ? notes.trim() : "",
            createdAt: new Date().toISOString(),
        };

        const next = [row, ...wellnessRows];
        setWellnessRows(next);
        saveWellness(next);

        setNoteOpen(false);
        setNotes("");
        if (onSubmitSuccess) onSubmitSuccess(row);
    };

    const scale = (value, setValue, labels) => (
        <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                {[1, 2, 3, 4, 5].map(n => (
                    <button
                        key={n}
                        className={"btn" + (String(value) === String(n) ? " primary" : "")}
                        style={{ flex: 1, height: '44px', fontWeight: 700 }}
                        type="button"
                        onClick={() => setValue(String(n))}
                    >
                        {n}
                    </button>
                ))}
            </div>
            {labels && <div className="small" style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.7 }}>
                <span>{labels.split('…')[0].trim()}</span>
                <span>{labels.split('…')[1].trim()}</span>
            </div>}
        </div>
    );

    return (
        <div className="container" style={{ maxWidth: '480px' }}>
            <div className="pagehead" style={{ border: 'none', background: 'var(--bg-dark)', color: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div className="pagehead-sub" style={{ color: 'rgba(255,255,255,0.7)' }}>FORMS / WELLNESS</div>
                        <h1 className="pagehead-title" style={{ color: '#fff', margin: 0 }}>Morning Wellness</h1>
                    </div>
                    <span className="pill" style={{ background: 'rgba(255,255,255,0.2)', border: 'none' }}>{division}</span>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Card title="Sleep" subtitle={`Date: ${today}`}>
                    <div style={{ marginBottom: '16px' }}>
                        <div className="small" style={{ marginBottom: '8px', fontWeight: 800 }}>Hours of Sleep</div>
                        <select className="select" value={sleepHours} onChange={(e) => setSleepHours(e.target.value)} style={{ width: "100%", height: '44px' }}>
                            {[4, 5, 6, 7, 8, 9, 10].map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                    </div>
                    <div>
                        <div className="small" style={{ marginBottom: '8px', fontWeight: 800 }}>Sleep Quality</div>
                        {scale(sleepQuality, setSleepQuality, "1=Poor … 5=Excellent")}
                    </div>
                </Card>

                <Card title="Readiness" subtitle="Personal Metrics">
                    <div style={{ marginBottom: '16px' }}>
                        <div className="small" style={{ marginBottom: '8px', fontWeight: 800 }}>Muscle Soreness</div>
                        {scale(soreness, setSoreness, "1=Very sore … 5=Very fresh")}
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <div className="small" style={{ marginBottom: '8px', fontWeight: 800 }}>Stress Level</div>
                        {scale(stress, setStress, "1=High … 5=Low")}
                    </div>

                    <div className="hr" />

                    {!noteOpen ? (
                        <button className="btn small" type="button" onClick={() => setNoteOpen(true)} style={{ width: '100%' }}>
                            + Add note (optional)
                        </button>
                    ) : (
                        <div>
                            <div className="small" style={{ marginBottom: '8px', fontWeight: 800 }}>Notes</div>
                            <textarea
                                className="input"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                style={{ width: "100%", height: 90, padding: 10, fontSize: '13px' }}
                                placeholder="Describe any discomfort or specific stress factors..."
                            />
                        </div>
                    )}

                    <div style={{ marginTop: '20px' }}>
                        <button className="btn primary" type="button" onClick={submit} style={{ width: '100%', height: '48px', fontWeight: 900, fontSize: '14px' }}>
                            SUBMIT WELLNESS
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
