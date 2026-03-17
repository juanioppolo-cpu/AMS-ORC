import Tabs from "./Tabs";

export default function TopBar({
    user,
    tabs,
    activeTab,
    onTabChange,
    onLogout,
    logoSrc,
    onToggleSidebar
}) {

    return (
        <header className="topbar">
            <div className="topbar-inner">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <button className="btn icon-only" style={{ background: 'transparent', color: 'white', border: 'none', fontSize: 24 }} onClick={onToggleSidebar}>
                        ☰
                    </button>
                    <div className="brand" style={{ cursor: 'pointer' }} onClick={() => onTabChange("home")}>
                        {logoSrc ? (
                            <img src={logoSrc} alt="Logo" style={{ width: 48, height: 48, objectFit: "contain", filter: "drop-shadow(0 0 2px rgba(255,255,255,0.2))" }} />
                        ) : (
                            <div className="brand-badge">
                                <span style={{ fontSize: 12, fontWeight: 700 }}>AMS</span>
                            </div>
                        )}
                        <div>
                            <div className="brand-title">ORC / AMS Prototype</div>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{user?.name}</div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    {user?.role === "Admin" && (
                        <div style={{ display: 'flex', gap: 8, marginRight: 8 }}>
                            <button className="btn icon-only" title="Users" onClick={() => onTabChange("users")}>👥</button>
                            <button className="btn icon-only" title="Settings" onClick={() => onTabChange("settings")}>⚙️</button>
                        </div>
                    )}
                    <span className="pill">{user?.role}</span>
                    <button className="btn" onClick={onLogout}>Logout</button>
                </div>
            </div>

            <Tabs items={tabs} activeKey={activeTab} onChange={onTabChange} />
        </header>
    );
}
