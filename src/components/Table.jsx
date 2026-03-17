export default function Table({ columns, rows }) {
    return (
        <div style={{ overflowX: "auto" }}>
            <table className="table">
                <thead>
                    <tr>
                        {columns.map(c => <th key={c.key}>{c.label}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, idx) => (
                        <tr key={r.id ?? idx}>
                            {columns.map(c => <td key={c.key}>{c.render ? c.render(r) : String(r[c.key] ?? "")}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
