import { useState } from "react";
import Card from "../Card";
import { MODULES } from "../../services/permissions";
import { DIVISIONS } from "../../config/divisions";

export default function UserDetail({ user: initialUser, onSave, onBack, onDelete }) {
    const [user, setUser] = useState(initialUser);

    const toggleDivision = (div) => {
        const divs = user.divisions || [];
        if (divs.includes(div)) {
            setUser({ ...user, divisions: divs.filter(d => d !== div) });
        } else {
            setUser({ ...user, divisions: [...divs, div] });
        }
    };

    const togglePermission = (module, type) => {
        const permissions = { ...user.permissions };
        if (!permissions[module]) {
            permissions[module] = { view: false, write: false, delete: false };
        }
        permissions[module][type] = !permissions[module][type];
        setUser({ ...user, permissions });
    };

    // Helper for Dashboards exception (Teamworks style: Read Only)
    const isReadOnlyModule = (m) => m === "Dashboards" || m === "ReportsExport";

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <button className="btn" onClick={onBack}>← BACK TO LIST</button>
                <button className="btn primary" onClick={() => onSave(user)}>SAVE CHANGES</button>
            </div>

            <Card title="User Configuration" subtitle={`ID: ${user.id.toUpperCase()}`}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                    <div>
                        <label className="small" style={{ fontWeight: 800 }}>Full Name</label>
                        <input
                            className="input"
                            style={{ width: '100%', marginTop: '4px' }}
                            value={user.name}
                            onChange={(e) => setUser({ ...user, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="small" style={{ fontWeight: 800 }}>Email Address</label>
                        <input
                            className="input"
                            style={{ width: '100%', marginTop: '4px' }}
                            value={user.email}
                            onChange={(e) => setUser({ ...user, email: e.target.value })}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label className="small" style={{ fontWeight: 800, display: 'block', marginBottom: '8px' }}>Role Selection</label>
                    <div className="row">
                        {["Admin", "Coach", "Athlete"].map(r => (
                            <button
                                key={r}
                                className={`btn ${user.role === r ? 'primary' : ''}`}
                                style={{ flex: 1 }}
                                onClick={() => setUser({ ...user, role: r })}
                            >
                                {r.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="hr" />

                <div style={{ marginBottom: '24px' }}>
                    <label className="small" style={{ fontWeight: 800, display: 'block', marginBottom: '12px' }}>Division Assignment (Scoping)</label>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {DIVISIONS.map(d => (
                            <label
                                key={d}
                                className={`pill pointer ${user.divisions?.includes(d) ? 'blue' : ''}`}
                                style={{ border: '1px solid var(--border)' }}
                                onClick={() => toggleDivision(d)}
                            >
                                <input
                                    type="checkbox"
                                    hidden
                                    checked={user.divisions?.includes(d)}
                                    onChange={() => { }}
                                />
                                {d}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="hr" />

                <div style={{ marginBottom: '24px' }}>
                    <label className="small" style={{ fontWeight: 800, display: 'block', marginBottom: '12px' }}>Functional Permission Matrix</label>
                    <table className="table" style={{ border: '1px solid var(--border)' }}>
                        <thead style={{ background: '#F8FAFC' }}>
                            <tr>
                                <th style={{ width: '40%' }}>Module</th>
                                <th style={{ textAlign: 'center' }}>View (V)</th>
                                <th style={{ textAlign: 'center' }}>Write (W)</th>
                                <th style={{ textAlign: 'center' }}>Delete (D)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MODULES.map(m => (
                                <tr key={m}>
                                    <td style={{ fontWeight: 700, fontSize: '12px' }}>{m.toUpperCase()}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={user.permissions?.[m]?.view || false}
                                            onChange={() => togglePermission(m, 'view')}
                                        />
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {!isReadOnlyModule(m) ? (
                                            <input
                                                type="checkbox"
                                                checked={user.permissions?.[m]?.write || false}
                                                onChange={() => togglePermission(m, 'write')}
                                            />
                                        ) : (
                                            <span className="small text-muted" style={{ fontSize: '9px' }}>N/A</span>
                                        )}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                        {!isReadOnlyModule(m) ? (
                                            <input
                                                type="checkbox"
                                                checked={user.permissions?.[m]?.delete || false}
                                                onChange={() => togglePermission(m, 'delete')}
                                            />
                                        ) : (
                                            <span className="small text-muted" style={{ fontSize: '9px' }}>N/A</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p className="small italic" style={{ marginTop: '8px', opacity: 0.6 }}>* N/A indicates functional restriction for the specified module.</p>
                </div>

                <div className="hr" />

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <button className="btn danger small" onClick={() => onDelete(user.id)}>DELETE USER PERMANENTLY</button>
                </div>
            </Card>
        </div>
    );
}
