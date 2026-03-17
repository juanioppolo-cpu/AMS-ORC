import { useMemo, useState } from "react";
import Card from "../Card";
import Table from "../Table";
import { DIVISIONS } from "../../app/divisions";
import { MODULES, defaultPermissionsForRole } from "../../app/permissions";
import Papa from "papaparse";
import { api } from "../../lib/api";

function clone(obj) { return JSON.parse(JSON.stringify(obj)); }

const MODULE_LABELS = {
    Forms: "Forms (General)",
    Dashboards: "Dashboards (General)",
    Reports: "Reports (General)",
    ReportsExport: "Reports Export",
    Medical: "Medical",
    Nutrition: "Nutrition",
    PhysicalStrength: "Physical – Strength",
    PhysicalField: "Physical – Field",
    ManagerAttendance: "Manager – Attendance",
    Wellness: "Wellness (Athlete)",
};

export default function AdminPortal({ users, setUsers }) {
    const [selectedId, setSelectedId] = useState(users[0]?.id ?? null);
    const [q, setQ] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [divFilter, setDivFilter] = useState("ALL");

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            if (q && !(`${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()))) return false;
            if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
            if (divFilter !== "ALL" && !(u.divisions || []).includes(divFilter)) return false;
            return true;
        });
    }, [users, q, roleFilter, divFilter]);

    const selected = users.find(u => u.id === selectedId) ?? null;
    const [draft, setDraft] = useState(selected ? clone(selected) : null);

    // Bulk Import State
    const [showImport, setShowImport] = useState(false);
    const [importMsg, setImportMsg] = useState(null);

    // mantener draft sincronizado cuando cambia selectedId
    useMemo(() => {
        setDraft(selected ? clone(selected) : null);
    }, [selectedId]); // eslint-disable-line

    const columns = [
        { key: "name", label: "Name", render: (r) => <span style={{ fontWeight: 600 }}>{r.name}</span> },
        { key: "role", label: "Role", render: (r) => <span className={`badge ${r.role === 'Admin' ? 'black' : r.role === 'Coach' ? 'blue' : ''}`}>{r.role.toUpperCase()}</span> },
        { key: "divisions", label: "Divisions", render: (r) => (r.role === "Admin" ? "ALL" : (r.divisions || []).join(", ")) },
        { key: "active", label: "Status", render: (r) => <span className={`badge ${r.active ? 'green' : 'red'}`}>{r.active ? "ACTIVE" : "INACTIVE"}</span> },
    ];

    const save = async () => {
        if (!draft) return;
        try {
            await api.updateUser(draft.id, {
                name: draft.name,
                email: draft.email,
                role: draft.role,
                active: draft.active,
                photo_url: draft.photoUrl ?? draft.photo_url ?? null,
                athlete_id: draft.athleteId ?? draft.athlete_id ?? null,
                divisions: draft.divisions ?? [],
                permissions: draft.permissions ?? {},
                external_ids: draft.externalIds ?? draft.external_ids ?? {},
            });
            const next = users.map(u => u.id === draft.id ? { ...u, ...draft } : u);
            setUsers(next);
            alert("User saved to Neon.");
        } catch (err) {
            alert("Error saving user: " + err.message);
        }
    };

    const toggleDivision = (d) => {
        if (!draft) return;
        const current = new Set(draft.divisions ?? []);
        if (current.has(d)) current.delete(d); else current.add(d);

        const divs = Array.from(current);
        setDraft({ ...draft, divisions: divs });
    };

    const setRole = (role) => {
        if (!draft) return;
        // reset permissions defaults for the role
        const perms = defaultPermissionsForRole(role);

        // Admin: set all divisions by default
        const divs = role === "Admin" ? [...DIVISIONS] : (draft.divisions ?? []);
        setDraft({ ...draft, role, divisions: divs, permissions: perms });
    };

    const togglePerm = (moduleKey, field) => {
        if (!draft) return;

        // Athlete hard rule: no matrix editable (keep wellness only)
        if (draft.role === "Athlete") return;

        // Dashboards write/delete hard blocked
        if (moduleKey === "Dashboards" && (field === "write" || field === "delete")) return;

        const next = clone(draft);
        if (!next.permissions[moduleKey]) next.permissions[moduleKey] = { view: false, write: false, delete: false };

        next.permissions[moduleKey][field] = !next.permissions[moduleKey][field];

        // If turning off view, also turn off write/delete
        if (field === "view" && next.permissions[moduleKey].view === false) {
            next.permissions[moduleKey].write = false;
            next.permissions[moduleKey].delete = false;
        }

        // If turning on delete without view/write, enforce
        if (field === "delete" && next.permissions[moduleKey].delete === true) {
            next.permissions[moduleKey].view = true;
            next.permissions[moduleKey].write = true;
        }

        setDraft(next);
    };

    const newUser = async () => {
        const id = "u_" + (crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Date.now());
        const u = {
            id,
            name: "New User",
            email: `${id}@orc.com`,
            role: "Coach",
            divisions: ["M19"],
            permissions: defaultPermissionsForRole("Coach"),
            active: true,
        };
        try {
            const created = await api.createUser({ ...u, password: 'password123' });
            setUsers([{ ...u, ...created }, ...users]);
            setSelectedId(created.id || id);
        } catch (err) {
            alert("Error creating user: " + err.message);
        }
    };

    const deleteUser = async () => {
        if (!draft) return;
        if (!confirm(`Are you sure you want to delete ${draft.name}?`)) return;
        try {
            await api.deleteUser(draft.id);
            const next = users.filter(u => u.id !== draft.id);
            setUsers(next);
            setSelectedId(next[0]?.id || null);
        } catch (err) {
            alert("Error deleting user: " + err.message);
        }
    };

    const handleFileUpload = (e) => {
        const f = e.target.files[0];
        if (!f) return;

        Papa.parse(f, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                let successCount = 0;
                let failCount = 0;
                let nextUsers = [...users];

                results.data.forEach(row => {
                    // Try to match by Name or Email
                    const uIndex = nextUsers.findIndex(u =>
                        (row.Email && u.email.toLowerCase() === row.Email.toLowerCase()) ||
                        (row.Name && u.name.toLowerCase() === row.Name.toLowerCase())
                    );

                    if (uIndex >= 0) {
                        const existing = nextUsers[uIndex];
                        // Update existing user logic
                        const updatedUser = { ...existing };

                        // Update role/divisions if provided
                        if (row.Role && ["Admin", "Coach", "Athlete"].includes(row.Role)) updatedUser.role = row.Role;
                        if (row.Divisions) updatedUser.divisions = row.Divisions.split(',').map(s => s.trim());

                        // Update external IDs if Athlete
                        if (updatedUser.role === "Athlete") {
                            updatedUser.externalIds = {
                                ...(existing.externalIds || {}),
                                catapult: row["Catapult ID"] || existing.externalIds?.catapult || "",
                                vald: row["VALD ID"] || existing.externalIds?.vald || "",
                                encoder: row["Encoder ID"] || existing.externalIds?.encoder || ""
                            };
                        }

                        nextUsers[uIndex] = updatedUser;
                        successCount++;
                    } else {
                        // Create New User
                        if (row.Name && row.Email) {
                            const id = "u_" + (crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Date.now());
                            const role = (row.Role && ["Admin", "Coach", "Athlete"].includes(row.Role)) ? row.Role : "Athlete";
                            const defaultDivs = row.Divisions ? row.Divisions.split(',').map(s => s.trim()) : [];

                            const newUserObj = {
                                id,
                                name: row.Name,
                                email: row.Email,
                                password: "password123", // default generic password
                                role: role,
                                divisions: defaultDivs,
                                permissions: defaultPermissionsForRole(role),
                                active: true,
                                externalIds: role === "Athlete" ? {
                                    catapult: row["Catapult ID"] || "",
                                    vald: row["VALD ID"] || "",
                                    encoder: row["Encoder ID"] || ""
                                } : undefined
                            };
                            nextUsers.push(newUserObj);
                            successCount++;
                        } else {
                            failCount++; // missing name or email
                        }
                    }
                });

                setUsers(nextUsers);

                // Keep the draft in sync if the selected user was updated
                if (selectedId) {
                    const updatedSelected = nextUsers.find(u => u.id === selectedId);
                    if (updatedSelected) setDraft(clone(updatedSelected));
                }

                setImportMsg(`Import Complete: Processed ${successCount} users. (${failCount} invalid/skipped rows)`);
                setTimeout(() => setImportMsg(null), 5000);
                e.target.value = null; // reset input
            },
            error: (err) => {
                alert("Error parsing CSV: " + err.message);
            }
        });
    };

    const downloadTemplate = () => {
        const data = [
            { Name: "Juan Perez", Email: "juan.perez@orc.com", Role: "Athlete", Divisions: "Plantel Superior, M19", "Catapult ID": "cat-882", "VALD ID": "v-123", "Encoder ID": "enc-1" },
            { Name: "Coach Marcos", Email: "marcos@orc.com", Role: "Coach", Divisions: "M19", "Catapult ID": "", "VALD ID": "", "Encoder ID": "" }
        ];
        const csv = Papa.unparse(data);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "ORC_Users_Import_Template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="container">
            <div className="pagehead" style={{ border: 'none', background: 'var(--bg-dark)', color: '#fff', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div className="pagehead-sub" style={{ color: 'rgba(255,255,255,0.7)' }}>ADMIN / USERS</div>
                        <h1 className="pagehead-title" style={{ color: '#fff', margin: 0 }}>Users & Permissions</h1>
                    </div>
                    <div className="row">
                        <button className="btn" onClick={downloadTemplate} style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.2)' }}>
                            ↓ CSV TEMPLATE
                        </button>
                        <label className="btn" style={{ fontWeight: 800, cursor: 'pointer', background: 'rgba(255,255,255,0.1)', color: '#fff' }}>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                style={{ display: 'none' }}
                            />
                            BULK IMPORT (CSV)
                        </label>
                        <button className="btn primary" onClick={newUser} style={{ fontWeight: 800 }}>+ NEW USER</button>
                    </div>
                </div>
            </div>

            {importMsg && (
                <div style={{ padding: '12px 16px', background: '#ecfdf5', color: '#065f46', borderRadius: '8px', marginBottom: '16px', fontWeight: 600 }}>
                    {importMsg}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
                {/* Left: list */}
                <Card title="Operational Roster" subtitle="Select a system user to manage configuration">
                    <div className="row" style={{ marginBottom: '16px' }}>
                        <input className="input" placeholder="Search by name/email..." value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: 1 }} />
                        <select className="select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                            <option value="ALL">All Roles</option>
                            <option value="Admin">Admin</option>
                            <option value="Coach">Coach</option>
                            <option value="Athlete">Athlete</option>
                        </select>
                    </div>

                    <div style={{ margin: '0 -14px' }}>
                        <Table
                            columns={columns}
                            rows={filteredUsers}
                        />
                    </div>

                    <div className="hr" />
                    <div style={{ display: "grid", gap: '8px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
                        {filteredUsers.map(u => (
                            <button
                                key={u.id}
                                className={"btn" + (u.id === selectedId ? " primary" : "")}
                                onClick={() => setSelectedId(u.id)}
                                style={{ justifyContent: "space-between", display: "flex", padding: '12px', borderRadius: '8px' }}
                            >
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ fontWeight: 700 }}>{u.name}</div>
                                    <div className="small" style={{ opacity: 0.7 }}>{u.email}</div>
                                </div>
                                <div className="small" style={{ fontWeight: 800 }}>{u.role.toUpperCase()}</div>
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Right: detail */}
                <Card title="User Configuration" subtitle="Define scope of access and capabilities">
                    {!draft ? (
                        <div style={{ padding: '60px', textAlign: 'center', opacity: 0.5 }} className="small italic">
                            Select a user from the roster to begin management.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <div className="small" style={{ fontWeight: 800, marginBottom: '4px' }}>Full Name</div>
                                    <input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} style={{ width: "100%" }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div className="small" style={{ fontWeight: 800, marginBottom: '4px' }}>System Email</div>
                                    <input className="input" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} style={{ width: "100%" }} />
                                </div>
                            </div>

                            <div>
                                <div className="small" style={{ fontWeight: 800, marginBottom: '4px' }}>Photo URL</div>
                                <input className="input" placeholder="https://example.com/photo.jpg" value={draft.photoUrl || ''} onChange={(e) => setDraft({ ...draft, photoUrl: e.target.value })} style={{ width: "100%" }} />
                            </div>

                            <div className="row">
                                <div style={{ flex: 1 }}>
                                    <div className="small" style={{ fontWeight: 800, marginBottom: '4px' }}>Assigned Role</div>
                                    <select className="select" style={{ width: '100%' }} value={draft.role} onChange={(e) => setRole(e.target.value)}>
                                        <option value="Admin">Admin</option>
                                        <option value="Coach">Coach</option>
                                        <option value="Athlete">Athlete</option>
                                    </select>
                                </div>
                                <div>
                                    <div className="small" style={{ fontWeight: 800, marginBottom: '4px' }}>Status</div>
                                    <button
                                        className={"btn" + (draft.active ? " green" : " danger")}
                                        onClick={() => setDraft({ ...draft, active: !draft.active })}
                                        style={{ minWidth: '100px', height: '38px', fontWeight: 800 }}
                                    >
                                        {draft.active ? "ACTIVE" : "INACTIVE"}
                                    </button>
                                </div>
                            </div>

                            <div className="hr" />

                            <div>
                                <div style={{ fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Division Scopes</div>
                                <div className="row" style={{ flexWrap: 'wrap', gap: '8px' }}>
                                    {DIVISIONS.map(d => (
                                        <label key={d} className={`pill ${draft.role === 'Admin' ? 'disabled' : ''}`} style={{ cursor: draft.role === "Admin" ? "default" : "pointer", padding: '6px 12px' }}>
                                            <input
                                                type="checkbox"
                                                checked={(draft.divisions ?? []).includes(d)}
                                                onChange={() => toggleDivision(d)}
                                                disabled={draft.role === "Admin"}
                                                style={{ marginRight: '8px' }}
                                            />
                                            <span style={{ fontWeight: 700 }}>{d}</span>
                                        </label>
                                    ))}
                                </div>
                                {draft.role === "Admin" && (
                                    <div className="small italic text-muted" style={{ marginTop: '8px' }}>Admins are automatically granted scope over all divisions.</div>
                                )}
                            </div>

                            <div className="hr" />

                            <div>
                                <div style={{ fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Capability Matrix</div>
                                {draft.role === "Athlete" ? (
                                    <div className="small italic text-muted">Athlete permissions are restricted to Wellness Form submission only.</div>
                                ) : (
                                    <div style={{ overflowX: "auto" }}>
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th style={{ textAlign: 'left' }}>Module</th>
                                                    <th>View</th>
                                                    <th>Write</th>
                                                    <th>Delete</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {MODULES.filter(m => m !== "Wellness").map(m => {
                                                    const p = draft.permissions?.[m] ?? { view: false, write: false, delete: false };
                                                    const writeDisabled = (m === "Dashboards");
                                                    const deleteDisabled = (m === "Dashboards");

                                                    return (
                                                        <tr key={m}>
                                                            <td style={{ fontWeight: 700, fontSize: '12px' }}>{MODULE_LABELS[m] ?? m}</td>
                                                            <td style={{ textAlign: 'center' }}>
                                                                <input type="checkbox" checked={p.view} onChange={() => togglePerm(m, "view")} />
                                                            </td>
                                                            <td style={{ textAlign: 'center' }}>
                                                                <input type="checkbox" checked={p.write} disabled={writeDisabled} onChange={() => togglePerm(m, "write")} />
                                                            </td>
                                                            <td style={{ textAlign: 'center' }}>
                                                                <input type="checkbox" checked={p.delete} disabled={deleteDisabled} onChange={() => togglePerm(m, "delete")} />
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {draft.role === "Athlete" && (
                                <>
                                    <div className="hr" />
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>External API Mapping</div>
                                        <div className="small italic text-muted mb-4">Map this athlete to their external platform identities for automated data sync.</div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '140px', fontWeight: 600, fontSize: '13px' }}>Catapult GPS ID</div>
                                                <input
                                                    className="input"
                                                    placeholder="e.g. 5f8d4e2a-..."
                                                    style={{ flex: 1 }}
                                                    value={draft.externalIds?.catapult || ""}
                                                    onChange={(e) => setDraft({
                                                        ...draft,
                                                        externalIds: { ...(draft.externalIds || {}), catapult: e.target.value }
                                                    })}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '140px', fontWeight: 600, fontSize: '13px' }}>VALD Performance ID</div>
                                                <input
                                                    className="input"
                                                    placeholder="e.g. vald-user-123"
                                                    style={{ flex: 1 }}
                                                    value={draft.externalIds?.vald || ""}
                                                    onChange={(e) => setDraft({
                                                        ...draft,
                                                        externalIds: { ...(draft.externalIds || {}), vald: e.target.value }
                                                    })}
                                                />
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '140px', fontWeight: 600, fontSize: '13px' }}>Custom Encoder ID</div>
                                                <input
                                                    className="input"
                                                    placeholder="e.g. encoder-99"
                                                    style={{ flex: 1 }}
                                                    value={draft.externalIds?.encoder || ""}
                                                    onChange={(e) => setDraft({
                                                        ...draft,
                                                        externalIds: { ...(draft.externalIds || {}), encoder: e.target.value }
                                                    })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="hr" />

                            <div className="row" style={{ justifyContent: 'space-between' }}>
                                <button className="btn danger small" onClick={deleteUser} style={{ fontWeight: 800 }}>DELETE USER</button>
                                <div className="row">
                                    <button className="btn" onClick={() => setDraft(clone(selected))} style={{ fontWeight: 700 }}>RESET</button>
                                    <button className="btn primary" onClick={save} style={{ fontWeight: 800, padding: '0 24px' }}>SAVE CHANGES</button>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
