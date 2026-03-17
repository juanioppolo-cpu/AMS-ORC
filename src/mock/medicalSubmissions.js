import { USERS } from "./users";

// Mock data generator for medical injury submissions
export function seedMedicalSubmissions() {
    const now = new Date();
    const submissions = [];

    // Helper to create date string
    const dateStr = (daysAgo) => {
        const d = new Date(now);
        d.setDate(d.getDate() - daysAgo);
        return d.toISOString().slice(0, 10);
    };

    const injuryTypes = ["Muscular", "Ligamentosa", "Tendinosa", "Contusión", "Ósea"];
    const mechanisms = ["Contacto", "No Contacto"];
    const zones = [
        { zone: "Muslo", hemisphere: ["Derecho", "Izquierdo"] },
        { zone: "Rodilla", hemisphere: ["Derecho", "Izquierdo"] },
        { zone: "Tobillo", hemisphere: ["Derecho", "Izquierdo"] },
        { zone: "Hombro", hemisphere: ["Derecho", "Izquierdo"] },
        { zone: "Pantorrilla", hemisphere: ["Derecho", "Izquierdo"] },
        { zone: "Pie", hemisphere: ["Derecho", "Izquierdo"] }
    ];

    // Generate for all athletes
    const athletes = USERS.filter(u => u.role === "Athlete");

    // Assign random injury counts (0 to 2) to each athlete to populate history
    const injuryData = athletes.map(a => ({
        athleteId: a.id,
        division: a.divisions?.[0] || 'Unknown',
        count: Math.floor(Math.random() * 3) // 0, 1, or 2 past injuries
    }));

    let subId = 1;

    injuryData.forEach(({ athleteId, division, count }) => {
        for (let i = 0; i < count; i++) {
            const daysAgo = 5 + (i * 20) + Math.floor(Math.random() * 10);
            const injuryType = injuryTypes[Math.floor(Math.random() * injuryTypes.length)];
            const mechanism = mechanisms[Math.floor(Math.random() * mechanisms.length)];
            const zoneData = zones[Math.floor(Math.random() * zones.length)];
            const hemisphere = zoneData.hemisphere[Math.floor(Math.random() * zoneData.hemisphere.length)];

            const diagnoses = {
                "Muscular": [
                    `Desgarro grado ${Math.floor(Math.random() * 2) + 1} en ${zoneData.zone.toLowerCase()} ${hemisphere.toLowerCase()}`,
                    `Contractura en ${zoneData.zone.toLowerCase()} ${hemisphere.toLowerCase()}`,
                    `Distensión muscular en ${zoneData.zone.toLowerCase()} ${hemisphere.toLowerCase()}`
                ],
                "Ligamentosa": [
                    `Esguince grado ${Math.floor(Math.random() * 2) + 1} en ${zoneData.zone.toLowerCase()} ${hemisphere.toLowerCase()}`,
                    `Lesión ligamentaria en ${zoneData.zone.toLowerCase()} ${hemisphere.toLowerCase()}`
                ],
                "Tendinosa": [
                    `Tendinitis en ${zoneData.zone.toLowerCase()} ${hemisphere.toLowerCase()}`,
                    `Tendinopatía en ${zoneData.zone.toLowerCase()} ${hemisphere.toLowerCase()}`
                ],
                "Contusión": [
                    `Contusión por impacto en ${zoneData.zone.toLowerCase()} ${hemisphere.toLowerCase()}`,
                    `Hematoma en ${zoneData.zone.toLowerCase()} ${hemisphere.toLowerCase()}`
                ],
                "Ósea": [
                    `Fractura por estrés en ${zoneData.zone.toLowerCase()} ${hemisphere.toLowerCase()}`,
                    `Fisura en ${zoneData.zone.toLowerCase()} ${hemisphere.toLowerCase()}`
                ]
            };

            const diagnosisOptions = diagnoses[injuryType];
            const diagnosis = diagnosisOptions[Math.floor(Math.random() * diagnosisOptions.length)];
            const recurrence = i > 0 && Math.random() > 0.7 ? "Recurrente" : "Primera vez";

            // Randomly assign a status - recently injured players might still be Injured
            const isCurrentlyInjured = daysAgo < 15 && Math.random() > 0.5;

            submissions.push({
                id: `sub_med_${subId++}`,
                templateId: "ft_medical_eval",
                division: division,
                subjectId: athleteId,
                athleteId: athleteId, // Add mapping for new dashboard
                submittedBy: "coach.principal@orc.com",
                date: dateStr(daysAgo),
                values: {
                    injuryType: injuryType,
                    mechanism: mechanism,
                    zone: zoneData.zone,
                    hemisphere: hemisphere,
                    diagnosis: diagnosis,
                    recurrence: recurrence
                },
                data: {
                    status: isCurrentlyInjured ? "Injured" : "Cleared",
                    notes: isCurrentlyInjured ? `En recuperación de: ${diagnosis}` : "Alta médica otorgada."
                }
            });
        }

        // Ensure EVERY athlete has at least one baseline "Cleared" status if they had 0 injuries
        if (count === 0) {
            submissions.push({
                id: `sub_med_${subId++}`,
                templateId: "ft_medical_eval",
                division: division,
                subjectId: athleteId,
                athleteId: athleteId,
                submittedBy: "coach.principal@orc.com",
                date: dateStr(2),
                values: {},
                data: {
                    status: "Cleared",
                    notes: "Evaluación de rutina. Apto para jugar."
                }
            });
        }
    });

    return submissions;
}
