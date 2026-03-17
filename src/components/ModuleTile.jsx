import React from 'react';

export default function ModuleTile({ title, count, icon, color, onClick, subtitle }) {
    return (
        <div
            onClick={onClick}
            style={{
                backgroundColor: "white",
                borderRadius: 16,
                padding: 24,
                cursor: "pointer",
                border: "1px solid #e5e7eb",
                transition: "all 0.2s ease",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
                e.currentTarget.style.borderColor = color;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)";
                e.currentTarget.style.borderColor = "#e5e7eb";
            }}
        >
            <div style={{
                width: 64, height: 64, borderRadius: "50%", backgroundColor: `${color}20`, color: color,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem"
            }}>
                {icon}
            </div>
            <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: 600, fontSize: "1.1rem", color: "#111827" }}>{title}</div>
                {(count !== undefined || subtitle) && (
                    <div style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: 4 }}>
                        {subtitle ? subtitle : `${count} Formulario${count !== 1 ? "s" : ""}`}
                    </div>
                )}
            </div>
        </div>
    );
}
