import { useState } from "react";
import { login } from "../app/auth";
import logo from "../assets/logo-orc.png";
import Card from "../components/Card";

export default function Login({ users = [], onSuccess }) {
    const [email, setEmail] = useState(users?.[0]?.email || "");
    const [password, setPassword] = useState("1234");
    const [error, setError] = useState("");

    const submit = (e) => {
        e.preventDefault();
        const user = login(email, password);
        if (!user) return setError("Invalid credentials or inactive user.");
        onSuccess(user);
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9' }}>
            <div style={{ width: '100%', maxWidth: '360px' }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div className="brand-badge" style={{ margin: '0 auto 16px', background: 'var(--bg-dark)', width: '54px', height: '54px' }}>
                        <img src={logo} alt="ORC" style={{ width: 32, filter: 'brightness(0) invert(1)' }} />
                    </div>
                    <h1 style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '0.1em', color: 'var(--bg-dark)' }}>AMS OPERATIONAL</h1>
                    <p className="small">Sign in to the Mock Prototype</p>
                </div>

                <Card>
                    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <div>
                                <label className="small" style={{ fontWeight: 800 }}>Email Address</label>
                                <input
                                    type="email"
                                    className="input"
                                    style={{ width: '100%', marginTop: '4px' }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@orc.com"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="small" style={{ fontWeight: 800 }}>Security Key</label>
                            <input
                                type="password"
                                className="input"
                                style={{ width: '100%', marginTop: '4px' }}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && <div className="badge red" style={{ justifyContent: 'center', padding: '8px' }}>{error}</div>}

                        <button className="btn primary" style={{ width: '100%', height: '44px', fontWeight: 800 }}>
                            AUTHORIZE ACCESS
                        </button>

                        <div className="hr" />
                        <div className="small" style={{ textAlign: 'center', fontStyle: 'italic' }}>
                            Tip: All demo users use password <b>1234</b>.
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}
