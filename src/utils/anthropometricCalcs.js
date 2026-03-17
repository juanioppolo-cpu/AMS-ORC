/**
 * Anthropometric Calculations Module
 * Implements comprehensive body composition analysis formulas
 */

export function calculateAnthropometrics(values) {
    const v = values;

    // Helper to safely get numeric value
    const n = (key) => Number(v[key] ?? 0);

    // Basic inputs
    const genero = v.genero || "Hombre";
    const edad = n("edad");
    const categoria = v.categoria || "Primera";
    const puesto = v.puesto || "Campo";
    const pesoBruto = n("pesoBrutoKg");
    const tallaCm = n("tallaCm");
    const tallaSentado = n("tallaSentadoCm");

    // Diámetros
    const biacromial = n("biacromial");
    const toraxTransverso = n("toraxTransverso");
    const toraxAnteroPosterior = n("toraxAnteroPosterior");
    const biiliocrestideo = n("biiliocrestideo");
    const humeralBiepicondilar = n("humeralBiepicondilar");
    const femoralBiepicondilar = n("femoralBiepicondilar");

    // Perímetros
    const cabeza = n("cabeza");
    const brazoRelajado = n("brazoRelajado");
    const brazoFlexionado = n("brazoFlexionadoTension");
    const antebrazoMaximo = n("antebrazoMaximo");
    const toraxMesoesternal = n("toraxMesoesternal");
    const cinturaMinima = n("cinturaMinima");
    const onfalico = n("onfalico");
    const caderaMaximo = n("caderaMaximo");
    const musloMaximo = n("musloMaximo");
    const musloMedial = n("musloMedial");
    const pantorrillaMaxima = n("pantorrillaMaxima");

    // Pliegues cutáneos
    const triceps = n("triceps");
    const subescapular = n("subescapular");
    const supraespinal = n("supraespinal");
    const abdominal = n("abdominal");
    const musloMedialPliegue = n("musloMedialPliegue");
    const pantorrillaPliegue = n("pantorrillaPliegue");

    // === MASA PIEL ===
    const constante = (genero === "Hombre" && edad > 12) ? 68.308 :
        (genero === "Mujer" && edad > 12) ? 73.074 : 70.691;

    const areaSuperficial = (constante * Math.pow(pesoBruto, 0.425) * Math.pow(tallaCm, 0.725)) / 10000;
    const grosorPiel = genero === "Hombre" ? 2.07 : 1.96;
    const masaPielKg = areaSuperficial * grosorPiel * 1.05;

    // === MASA ADIPOSA ===
    const suma6Pliegues = triceps + subescapular + supraespinal + abdominal + musloMedialPliegue + pantorrillaPliegue;

    const scoreZAdiposa = ((suma6Pliegues * (170.18 / tallaCm)) - 116.41) / 34.79;
    const masaAdiposaKg = ((scoreZAdiposa * 5.85) + 25.6) / Math.pow((170.18 / tallaCm), 3);

    // === MASA MUSCULAR ===
    const PI = 3.141592653589793;
    const perBrazoCorregido = brazoRelajado - ((PI * triceps) / 10);
    const perAntebrazo = antebrazoMaximo;
    const perMusloCorregido = musloMaximo - ((PI * musloMedialPliegue) / 10);
    const perPantorrillaCorregido = pantorrillaMaxima - ((PI * pantorrillaPliegue) / 10);
    const perToraxCorregido = toraxMesoesternal - ((PI * subescapular) / 10);

    const sumaPerimetrosCorregidos = perBrazoCorregido + perAntebrazo + perMusloCorregido + perPantorrillaCorregido + perToraxCorregido;
    const scoreZMuscular = ((sumaPerimetrosCorregidos * (170.18 / tallaCm)) - 207.21) / 13.74;
    const masaMuscularKg = ((scoreZMuscular * 5.4) + 24.5) / Math.pow((170.18 / tallaCm), 3);

    // === MASA RESIDUAL ===
    const perCinturaCorregido = cinturaMinima - ((PI * abdominal) / 10);
    const sumaTorax = toraxTransverso + toraxAnteroPosterior + perCinturaCorregido;
    const scoreZResidual = ((sumaTorax * (89.92 / tallaSentado)) - 109.35) / 7.08;
    const masaResidualKg = ((scoreZResidual * 1.24) + 6.10) / Math.pow((89.92 / tallaSentado), 3);

    // === MASA ÓSEA ===
    const scoreZCabeza = (cabeza - 56) / 1.44;
    const sumaDiametros = biacromial + biiliocrestideo + (2 * humeralBiepicondilar) + (2 * femoralBiepicondilar);
    const scoreZOseaCuerpo = ((sumaDiametros * (170.18 / tallaCm)) - 98.88) / 5.33;

    const masaOseaCabezaKg = (scoreZCabeza * 0.18) + 1.2;
    const masaOseaCuerpoKg = ((scoreZOseaCuerpo * 1.34) + 6.70) / Math.pow((170.18 / tallaCm), 3);
    const masaOseaTotalKg = masaOseaCabezaKg + masaOseaCuerpoKg;

    // === PESO ESTRUCTURADO ===
    const pesoEstructuradoKg = masaOseaCabezaKg + masaOseaCuerpoKg + masaPielKg + masaAdiposaKg + masaMuscularKg + masaResidualKg;
    const diferenciaPEPesoBruto = pesoEstructuradoKg - pesoBruto;
    const porcDiferencia = (diferenciaPEPesoBruto / pesoBruto) * 100;

    // === PORCENTAJES Y AJUSTES ===
    const masaPielPorc = (masaPielKg / pesoEstructuradoKg) * 100;
    const masaPielAjuste = diferenciaPEPesoBruto * masaPielPorc / 100;
    const masaPielKgAjustada = masaPielKg - masaPielAjuste;

    const masaAdiposaPorc = (masaAdiposaKg / pesoEstructuradoKg) * 100;
    const masaAdiposaAjuste = diferenciaPEPesoBruto * masaAdiposaPorc / 100;
    const masaAdiposaKgAjustada = masaAdiposaKg - masaAdiposaAjuste;

    const masaMuscularPorc = (masaMuscularKg / pesoEstructuradoKg) * 100;
    const masaMuscularAjuste = diferenciaPEPesoBruto * masaMuscularPorc / 100;
    const masaMuscularKgAjustada = masaMuscularKg - masaMuscularAjuste;

    const masaResidualPorc = (masaResidualKg / pesoEstructuradoKg) * 100;
    const masaResidualAjuste = diferenciaPEPesoBruto * masaResidualPorc / 100;
    const masaResidualKgAjustada = masaResidualKg - masaResidualAjuste;

    const masaOseaCabezaPorc = (masaOseaCabezaKg / pesoEstructuradoKg) * 100;
    const masaOseaCabezaAjuste = diferenciaPEPesoBruto * masaOseaCabezaPorc / 100;
    const masaOseaCabezaKgAjustada = masaOseaCabezaKg - masaOseaCabezaAjuste;

    const masaOseaCuerpoPorc = (masaOseaCuerpoKg / pesoEstructuradoKg) * 100;
    const masaOseaCuerpoAjuste = diferenciaPEPesoBruto * masaOseaCuerpoPorc / 100;
    const masaOseaCuerpoKgAjustada = masaOseaCuerpoKg - masaOseaCuerpoAjuste;

    const masaOseaTotalPorc = (masaOseaTotalKg / pesoEstructuradoKg) * 100;
    const masaOseaTotalAjuste = diferenciaPEPesoBruto * masaOseaTotalPorc / 100;
    const masaOseaTotalKgAjustada = masaOseaTotalKg - masaOseaTotalAjuste;

    const pesoEstructuradoKgFinal = masaPielKgAjustada + masaAdiposaKgAjustada + masaMuscularKgAjustada +
        masaResidualKgAjustada + masaOseaCabezaKgAjustada + masaOseaCuerpoKgAjustada + masaOseaTotalKgAjustada;

    // === AJUSTE MASA ÓSEA (Re-ajuste) ===
    const masaOseaReferencia = masaOseaTotalKg; // Simplificado: usar la masa ósea calculada
    const morMoActual = masaOseaReferencia - masaOseaTotalKg;
    const suma4Masas = pesoEstructuradoKgFinal - masaOseaReferencia;

    const nuevoAdiposo = masaAdiposaKgAjustada / suma4Masas;
    const nuevoMuscular = masaMuscularKgAjustada / suma4Masas;
    const nuevoResidual = masaResidualKgAjustada / suma4Masas;
    const nuevoPiel = masaPielKgAjustada / suma4Masas;

    const adiposaReajustada = masaAdiposaKgAjustada - (morMoActual * nuevoAdiposo);
    const muscularReajustada = masaMuscularKgAjustada - (morMoActual * nuevoMuscular);
    const residualReajustada = masaResidualKgAjustada - (morMoActual * nuevoResidual);
    const oseaReajustada = masaOseaReferencia;
    const pielReajustada = masaPielKgAjustada - (morMoActual * nuevoPiel);

    const suma5MasasCorr = adiposaReajustada + muscularReajustada + residualReajustada + oseaReajustada + pielReajustada;

    // === ÍNDICES ===
    const tallaM = tallaCm / 100;
    const indicesAdiposa = adiposaReajustada / Math.pow(tallaM, 2);
    const indicesMuscular = muscularReajustada / Math.pow(tallaM, 2);
    const indicesResidual = residualReajustada / Math.pow(tallaM, 2);
    const indicesOsea = oseaReajustada / Math.pow(tallaM, 2);
    const indicesPiel = pielReajustada / Math.pow(tallaM, 2);
    const indicesMuscOseo = muscularReajustada / oseaReajustada;
    const indicesMuscLastre = muscularReajustada / (suma5MasasCorr - muscularReajustada);
    const indicesLastre = ((suma5MasasCorr - muscularReajustada) * 1000) / Math.pow(tallaCm, 2);

    // Estándar Musc/Óseo
    let indicesMuscOseoEstandar = "";
    if (categoria === "Reserva" || categoria === "Primera") {
        if (indicesMuscOseo >= 4.2) indicesMuscOseoEstandar = "Óptimo (excelente)";
        else if (indicesMuscOseo >= 3.9) indicesMuscOseoEstandar = "Bueno (a optimizar)";
        else indicesMuscOseoEstandar = "Aumentar (a mejorar)";
    } else if (categoria === "4ta") {
        if (indicesMuscOseo >= 4.2) indicesMuscOseoEstandar = "Óptimo (excelente)";
        else if (indicesMuscOseo >= 3.9) indicesMuscOseoEstandar = "Bueno (a optimizar)";
        else indicesMuscOseoEstandar = "Aumentar (a mejorar)";
    } else if (categoria === "5ta") {
        if (indicesMuscOseo >= 4.1) indicesMuscOseoEstandar = "Óptimo (excelente)";
        else if (indicesMuscOseo >= 3.8) indicesMuscOseoEstandar = "Bueno (a optimizar)";
        else indicesMuscOseoEstandar = "Aumentar (a mejorar)";
    } else if (categoria === "6ta") {
        if (indicesMuscOseo >= 4.0) indicesMuscOseoEstandar = "Óptimo (excelente)";
        else if (indicesMuscOseo >= 3.7) indicesMuscOseoEstandar = "Bueno (a optimizar)";
        else indicesMuscOseoEstandar = "Aumentar (a mejorar)";
    } else if (categoria === "7ma") {
        if (indicesMuscOseo >= 3.9) indicesMuscOseoEstandar = "Óptimo (excelente)";
        else if (indicesMuscOseo >= 3.6) indicesMuscOseoEstandar = "Bueno (a optimizar)";
        else indicesMuscOseoEstandar = "Aumentar (a mejorar)";
    } else if (categoria === "8va") {
        if (indicesMuscOseo >= 3.8) indicesMuscOseoEstandar = "Óptimo (excelente)";
        else if (indicesMuscOseo >= 3.5) indicesMuscOseoEstandar = "Bueno (a optimizar)";
        else indicesMuscOseoEstandar = "Aumentar (a mejorar)";
    } else if (categoria === "9na") {
        if (indicesMuscOseo >= 3.7) indicesMuscOseoEstandar = "Óptimo (excelente)";
        else if (indicesMuscOseo >= 3.4) indicesMuscOseoEstandar = "Bueno (a optimizar)";
        else indicesMuscOseoEstandar = "Aumentar (a mejorar)";
    }

    // Suma 6 Pliegues Estándar
    let suma6PlieguesEstandar = "";
    if (puesto === "Arquero") {
        if (["4ta", "5ta", "Reserva", "Primera"].includes(categoria)) {
            if (suma6Pliegues <= 50) suma6PlieguesEstandar = "Óptimo (excelente)";
            else if (suma6Pliegues <= 60) suma6PlieguesEstandar = "Bueno (a optimizar)";
            else suma6PlieguesEstandar = "Disminuir (a mejorar)";
        } else if (categoria === "6ta") {
            if (suma6Pliegues <= 55) suma6PlieguesEstandar = "Óptimo (excelente)";
            else if (suma6Pliegues <= 65) suma6PlieguesEstandar = "Bueno (a optimizar)";
            else suma6PlieguesEstandar = "Disminuir (a mejorar)";
        } else if (["7ma", "8va", "9na"].includes(categoria)) {
            if (suma6Pliegues <= 60) suma6PlieguesEstandar = "Óptimo (excelente)";
            else if (suma6Pliegues <= 70) suma6PlieguesEstandar = "Bueno (a optimizar)";
            else suma6PlieguesEstandar = "Disminuir (a mejorar)";
        }
    } else {
        if (["4ta", "5ta", "Reserva", "Primera"].includes(categoria)) {
            if (suma6Pliegues <= 40) suma6PlieguesEstandar = "Óptimo (excelente)";
            else if (suma6Pliegues <= 50) suma6PlieguesEstandar = "Bueno (a optimizar)";
            else suma6PlieguesEstandar = "Disminuir (a mejorar)";
        } else if (categoria === "6ta") {
            if (suma6Pliegues <= 45) suma6PlieguesEstandar = "Óptimo (excelente)";
            else if (suma6Pliegues <= 55) suma6PlieguesEstandar = "Bueno (a optimizar)";
            else suma6PlieguesEstandar = "Disminuir (a mejorar)";
        } else if (["7ma", "8va", "9na"].includes(categoria)) {
            if (suma6Pliegues <= 50) suma6PlieguesEstandar = "Óptimo (excelente)";
            else if (suma6Pliegues <= 60) suma6PlieguesEstandar = "Bueno (a optimizar)";
            else suma6PlieguesEstandar = "Disminuir (a mejorar)";
        }
    }

    // === SOMATOTIPO (Heath & Carter 1990) ===
    const sumSF = (triceps + subescapular + supraespinal) * 170.18 / tallaCm;
    const endomorphy = -0.7182 + (0.1451 * sumSF) - (0.00068 * Math.pow(sumSF, 2)) + (0.0000014 * Math.pow(sumSF, 3));
    const mesomorphy = (0.858 * humeralBiepicondilar) + (0.601 * femoralBiepicondilar) +
        (0.188 * perBrazoCorregido) + (0.161 * perPantorrillaCorregido) - (tallaCm * 0.131) + 4.5;
    const hwr = tallaCm / Math.pow(pesoBruto, 0.3333);
    const ectomorphy = hwr >= 40.75 ? (0.732 * hwr - 28.58) : (0.463 * hwr - 17.63);

    // === METABOLISMO BASAL ===
    const harrisBenedict = genero === "Hombre"
        ? 66 + (13.7 * pesoBruto) + (5 * tallaCm) - (6.8 * edad)
        : 655 + (9.6 * pesoBruto) + (1.7 * tallaCm) - (4.7 * edad);

    const harrisBenedictSedent = harrisBenedict * 1.3;
    const kleiber = 67.6 * Math.pow(pesoBruto, 0.75);
    const kleiberSedent = kleiber * 1.3;

    // Body Surface Area (Du Bois 1916)
    const bodySurfaceArea = 0.007184 * Math.pow(pesoBruto, 0.425) * Math.pow(tallaCm, 0.725);

    // Ponderal Index
    const ponderalIndex = Math.pow(pesoBruto, 0.3333) / tallaCm;

    // === CÁLCULOS EXTRA ===
    const adiposaT2 = masaAdiposaKgAjustada / Math.pow(tallaM, 2);
    const longPiernas = tallaCm - tallaSentado;
    const indiceCormico = (tallaSentado / tallaCm) * 100;
    const imc = pesoBruto / Math.pow(tallaM, 2);

    const indiceMAD = -9.236 + (0.0002708 * longPiernas * tallaSentado) -
        (0.001663 * edad * longPiernas) +
        (0.007216 * edad * tallaSentado) +
        (0.02292 * pesoBruto / tallaM);
    const edadPHV = edad - indiceMAD;

    let clasificacionMasculino = "";
    if (edadPHV < 13) clasificacionMasculino = "TEMP";
    else if (edadPHV < 15) clasificacionMasculino = "NORM";
    else clasificacionMasculino = "TARD";

    const edadEstimada = (clasificacionMasculino === "TEMP" || clasificacionMasculino === "NORM")
        ? edadPHV + 4
        : 3 + edadPHV;

    return {
        // Masa Piel
        masaPielKg: masaPielKgAjustada,
        masaPielPorc,

        // Masa Adiposa
        suma6Pliegues,
        suma6PlieguesEstandar,
        masaAdiposaKg: adiposaReajustada,
        masaAdiposaPorc,

        // Masa Muscular
        masaMuscularKg: muscularReajustada,
        masaMuscularPorc,

        // Masa Residual
        masaResidualKg: residualReajustada,
        masaResidualPorc,

        // Masa Ósea
        masaOseaTotalKg: oseaReajustada,
        masaOseaTotalPorc,

        // Peso Estructurado
        pesoEstructuradoKg: suma5MasasCorr,
        diferenciaPEPesoBruto: suma5MasasCorr - pesoBruto,
        porcDiferencia: ((suma5MasasCorr - pesoBruto) / pesoBruto) * 100,

        // Índices
        indicesMuscOseo,
        indicesMuscOseoEstandar,
        indicesAdiposa,
        indicesMuscular,
        indicesResidual,
        indicesOsea,
        indicesPiel,
        indicesMuscLastre,
        indicesLastre,

        // Somatotipo
        endomorphy,
        mesomorphy,
        ectomorphy,

        // Metabolismo
        harrisBenedict,
        harrisBenedictSedent,
        kleiber,
        kleiberSedent,
        bodySurfaceArea,
        ponderalIndex,

        // Extra
        imc,
        adiposaT2,
        longPiernas,
        indiceCormico,
        edadPHV,
        clasificacionMasculino,
        edadEstimada,
    };
}
