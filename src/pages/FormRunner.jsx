import { useMemo, useState } from "react";
import Card from "../components/Card";
import { saveFormSubmissions } from "../app/storage";

export default function FormRunner({ user, division, template, submissions, setSubmissions, onCancel, athletesInDivision = [], editSubmissionId }) {
    const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

    // Subject Logic
    const subjectType = template.subjectType ?? (template.targetRole === "Athlete" ? "athlete" : "division");
    const needsAthlete = subjectType === "athlete" && user.role !== "Athlete";

    // Initialize with first athlete if available
    const [selectedAthleteId, setSelectedAthleteId] = useState(
        needsAthlete ? (athletesInDivision[0]?.athleteId ?? "") : (user.athleteId ?? user.id)
    );

    const initial = useMemo(() => {
        if (editSubmissionId) {
            const sub = submissions.find(s => s.id === editSubmissionId);
            if (sub && sub.values) return sub.values;
        }

        const v = {};
        for (const f of template.fields) {
            if (f.type === "date") v[f.key] = today;
            if (f.type === "select" && f.options?.length) v[f.key] = f.options[0];
        }
        return v;
    }, [template, today, editSubmissionId, submissions]);

    const [values, setValues] = useState(initial);

    const setVal = (key, val) => setValues(v => ({ ...v, [key]: val }));

    const validate = () => {
        if (needsAthlete && !selectedAthleteId) return "Select an athlete";

        for (const f of template.fields) {
            if (f.required && (values[f.key] === undefined || values[f.key] === "")) return `${f.label} is required`;
        }
        return null;
    };

    const submit = () => {
        const err = validate();
        if (err) return alert(err);

        const existingSub = editSubmissionId ? submissions.find(s => s.id === editSubmissionId) : null;

        const row = {
            id: editSubmissionId || crypto.randomUUID(),
            templateId: template.id,
            templateName: template.name,
            module: template.module,
            date: existingSub?.date || today,
            division,
            subjectType,
            subjectId: existingSub?.subjectId || ((subjectType === "athlete")
                ? (user.role === "Athlete" ? (user.athleteId ?? user.id) : selectedAthleteId)
                : division),
            submittedByUserId: existingSub?.submittedByUserId || user.id,
            values,
            createdAt: existingSub?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const next = editSubmissionId
            ? submissions.map(s => s.id === editSubmissionId ? row : s)
            : [row, ...submissions];
        setSubmissions(next);
        saveFormSubmissions(next);
        // alert("Form Submitted Successfully");
        if (onCancel) onCancel(); // Return to list after submit
    };

    return (
        <div className="container">
            <div className="pagehead" style={{ border: 'none', background: 'var(--bg-dark)', color: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                <div className="pagehead-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div className="pagehead-sub" style={{ opacity: 0.7 }}>{editSubmissionId ? 'EDITING FORM /' : 'FORMS /'} {template.module.toUpperCase()}</div>
                        <div className="pagehead-title" style={{ color: '#fff' }}>{template.name}</div>
                    </div>
                    <div className="row">
                        <span className="pill" style={{ background: 'rgba(255,255,255,0.1)' }}>{division}</span>
                        <button className="btn small" onClick={onCancel} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none' }}>CANCEL</button>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 12 }}>
                <Card title="Data Entry" subtitle={`Reference Date: ${today}`}>
                    <div style={{ display: "grid", gap: 16 }}>
                        {needsAthlete && (
                            <div>
                                <div className="small">Athlete *</div>
                                <select
                                    className="select"
                                    value={selectedAthleteId}
                                    onChange={(e) => setSelectedAthleteId(e.target.value)}
                                    style={{ width: "100%" }}
                                >
                                    {athletesInDivision.map(a => (
                                        <option key={a.athleteId} value={a.athleteId}>{a.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {template.fields.map((f) => (
                            <Field key={f.id} f={f} value={values[f.key]} onChange={(v) => setVal(f.key, v)} />
                        ))}

                        <div className="hr" />
                        <div className="row" style={{ justifyContent: 'flex-end', gap: 12 }}>
                            <button className="btn" onClick={onCancel}>DISCARD</button>
                            <button className="btn primary" onClick={submit}>SUBMIT ENTRIES</button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

function Field({ f, value, onChange }) {
    if (f.type === "section") {
        return (
            <div style={{ marginTop: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{f.label}</div>
                <div style={{ height: 1, background: "var(--border)", marginTop: 8 }} />
            </div>
        );
    }

    if (f.type === "date") {
        return (
            <div>
                <div className="small">{f.label}{f.required ? " *" : ""}</div>
                <input
                    className="input"
                    type="date"
                    value={value ?? ""}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ width: "100%" }}
                />
            </div>
        );
    }

    if (f.type === "select") {
        return (
            <div>
                <div className="small">{f.label}{f.required ? " *" : ""}</div>
                <select className="select" value={value ?? ""} onChange={(e) => onChange(e.target.value)} style={{ width: "100%" }}>
                    {(f.options ?? []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
        );
    }

    if (f.type === "number") {
        return (
            <div>
                <div className="small">{f.label}{f.required ? " *" : ""}</div>
                <input
                    className="input"
                    type="number"
                    min={f.min ?? undefined}
                    max={f.max ?? undefined}
                    step={f.step ?? "any"}
                    value={value ?? ""}
                    onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
                    style={{ width: "100%" }}
                />
            </div>
        );
    }

    if (f.type === "scale5") {
        const getColor = (n) => {
            if (n <= 2) return 'var(--red)';
            if (n === 3) return 'var(--yellow)';
            return 'var(--green)';
        };

        return (
            <div>
                <div className="small">{f.label}{f.required ? " *" : ""}</div>
                <div className="row" style={{ gap: 8 }}>
                    {[1, 2, 3, 4, 5].map(n => {
                        const isSelected = Number(value) === n;
                        return (
                            <button
                                key={n}
                                className={`btn ${isSelected ? "primary" : ""}`}
                                type="button"
                                onClick={() => onChange(n)}
                                style={isSelected ? {
                                    backgroundColor: getColor(n),
                                    borderColor: getColor(n),
                                    color: 'white'
                                } : {}}
                            >
                                {n}
                            </button>
                        );
                    })}
                    <span className="small">
                        {f.leftLabel ? `1=${f.leftLabel}` : ""} {f.rightLabel ? `… 5=${f.rightLabel}` : ""}
                    </span>
                </div>
            </div>
        );
    }

    if (f.type === "text") {
        return (
            <div>
                <div className="small">{f.label}{f.required ? " *" : ""}</div>
                {f.multiline ? (
                    <textarea className="input" value={value ?? ""} onChange={(e) => onChange(e.target.value)}
                        style={{ width: "100%", height: 90, padding: 10 }} />
                ) : (
                    <input className="input" value={value ?? ""} onChange={(e) => onChange(e.target.value)} style={{ width: "100%" }} />
                )}
            </div>
        );
    }

    return <div className="small">Unsupported field type: {f.type}</div>;
}
