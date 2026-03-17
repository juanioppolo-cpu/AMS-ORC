// Realistic Body Map Component with overlay zones
export default function BodyMap({ injuries = [] }) {
    // Create a set of injured zones for quick lookup
    const injuredZones = new Set();
    injuries.forEach(injury => {
        const zone = injury.values?.zone;
        const hemisphere = injury.values?.hemisphere;
        if (zone && hemisphere) {
            injuredZones.add(`${zone}-${hemisphere}`);
        } else if (zone) {
            injuredZones.add(zone);
        }
    });

    const isInjured = (zone, hemisphere = null) => {
        if (hemisphere) {
            return injuredZones.has(`${zone}-${hemisphere}`);
        }
        return injuredZones.has(zone);
    };

    // SVG paths for body zones positioned over realistic image
    // Coordinates are in percentage (viewBox 0 0 100 100)
    const bodyZones = [
        // Head
        { zone: "Cabeza", path: "M 45 3 Q 50 1 55 3 Q 58 6 58 10 Q 57 14 50 15 Q 43 14 42 10 Q 42 6 45 3 Z" },

        // Neck
        { zone: "Cuello", path: "M 47 15 L 53 15 L 53 19 L 47 19 Z" },

        // Shoulders
        { zone: "Hombro", hemisphere: "Izquierdo", path: "M 55 19 Q 60 20 63 22 Q 64 24 62 26 Q 58 27 55 26 Z" },
        { zone: "Hombro", hemisphere: "Derecho", path: "M 45 19 Q 40 20 37 22 Q 36 24 38 26 Q 42 27 45 26 Z" },

        // Chest
        { zone: "Pecho", path: "M 42 26 L 58 26 L 56 38 L 44 38 Z" },

        // Abdomen
        { zone: "Abdomen", path: "M 44 38 L 56 38 L 55 50 L 45 50 Z" },

        // Arms - Upper (Brazo)
        { zone: "Brazo", hemisphere: "Izquierdo", path: "M 58 26 Q 62 27 65 30 L 66 42 Q 64 43 62 42 L 60 30 Z" },
        { zone: "Brazo", hemisphere: "Derecho", path: "M 42 26 Q 38 27 35 30 L 34 42 Q 36 43 38 42 L 40 30 Z" },

        // Elbows
        { zone: "Codo", hemisphere: "Izquierdo", path: "M 64 42 Q 66 43 66 45 Q 65 47 63 47 Q 61 46 62 44 Z" },
        { zone: "Codo", hemisphere: "Derecho", path: "M 36 42 Q 34 43 34 45 Q 35 47 37 47 Q 39 46 38 44 Z" },

        // Forearms (Antebrazo)
        { zone: "Antebrazo", hemisphere: "Izquierdo", path: "M 63 47 L 65 47 L 66 60 L 63 60 Z" },
        { zone: "Antebrazo", hemisphere: "Derecho", path: "M 37 47 L 35 47 L 34 60 L 37 60 Z" },

        // Wrists
        { zone: "Muñeca", hemisphere: "Izquierdo", path: "M 63 60 L 66 60 L 66 62 L 63 62 Z" },
        { zone: "Muñeca", hemisphere: "Derecho", path: "M 37 60 L 34 60 L 34 62 L 37 62 Z" },

        // Hands
        { zone: "Mano", hemisphere: "Izquierdo", path: "M 63 62 Q 65 63 66 66 Q 65 68 63 67 Q 62 65 63 62 Z" },
        { zone: "Mano", hemisphere: "Derecho", path: "M 37 62 Q 35 63 34 66 Q 35 68 37 67 Q 38 65 37 62 Z" },

        // Hips
        { zone: "Cadera", hemisphere: "Izquierdo", path: "M 50 50 Q 53 51 55 53 Q 54 56 51 56 Q 49 54 50 50 Z" },
        { zone: "Cadera", hemisphere: "Derecho", path: "M 50 50 Q 47 51 45 53 Q 46 56 49 56 Q 51 54 50 50 Z" },

        // Thighs (Muslo)
        { zone: "Muslo", hemisphere: "Izquierdo", path: "M 51 56 L 55 56 L 54 72 L 51 72 Z" },
        { zone: "Muslo", hemisphere: "Derecho", path: "M 49 56 L 45 56 L 46 72 L 49 72 Z" },

        // Knees (Rodilla)
        { zone: "Rodilla", hemisphere: "Izquierdo", path: "M 51 72 Q 53 73 54 75 Q 53 77 51 76 Q 50 74 51 72 Z" },
        { zone: "Rodilla", hemisphere: "Derecho", path: "M 49 72 Q 47 73 46 75 Q 47 77 49 76 Q 50 74 49 72 Z" },

        // Lower legs (Pantorrilla/Pierna)
        { zone: "Pantorrilla", hemisphere: "Izquierdo", path: "M 51 76 L 54 76 L 53 90 L 51 90 Z" },
        { zone: "Pantorrilla", hemisphere: "Derecho", path: "M 49 76 L 46 76 L 47 90 L 49 90 Z" },
        { zone: "Pierna", hemisphere: "Izquierdo", path: "M 51 76 L 54 76 L 53 90 L 51 90 Z" },
        { zone: "Pierna", hemisphere: "Derecho", path: "M 49 76 L 46 76 L 47 90 L 49 90 Z" },

        // Ankles (Tobillo)
        { zone: "Tobillo", hemisphere: "Izquierdo", path: "M 51 90 Q 52 91 53 92 Q 52 93 51 92 Z" },
        { zone: "Tobillo", hemisphere: "Derecho", path: "M 49 90 Q 48 91 47 92 Q 48 93 49 92 Z" },

        // Feet (Pie)
        { zone: "Pie", hemisphere: "Izquierdo", path: "M 51 92 Q 52 94 53 97 Q 51 98 50 96 Q 50 94 51 92 Z" },
        { zone: "Pie", hemisphere: "Derecho", path: "M 49 92 Q 48 94 47 97 Q 49 98 50 96 Q 50 94 49 92 Z" }
    ];

    return (
        <div style={{ position: "relative", width: "100%", maxWidth: 500, margin: "0 auto" }}>
            {/* Background realistic body image */}
            <img
                src="/body-realistic.png"
                alt="Diagrama corporal"
                style={{ width: "100%", height: "auto", display: "block" }}
            />

            {/* SVG overlay for injury zones */}
            <svg
                viewBox="0 0 100 100"
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none"
                }}
            >
                {bodyZones.map((zone, idx) => {
                    const injured = isInjured(zone.zone, zone.hemisphere);
                    if (!injured) return null;

                    return (
                        <path
                            key={idx}
                            d={zone.path}
                            fill="rgba(239, 68, 68, 0.5)"
                            stroke="rgba(239, 68, 68, 0.9)"
                            strokeWidth="0.3"
                            style={{
                                filter: "drop-shadow(0 0 3px rgba(239, 68, 68, 0.8))",
                                pointerEvents: "auto",
                                cursor: "pointer"
                            }}
                        >
                            <title>{`${zone.zone} ${zone.hemisphere || ""}`}</title>
                        </path>
                    );
                })}
            </svg>
        </div>
    );
}
