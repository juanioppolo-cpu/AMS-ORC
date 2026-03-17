import { useState } from "react";

export default function RoutineDetailView({ routine, onClose }) {
    if (!routine) return null;

    return (
        <div style={modalOverlayStyle}>
            <div style={modalContentStyle}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#111827" }}>{routine.name}</h2>
                        <div style={{ fontSize: "1rem", color: "#6b7280", marginTop: 4 }}>{routine.dateLabel || "Sin fecha asignada"}</div>
                    </div>
                    <button onClick={onClose} style={{ border: "none", background: "none", fontSize: "1.5rem", cursor: "pointer", color: "#9ca3af" }}>✕</button>
                </div>

                {/* Content - Scrollable */}
                <div style={{ maxHeight: "70vh", overflowY: "auto", paddingRight: 8 }}>
                    {routine.blocks && routine.blocks.map((block, i) => (
                        <div key={block.id || i} style={{ marginBottom: 32 }}>
                            <div style={{
                                backgroundColor: "#f3f4f6", padding: "8px 16px", borderRadius: 6,
                                fontWeight: 700, color: "#374151", marginBottom: 16,
                                textTransform: "uppercase", fontSize: "0.85rem", letterSpacing: "0.05em"
                            }}>
                                {block.name}
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                                {block.exercises.map((exInstance, j) => (
                                    <div key={exInstance.id || j} style={{ borderBottom: "1px solid #e5e7eb", paddingBottom: 24 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#111827" }}>{exInstance.exerciseName}</h3>
                                            {exInstance.videoUrl && (
                                                <a href={exInstance.videoUrl} target="_blank" rel="noreferrer"
                                                    style={{
                                                        fontSize: "0.85rem", color: "#2563eb", textDecoration: "none",
                                                        display: "flex", alignItems: "center", gap: 4,
                                                        backgroundColor: "#eff6ff", padding: "4px 8px", borderRadius: 4
                                                    }}>
                                                    🎥 Ver Video
                                                </a>
                                            )}
                                        </div>

                                        {/* Mock Video Preview if URL exists (simulated) */}
                                        {exInstance.videoUrl && exInstance.videoUrl.includes("youtube") && (
                                            <div style={{
                                                width: "100%", height: 180, backgroundColor: "#000", borderRadius: 8, marginBottom: 16,
                                                display: "flex", alignItems: "center", justifyContent: "center", color: "white"
                                            }}>
                                                {/* In a real app, embed iframe here. For now, a placeholder */}
                                                <span style={{ opacity: 0.7 }}>▶️ Video Preview</span>
                                            </div>
                                        )}

                                        {/* Sets Table */}
                                        <div style={{ overflowX: "auto" }}>
                                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                                                <thead>
                                                    <tr style={{ borderBottom: "1px solid #e5e7eb", color: "#6b7280", textAlign: "left" }}>
                                                        <th style={{ padding: "8px 4px", fontWeight: 600 }}>Serie</th>
                                                        <th style={{ padding: "8px 4px", fontWeight: 600 }}>Reps</th>
                                                        <th style={{ padding: "8px 4px", fontWeight: 600 }}>Carga / RIR</th>
                                                        <th style={{ padding: "8px 4px", fontWeight: 600 }}>Pausa</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {exInstance.sets && exInstance.sets.map((set, k) => (
                                                        <tr key={set.id || k} style={{ borderBottom: "1px solid #f9fafb" }}>
                                                            <td style={{ padding: "8px 4px", color: "#9ca3af" }}>{k + 1}</td>
                                                            <td style={{ padding: "8px 4px", fontWeight: 600 }}>{set.reps}</td>
                                                            <td style={{ padding: "8px 4px" }}>{set.load}</td>
                                                            <td style={{ padding: "8px 4px", color: "#6b7280" }}>{set.rest}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Actions */}
                <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "flex-end" }}>
                    <button className="btn primary" onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </div>
    );
}

const modalOverlayStyle = {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60
};

const modalContentStyle = {
    backgroundColor: "white", padding: 32, borderRadius: 16,
    width: "100%", maxWidth: 600, maxHeight: "90vh",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
};
