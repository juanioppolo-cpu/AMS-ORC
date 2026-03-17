import React from 'react';

// Mock implementation of a Modal/Dialog for the selector
export default function PhysicalSelectorModal({ onClose, onSelect }) {
    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50
        }}>
            <div style={{
                backgroundColor: "white", padding: 24, borderRadius: 16, width: 400, maxWidth: "90%",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}>
                <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: "1.25rem", color: "#111827" }}>
                    Selecciona Tipo de Sesión
                </h3>
                <div style={{ display: "grid", gap: 12 }}>
                    <button
                        className="btn secondary"
                        style={{ justifyContent: "flex-start", height: 50, fontSize: "1rem" }}
                        onClick={() => onSelect("strength")}
                    >
                        💪 Fuerza
                    </button>
                    <button
                        className="btn secondary"
                        style={{ justifyContent: "flex-start", height: 50, fontSize: "1rem" }}
                        onClick={() => onSelect("jumps")}
                    >
                        🦘 Saltos
                    </button>
                    <button
                        className="btn secondary"
                        style={{ justifyContent: "flex-start", height: 50, fontSize: "1rem" }}
                        onClick={() => onSelect("field")}
                    >
                        🏃‍♂️ Campo
                    </button>
                </div>
                <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                    <button className="btn" onClick={onClose}>Cancelar</button>
                </div>
            </div>
        </div>
    );
}
