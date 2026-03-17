import { useState, useMemo } from "react";
import Card from "../Card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function DashPhysicalPreparation({ division, date, submissions, athletesInDivision }) {
    const [selectedAthleteId, setSelectedAthleteId] = useState(athletesInDivision[0]?.athleteId || "");

    // Filter submissions by type
    const strengthRows = submissions.filter(s => s.templateId === "ft_pf_strength" && s.division === division);
    const jumpsRows = submissions.filter(s => s.templateId === "ft_pf_jumps" && s.division === division);
    const fieldRows = submissions.filter(s => s.templateId === "ft_pf_field" && s.division === division);

    // Get athlete submissions sorted by date
    const athleteStrength = useMemo(() => {
        return strengthRows
            .filter(r => r.subjectId === selectedAthleteId)
            .sort((a, b) => a.date.localeCompare(b.date))
            .map(r => ({
                date: r.date,
                pressPlano: Number(r.values?.pressPlanoKg ?? 0),
                dominadas: Number(r.values?.dominadasKg ?? 0),
                sentadillas: Number(r.values?.sentadillasKg ?? 0),
                pesoMuerto: Number(r.values?.pesoMuertoKg ?? 0)
            }));
    }, [strengthRows, selectedAthleteId]);

    const athleteJumps = useMemo(() => {
        return jumpsRows
            .filter(r => r.subjectId === selectedAthleteId)
            .sort((a, b) => a.date.localeCompare(b.date))
            .map(r => ({
                date: r.date,
                broadJump: Number(r.values?.broadJumpCm ?? 0),
                verticalJump: Number(r.values?.verticalJumpCm ?? 0)
            }));
    }, [jumpsRows, selectedAthleteId]);

    const athleteField = useMemo(() => {
        return fieldRows
            .filter(r => r.subjectId === selectedAthleteId)
            .sort((a, b) => a.date.localeCompare(b.date))
            .map(r => ({
                date: r.date,
                bronco: Number(r.values?.broncoSec ?? 0),
                yoyo: Number(r.values?.yoyoIR1 ?? 0),
                velocidad: Number(r.values?.velocidad10mSec ?? 0)
            }));
    }, [fieldRows, selectedAthleteId]);

    // Latest values for summary cards
    const latestStrength = athleteStrength[athleteStrength.length - 1];
    const latestJumps = athleteJumps[athleteJumps.length - 1];
    const latestField = athleteField[athleteField.length - 1];

    // Coverage stats
    const strengthCoverage = new Set(strengthRows.map(r => r.subjectId)).size;
    const jumpsCoverage = new Set(jumpsRows.map(r => r.subjectId)).size;
    const fieldCoverage = new Set(fieldRows.map(r => r.subjectId)).size;

    return (
        <div className="container">
            <div style={{ display: "grid", gap: 12 }}>
                {/* Coverage Card */}
                <Card title="Cobertura de Evaluaciones" subtitle={`División ${division}`}>
                    <div className="row" style={{ gap: 16 }}>
                        <div>
                            <div style={{ fontWeight: 700 }}>Fuerza</div>
                            <div className="small">{strengthCoverage} atletas</div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 700 }}>Saltos</div>
                            <div className="small">{jumpsCoverage} atletas</div>
                        </div>
                        <div>
                            <div style={{ fontWeight: 700 }}>Campo</div>
                            <div className="small">{fieldCoverage} atletas</div>
                        </div>
                    </div>
                </Card>

                {/* Athlete Selector */}
                <Card title="Análisis Individual" subtitle="Seleccionar atleta para ver evolución">
                    <div className="row">
                        <span className="small">Atleta:</span>
                        <select
                            className="select"
                            value={selectedAthleteId}
                            onChange={(e) => setSelectedAthleteId(e.target.value)}
                            style={{ minWidth: 200 }}
                        >
                            {athletesInDivision.map(a => (
                                <option key={a.athleteId} value={a.athleteId}>{a.name}</option>
                            ))}
                        </select>
                    </div>
                </Card>

                {/* Latest Values Summary */}
                {(latestStrength || latestJumps || latestField) && (
                    <Card title="Últimos Valores Registrados" subtitle={athletesInDivision.find(a => a.athleteId === selectedAthleteId)?.name}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                            {/* Strength */}
                            <div>
                                <div style={{ fontWeight: 700, marginBottom: 8 }}>Fuerza</div>
                                {latestStrength ? (
                                    <div className="small">
                                        <div>Press Plano: {latestStrength.pressPlano} kg</div>
                                        <div>Dominadas: {latestStrength.dominadas} kg</div>
                                        <div>Sentadillas: {latestStrength.sentadillas} kg</div>
                                        <div>Peso Muerto: {latestStrength.pesoMuerto} kg</div>
                                        <div style={{ marginTop: 4, color: "#6b7280" }}>({latestStrength.date})</div>
                                    </div>
                                ) : (
                                    <div className="small" style={{ color: "#6b7280" }}>Sin datos</div>
                                )}
                            </div>

                            {/* Jumps */}
                            <div>
                                <div style={{ fontWeight: 700, marginBottom: 8 }}>Saltos</div>
                                {latestJumps ? (
                                    <div className="small">
                                        <div>Broad Jump: {latestJumps.broadJump} cm</div>
                                        <div>Vertical Jump: {latestJumps.verticalJump} cm</div>
                                        <div style={{ marginTop: 4, color: "#6b7280" }}>({latestJumps.date})</div>
                                    </div>
                                ) : (
                                    <div className="small" style={{ color: "#6b7280" }}>Sin datos</div>
                                )}
                            </div>

                            {/* Field */}
                            <div>
                                <div style={{ fontWeight: 700, marginBottom: 8 }}>Campo</div>
                                {latestField ? (
                                    <div className="small">
                                        <div>Bronco: {latestField.bronco} seg</div>
                                        <div>Yo-Yo IR1: {latestField.yoyo}</div>
                                        <div>Velocidad 10m: {latestField.velocidad} seg</div>
                                        <div style={{ marginTop: 4, color: "#6b7280" }}>({latestField.date})</div>
                                    </div>
                                ) : (
                                    <div className="small" style={{ color: "#6b7280" }}>Sin datos</div>
                                )}
                            </div>
                        </div>
                    </Card>
                )}

                {/* Strength Evolution Chart */}
                {athleteStrength.length > 0 && (
                    <Card title="Evolución de Fuerza" subtitle="Progreso en ejercicios de fuerza (Kg)">
                        {athleteStrength.length < 2 ? (
                            <div className="small">Se necesitan al menos 2 mediciones para mostrar evolución.</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={athleteStrength}>
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="pressPlano" stroke="#ef4444" name="Press Plano (kg)" strokeWidth={2} />
                                    <Line type="monotone" dataKey="dominadas" stroke="#3b82f6" name="Dominadas (kg)" strokeWidth={2} />
                                    <Line type="monotone" dataKey="sentadillas" stroke="#10b981" name="Sentadillas (kg)" strokeWidth={2} />
                                    <Line type="monotone" dataKey="pesoMuerto" stroke="#f59e0b" name="Peso Muerto (kg)" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                )}

                {/* Jumps Evolution Chart */}
                {athleteJumps.length > 0 && (
                    <Card title="Evolución de Saltos" subtitle="Progreso en tests de salto (cm)">
                        {athleteJumps.length < 2 ? (
                            <div className="small">Se necesitan al menos 2 mediciones para mostrar evolución.</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={athleteJumps}>
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="broadJump" fill="#3b82f6" name="Broad Jump (cm)" />
                                    <Bar dataKey="verticalJump" fill="#10b981" name="Vertical Jump (cm)" />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                )}

                {/* Field Tests Evolution Chart */}
                {athleteField.length > 0 && (
                    <Card title="Evolución de Tests de Campo" subtitle="Progreso en evaluaciones de campo">
                        {athleteField.length < 2 ? (
                            <div className="small">Se necesitan al menos 2 mediciones para mostrar evolución.</div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={athleteField}>
                                    <XAxis dataKey="date" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="bronco" stroke="#ef4444" name="Bronco (seg)" strokeWidth={2} />
                                    <Line yAxisId="right" type="monotone" dataKey="yoyo" stroke="#3b82f6" name="Yo-Yo IR1" strokeWidth={2} />
                                    <Line yAxisId="left" type="monotone" dataKey="velocidad" stroke="#10b981" name="Velocidad 10m (seg)" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </Card>
                )}

                {/* No data message */}
                {!latestStrength && !latestJumps && !latestField && (
                    <Card title="Sin Datos" subtitle="No hay evaluaciones para este atleta">
                        <div className="small">Cargá evaluaciones de fuerza, saltos o campo para ver los análisis.</div>
                    </Card>
                )}
            </div>
        </div>
    );
}
