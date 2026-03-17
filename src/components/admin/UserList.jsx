import { useState, useEffect } from "react";
import Card from "../Card";
import { loadUsers } from "../../services/storage";
import { DIVISIONS } from "../../config/divisions";

import Table from "../Table";

export default function UserList({ onEdit, onAdd }) {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    const [divFilter, setDivFilter] = useState("All");

    useEffect(() => {
        const data = loadUsers() || [];
        setUsers(data);
    }, []);

    const filtered = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.id.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === "All" || u.role === roleFilter;
        const matchesDiv = divFilter === "All" || u.divisions.includes(divFilter);
        return matchesSearch && matchesRole && matchesDiv;
    });

    const columns = [
        {
            key: "id",
            label: "ID",
            render: (u) => <span className="small" style={{ fontWeight: 700, color: 'var(--blue)' }}>{u.id.toUpperCase()}</span>
        },
        { key: "name", label: "Name", render: (u) => <span style={{ fontWeight: 600 }}>{u.name}</span> },
        {
            key: "role",
            label: "Role",
            render: (u) => (
                <span className={`badge ${u.role === 'Admin' ? 'black' : u.role === 'Coach' ? 'blue' : ''}`}>
                    {u.role.toUpperCase()}
                </span>
            )
        },
        {
            key: "divisions",
            label: "Divisions",
            render: (u) => (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {u.divisions?.length > 0 ? (
                        u.divisions.map(d => <span key={d} className="pill" style={{ fontSize: '9px', padding: '2px 6px' }}>{d}</span>)
                    ) : (
                        <span className="small italic text-muted">No Scopes</span>
                    )}
                </div>
            )
        },
        {
            key: "actions",
            label: "Actions",
            render: (u) => (
                <div style={{ textAlign: 'right' }}>
                    <button className="btn small" onClick={() => onEdit(u)}>MANAGE PERMISSIONS</button>
                </div>
            )
        }
    ];

    return (
        <div className="container">
            <div className="pagehead" style={{ border: 'none', background: 'transparent', padding: '0 0 16px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 className="pagehead-title">User Management</h1>
                        <p className="pagehead-sub">Configure system access, roles, and division scopes.</p>
                    </div>
                    <button className="btn primary" onClick={onAdd}>+ ADD USER</button>
                </div>
            </div>

            <Card>
                <div className="row" style={{ justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div className="row">
                        <input
                            type="text"
                            className="input"
                            placeholder="Search ID or Name..."
                            style={{ width: 200 }}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <select className="select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                            <option value="All">All Roles</option>
                            <option value="Admin">Admin</option>
                            <option value="Coach">Coach</option>
                            <option value="Athlete">Athlete</option>
                        </select>
                        <select className="select" value={divFilter} onChange={(e) => setDivFilter(e.target.value)}>
                            <option value="All">All Divisions</option>
                            {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="small" style={{ fontWeight: 600 }}>{filtered.length} Records Found</div>
                </div>

                <div style={{ margin: '0 -14px' }}>
                    <Table columns={columns} rows={filtered} />
                    {filtered.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
                            No users matching the current filters.
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
