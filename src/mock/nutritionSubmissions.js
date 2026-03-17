// Comprehensive mock data generator for nutrition anthropometric submissions
export function seedNutritionSubmissions() {
    const now = new Date();
    const submissions = [];

    // Helper to create date string
    const dateStr = (daysAgo) => {
        const d = new Date(now);
        d.setDate(d.getDate() - daysAgo);
        return d.toISOString().slice(0, 10);
    };

    // Helper to generate random variation
    const vary = (base, range) => {
        const value = base + (Math.random() * range * 2 - range);
        return parseFloat(value.toFixed(1));
    };

    // ALL 18 athletes with their characteristics
    const athletes = [
        // M17 athletes
        { id: "a_001", division: "M17", edad: 16, genero: "Hombre", categoria: "M17", puesto: "Centro", isForward: false },
        { id: "a_002", division: "M17", edad: 17, genero: "Hombre", categoria: "M17", puesto: "Ala", isForward: false },
        { id: "a_003", division: "M17", edad: 16, genero: "Hombre", categoria: "M17", puesto: "Medio", isForward: false },
        { id: "a_004", division: "M17", edad: 17, genero: "Hombre", categoria: "M17", puesto: "Pilar", isForward: true },
        { id: "a_005", division: "M17", edad: 16, genero: "Hombre", categoria: "M17", puesto: "Hooker", isForward: true },
        { id: "a_006", division: "M17", edad: 17, genero: "Hombre", categoria: "M17", puesto: "Segunda Línea", isForward: true },
        { id: "a_007", division: "M17", edad: 16, genero: "Hombre", categoria: "M17", puesto: "Tercera Línea", isForward: true },
        { id: "a_008", division: "M17", edad: 17, genero: "Hombre", categoria: "M17", puesto: "Medio Scrum", isForward: false },
        { id: "a_009", division: "M17", edad: 16, genero: "Hombre", categoria: "M17", puesto: "Apertura", isForward: false },
        { id: "a_010", division: "M17", edad: 17, genero: "Hombre", categoria: "M17", puesto: "Centro", isForward: false },
        { id: "a_011", division: "M17", edad: 16, genero: "Hombre", categoria: "M17", puesto: "Wing", isForward: false },
        { id: "a_012", division: "M17", edad: 17, genero: "Hombre", categoria: "M17", puesto: "Fullback", isForward: false },

        // M19 athletes
        { id: "a_013", division: "M19", edad: 18, genero: "Hombre", categoria: "M19", puesto: "Pilar", isForward: true },
        { id: "a_014", division: "M19", edad: 19, genero: "Hombre", categoria: "M19", puesto: "Hooker", isForward: true },
        { id: "a_015", division: "M19", edad: 18, genero: "Hombre", categoria: "M19", puesto: "Segunda Línea", isForward: true },
        { id: "a_016", division: "M19", edad: 19, genero: "Hombre", categoria: "M19", puesto: "Tercera Línea", isForward: true },
        { id: "a_017", division: "M19", edad: 18, genero: "Hombre", categoria: "M19", puesto: "Centro", isForward: false },
        { id: "a_018", division: "M19", edad: 19, genero: "Hombre", categoria: "M19", puesto: "Ala", isForward: false }
    ];

    let subId = 1;

    athletes.forEach((athlete) => {
        const isM19 = athlete.division === "M19";

        // Base values
        const baseHeight = athlete.isForward ? (isM19 ? 185 : 178) : (isM19 ? 178 : 172);
        const baseWeight = athlete.isForward ? (isM19 ? 95 : 85) : (isM19 ? 80 : 72);

        // Generate 2 measurements per athlete
        for (let i = 0; i < 2; i++) {
            const daysAgo = 45 - (i * 30);
            const progression = i * 0.02;

            submissions.push({
                id: `sub_nutr_${subId++}`,
                templateId: "ft_nutrition_anthro",
                division: athlete.division,
                subjectId: athlete.id,
                submittedBy: "coach.principal@orc.com",
                date: dateStr(daysAgo),
                values: {
                    genero: athlete.genero,
                    edad: athlete.edad,
                    categoria: athlete.categoria,
                    puesto: athlete.puesto,

                    // FIXED KEYS to match anthropometricCalcs.js
                    tallaCm: vary(baseHeight, 2),
                    pesoBrutoKg: vary(baseWeight * (1 + progression), 2),
                    tallaSentadoCm: vary(baseHeight * 0.52, 1),
                    envergaduraCm: vary(baseHeight * 1.02, 2),

                    // Pliegues
                    triceps: vary(12 * (1 - progression * 0.5), 2),
                    subescapular: vary(11 * (1 - progression * 0.5), 2),
                    supraespinal: vary(10 * (1 - progression * 0.5), 2),
                    abdominal: vary(15 * (1 - progression * 0.5), 2),
                    musloMedialPliegue: vary(13 * (1 - progression * 0.5), 2),
                    pantorrillaPliegue: vary(9 * (1 - progression * 0.5), 2),

                    // Perimetros
                    brazoRelajado: vary(athlete.isForward ? 32 : 29, 1),
                    brazoFlexionadoTension: vary(athlete.isForward ? 35 : 32, 1),
                    antebrazoMaximo: vary(athlete.isForward ? 28 : 26, 1),
                    muneca: vary(17, 0.5), // Not perMuneca
                    toraxMesoesternal: vary(athlete.isForward ? 100 : 92, 2),
                    cinturaMinima: vary(athlete.isForward ? 82 : 76, 2),
                    caderaMaximo: vary(athlete.isForward ? 98 : 92, 2),
                    musloMaximo: vary(athlete.isForward ? 58 : 54, 2),
                    musloMedial: vary(athlete.isForward ? 54 : 50, 2),
                    pantorrillaMaxima: vary(athlete.isForward ? 38 : 36, 1),
                    cabeza: vary(57, 1),
                    onfalico: vary(85, 3),

                    // Diametros (using calculator keys)
                    biestiloideo: vary(5.8, 0.2), // Not used in mass calc directly but standard
                    humeralBiepicondilar: vary(6.8, 0.2),
                    femoralBiepicondilar: vary(9.5, 0.3),
                    bimaleolar: vary(7.2, 0.2),
                    biacromial: vary(40, 1),
                    biiliocrestideo: vary(28, 1),
                    toraxTransverso: vary(30, 1),
                    toraxAnteroPosterior: vary(20, 1)
                }
            });
        }
    });

    return submissions;
}
