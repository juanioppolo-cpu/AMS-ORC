import { useState, useMemo } from "react";
import Card from "../components/Card";
import Papa from "papaparse";

export default function ImportPage({ user, users, templates, submissions, setSubmissions, onBack }) {
    const [step, setStep] = useState(1);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState([]);
    const [previewFields, setPreviewFields] = useState([]);

    const handleFileUpload = (e) => {
        const f = e.target.files[0];
        if (f) {
            setFile(f);
            Papa.parse(f, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    setParsedData(results.data);
                    if (results.meta && results.meta.fields) {
                        setPreviewFields(results.meta.fields);
                    }
                    if (results.data.length > 0) {
                        setStep(2);
                    }
                },
                error: (err) => {
                    alert("Error parsing CSV: " + err.message);
                }
            });
        }
    };

    const handleImport = () => {
        if (!selectedTemplate || parsedData.length === 0) return;

        const newSubmissions = [];
        const now = new Date().toISOString();
        const dateStr = new Date().toISOString().split("T")[0];

        let successCount = 0;
        let failCount = 0;

        parsedData.forEach(row => {
            // 1. Identify Athlete
            // Look for AthleteID or Name
            const athleteId = row["AthleteID"];
            let subjectId = null;
            let subjectDivision = "Imported";

            if (athleteId) {
                // Verify if exists
                const u = users.find(u => u.id === athleteId || u.athleteId === athleteId);
                if (u) {
                    subjectId = u.id;
                    if (u.divisions && u.divisions.length > 0) subjectDivision = u.divisions[0];
                }
            } else if (row["Name"]) {
                // Exact match by name
                const u = users.find(u => u.name === row["Name"]);
                if (u) {
                    subjectId = u.id;
                    if (u.divisions && u.divisions.length > 0) subjectDivision = u.divisions[0];
                }
            }

            if (!subjectId) {
                failCount++;
                return; // Skip if no athlete found
            }

            // 2. Map Fields
            const values = {};
            selectedTemplate.fields.forEach(f => {
                if (f.type === "section") return;

                // Try to find column by label or key
                let val = row[f.label] || row[f.key];

                if (val !== undefined && val !== "") {
                    // Type conversion
                    if (f.type === "number" || f.type === "scale5") {
                        val = Number(val);
                    }
                    values[f.key] = val;
                }
            });

            // 3. Create Submission
            newSubmissions.push({
                id: crypto.randomUUID(),
                templateId: selectedTemplate.id,
                subjectId: subjectId,
                authorId: user.id, // Imported by
                date: row["Date"] || dateStr, // Allow date column overrides
                division: subjectDivision, // Extracted from matched user
                status: "submitted",
                values: values,
                createdAt: now,
                updatedAt: now,
            });
            successCount++;
        });

        if (newSubmissions.length > 0) {
            setSubmissions([...submissions, ...newSubmissions]);
            alert(`Importación completada.\n✅ Éxito: ${successCount}\n❌ Fallidos: ${failCount} (Atletas no encontrados)`);
            onBack();
        } else {
            alert("No se pudieron importar datos válidos. Revisa los IDs o Nombres de usuarios.");
        }
    };

    return (
        <div className="container">
            <div className="pagehead" style={{ marginBottom: 24 }}>
                <div className="pagehead-inner">
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <button className="btn small" onClick={onBack}>← Volver</button>
                        <div>
                            <div className="pagehead-sub">OPERACIONES MASIVAS</div>
                            <div className="pagehead-title">Importar Datos</div>
                        </div>
                    </div>
                </div>
            </div>

            {step === 1 && (
                <Card title="Cargar Archivo (CSV)">
                    <div style={{ display: "grid", gap: 24, maxWidth: 600 }}>
                        <div className="small text-muted">Asegúrate que tu archivo tenga una columna 'AthleteID' o 'Name' que coincida con los usuarios.</div>

                        <div>
                            <label className="label">1. Seleccionar Formulario de Destino</label>
                            <select
                                className="input"
                                value={selectedTemplate?.id || ""}
                                onChange={e => setSelectedTemplate(templates.find(t => t.id === e.target.value))}
                            >
                                <option value="">Seleccionar...</option>
                                {templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.module})</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ opacity: selectedTemplate ? 1 : 0.5, pointerEvents: selectedTemplate ? "auto" : "none" }}>
                            <label className="label">2. Subir Archivo</label>
                            <div style={{
                                border: "2px dashed #e5e7eb", borderRadius: 12, padding: 40,
                                textAlign: "center", cursor: "pointer", backgroundColor: "#f9fafb"
                            }}>
                                <div style={{ fontSize: "2rem", marginBottom: 12 }}>📂</div>
                                <div style={{ fontWeight: 500, color: "#374151" }}>Arrastra tu archivo CSV aquí</div>
                                <input
                                    type="file"
                                    onChange={handleFileUpload}
                                    accept=".csv"
                                    style={{ marginTop: 12 }}
                                />
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {step === 2 && (
                <Card title={`Previsualización: ${file?.name}`}>
                    <div style={{ marginBottom: 16 }}>
                        <div className="small">Filas detectadas: {parsedData.length}</div>
                        <div className="small">Columnas: {previewFields.join(", ")}</div>
                    </div>

                    <div style={{ maxHeight: 300, overflow: "auto", border: "1px solid #e5e7eb", borderRadius: 8, marginBottom: 20 }}>
                        <table style={{ width: "100%", fontSize: "0.85rem" }}>
                            <thead>
                                <tr style={{ background: "#f9fafb", textAlign: "left" }}>
                                    {previewFields.map(f => <th key={f} style={{ padding: 8 }}>{f}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {parsedData.slice(0, 5).map((row, i) => (
                                    <tr key={i} style={{ borderTop: "1px solid #e5e7eb" }}>
                                        {previewFields.map(f => <td key={f} style={{ padding: 8 }}>{row[f]}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {parsedData.length > 5 && <div style={{ padding: 8, fontStyle: "italic", color: "#6b7280" }}>... y {parsedData.length - 5} filas más</div>}
                    </div>

                    <div style={{ display: "flex", gap: 12 }}>
                        <button className="btn secondary" onClick={() => { setStep(1); setFile(null); setParsedData([]); }}>Cancelar</button>
                        <button className="btn primary" onClick={handleImport}>Importar Datos</button>
                    </div>
                </Card>
            )}
        </div>
    );
}
