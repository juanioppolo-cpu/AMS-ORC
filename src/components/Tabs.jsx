function cx(...c) { return c.filter(Boolean).join(" "); }

export default function Tabs({ items, activeKey, onChange }) {
    return (
        <div className="tabs">
            {items.map(it => (
                <button
                    key={it.key}
                    className={cx("tab", activeKey === it.key && "active")}
                    onClick={() => onChange(it.key)}
                >
                    {it.label}
                </button>
            ))}
        </div>
    );
}
