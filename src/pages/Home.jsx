import React from 'react';
import bgImage from '../assets/murrayfield.png';

export default function Home({ user }) {
    return (
        <div style={{
            height: '100%',
            width: '100%',
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            textAlign: 'center'
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                zIndex: 1
            }} />

            <div style={{ zIndex: 2, padding: 40, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 16, backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: 16, letterSpacing: '-0.02em' }}>Bienvenido al Sistema AMS</h1>
                <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)', marginBottom: 32, maxWidth: 600 }}>
                    Hola {user?.name}. Utiliza la barra superior para navegar por las distintas secciones del sistema o abre el menú lateral izquierdo para ver tu equipo.
                </p>

                <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                    <div style={{ padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, fontSize: '0.9rem' }}>
                        <span style={{ marginRight: 8 }}>☰</span>
                        Equipos (Lateral)
                    </div>
                </div>
            </div>
        </div>
    );
}
