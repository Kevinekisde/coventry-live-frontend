import React, { useEffect, useState } from 'react';
import {
  Card, Row, Col, Statistic, Table, Tag, Progress,
  Tabs, Badge, Button, Skeleton, Empty, Divider, Tooltip,
} from 'antd';
import {
  TrophyOutlined, WarningOutlined, ArrowLeftOutlined,
  ThunderboltOutlined, SyncOutlined, AimOutlined,
  FireOutlined, CalendarOutlined, EnvironmentOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { partidosService } from '../../services/partidos.service';
import { statsService }    from '../../services/stats.service';

const PINK = '#ff4fb4';

const TIPO_LABEL = {
  ataque:      '⚡ Ataque',
  ace:         '🚀 Ace',
  bloqueo:     '🛡 Bloqueo',
  error_rival: '✅ Error rival',
  error_local: '❌ Error local',
  otro:        '• Otro',
};

const TIPO_COLOR = {
  ataque:      '#2563eb',
  ace:         '#16a34a',
  bloqueo:     '#7c3aed',
  error_rival: '#9ca3af',
  error_local: '#ef4444',
  otro:        '#6b7280',
};

const TIPO_ATAQUE_LABEL = {
  primer_tiempo:  '⚡ 1er tiempo',
  segundo_tiempo: '📐 2do tiempo',
  pipe:           '🔁 Pipe',
  finta:          '🤏 Finta',
  otro:           '• Otro',
};

const ZONAS_GRID = [4, 3, 2, 5, 6, 1];

// ── Mini heatmap de zonas ──────────────────────────────────────
function HeatmapZonas({ puntosPorZona, accentColor }) {
  const maxZona = Math.max(...Object.values(puntosPorZona), 1);
  return (
    <div>
      <div style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center', marginBottom: 6, letterSpacing: 1 }}>
        ── RED ──
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5, maxWidth: 210, margin: '0 auto' }}>
        {ZONAS_GRID.map((zona) => {
          const pts        = puntosPorZona[zona] || 0;
          const intensidad = pts / maxZona;
          const bg         = pts > 0 ? `rgba(${accentColor}, ${0.12 + intensidad * 0.75})` : '#f3f4f6';
          return (
            <Tooltip key={zona} title={`Zona ${zona}: ${pts} punto${pts !== 1 ? 's' : ''}`}>
              <div style={{
                height: 48, borderRadius: 8,
                background: bg,
                border: `1px solid ${pts > 0 ? `rgba(${accentColor}, 0.5)` : '#e5e7eb'}`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>Z{zona}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: pts > 0 ? `rgb(${accentColor})` : '#d1d5db' }}>
                  {pts}
                </span>
              </div>
            </Tooltip>
          );
        })}
      </div>
      <div style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center', marginTop: 6, letterSpacing: 1 }}>
        ── FONDO ──
      </div>
    </div>
  );
}

// ── Tabla jugadores ────────────────────────────────────────────
function TablaJugadores({ data, accentColor }) {
  const columns = [
    {
      title: '#',
      dataIndex: ['jugador', 'numeroCamiseta'],
      width: 44,
      render: (n) => <span style={{ fontWeight: 700, color: accentColor }}>{n}</span>,
    },
    {
      title: 'Jugador',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600 }}>{r.jugador.nombre} {r.jugador.apellido}</div>
          <Tag color="default" style={{ fontSize: 10, marginTop: 2 }}>{r.jugador.posicion}</Tag>
        </div>
      ),
    },
    {
      title: 'Pts',
      dataIndex: 'puntos',
      width: 56,
      sorter: (a, b) => b.puntos - a.puntos,
      render: (p) => (
        <Tag style={{
          background: accentColor, border: 'none',
          color: '#fff', fontWeight: 700, minWidth: 36, textAlign: 'center',
        }}>
          {p}
        </Tag>
      ),
    },
    {
      title: 'Err',
      key: 'errores',
      width: 56,
      render: (_, r) => {
        // buscar errores de este jugador en erroresPorJugador
        return <Tag color="default" style={{ minWidth: 36, textAlign: 'center' }}>—</Tag>;
      },
    },
  ];
  return (
    <Table
      columns={columns}
      dataSource={data}
      rowKey={(r) => r.jugador._id}
      pagination={false}
      size="small"
    />
  );
}

// ── Panel completo de un equipo ────────────────────────────────
function PanelEquipo({ data, esLocal, accentColorRgb, label }) {
  if (!data || data.totalPuntos === 0) {
    return <Empty description="Sin datos registrados" image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  const {
    puntosPorJugador, erroresPorJugador,
    puntoPorTipo, puntosPorZona, puntosPorTipoAtaque,
    eficienciaPorRotacion,
    pelotasLibres, pelotasLibresConvertidas, conversionPelotaLibre,
    doblesPositivas, doblesPositivasConvertidas, conversionDoblePositiva,
  } = data;

  const accentColor   = `rgb(${accentColorRgb})`;
  const totalTipo     = Object.values(puntoPorTipo).reduce((a, b) => a + b, 0);
  const totalTipoAtq  = Object.values(puntosPorTipoAtaque).reduce((a, b) => a + b, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* ── Conversión pelota libre / doble positiva ── */}
      <Row gutter={12}>
        <Col span={12}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>🏐 Pelota libre</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#2563eb' }}>
              {pelotasLibresConvertidas}
              <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 400 }}>/{pelotasLibres}</span>
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              {conversionPelotaLibre !== null ? `${conversionPelotaLibre}% conv.` : 'sin datos'}
            </div>
            {pelotasLibres > 0 && (
              <Progress percent={parseFloat(conversionPelotaLibre)} strokeColor="#2563eb"
                showInfo={false} size="small" style={{ marginTop: 6 }} />
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>⭐ Doble positiva</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#7c3aed' }}>
              {doblesPositivasConvertidas}
              <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 400 }}>/{doblesPositivas}</span>
            </div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>
              {conversionDoblePositiva !== null ? `${conversionDoblePositiva}% conv.` : 'sin datos'}
            </div>
            {doblesPositivas > 0 && (
              <Progress percent={parseFloat(conversionDoblePositiva)} strokeColor="#7c3aed"
                showInfo={false} size="small" style={{ marginTop: 6 }} />
            )}
          </Card>
        </Col>
      </Row>

      {/* ── Tipo de finalización ── */}
      <Card
        size="small"
        title={<span style={{ fontSize: 13 }}><ThunderboltOutlined style={{ color: '#f59e0b', marginRight: 6 }} />Cómo se ganaron los puntos</span>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {Object.entries(puntoPorTipo)
            .filter(([, v]) => v > 0)
            .sort(([, a], [, b]) => b - a)
            .map(([tipo, cantidad]) => (
              <div key={tipo}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 12, color: '#374151' }}>{TIPO_LABEL[tipo]}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: TIPO_COLOR[tipo] }}>
                    {cantidad} ({Math.round((cantidad / totalTipo) * 100)}%)
                  </span>
                </div>
                <Progress percent={Math.round((cantidad / totalTipo) * 100)}
                  strokeColor={TIPO_COLOR[tipo]} showInfo={false} size="small" />
              </div>
            ))}
        </div>
      </Card>

      <Row gutter={12}>
        {/* ── Zona del ataque ── */}
        <Col span={12}>
          <Card size="small"
            title={<span style={{ fontSize: 13 }}><AimOutlined style={{ color: '#2563eb', marginRight: 6 }} />Zona del ataque</span>}
          >
            <HeatmapZonas puntosPorZona={puntosPorZona} accentColor={accentColorRgb} />
          </Card>
        </Col>

        {/* ── Tipo de ataque ── */}
        <Col span={12}>
          <Card size="small"
            title={<span style={{ fontSize: 13 }}><FireOutlined style={{ color: '#ef4444', marginRight: 6 }} />Tipo de ataque</span>}
          >
            {totalTipoAtq === 0 ? (
              <span style={{ color: '#9ca3af', fontSize: 12 }}>Sin datos</span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {Object.entries(puntosPorTipoAtaque)
                  .filter(([, v]) => v > 0)
                  .sort(([, a], [, b]) => b - a)
                  .map(([tipo, cantidad]) => (
                    <div key={tipo}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 11, color: '#374151' }}>{TIPO_ATAQUE_LABEL[tipo]}</span>
                        <span style={{ fontSize: 11, fontWeight: 600 }}>
                          {cantidad} ({Math.round((cantidad / totalTipoAtq) * 100)}%)
                        </span>
                      </div>
                      <Progress percent={Math.round((cantidad / totalTipoAtq) * 100)}
                        strokeColor={accentColor} showInfo={false} size="small" />
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* ── Eficiencia por rotación (solo local) ── */}
      {esLocal && (
        <Card size="small"
          title={<span style={{ fontSize: 13 }}><SyncOutlined style={{ color: '#7c3aed', marginRight: 6 }} />Eficiencia por rotación</span>}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
            {eficienciaPorRotacion.map(({ rotacion, puntos, errores, pct }) => {
              const tieneData = puntos + errores > 0;
              const color = !tieneData ? '#9ca3af'
                : pct >= 60 ? '#16a34a'
                : pct >= 40 ? '#f59e0b'
                : '#ef4444';
              return (
                <Tooltip key={rotacion}
                  title={tieneData ? `Rot. ${rotacion}: ${puntos} pts / ${errores} err — ${pct}%` : `Sin datos`}
                >
                  <div style={{
                    textAlign: 'center', padding: '8px 4px', borderRadius: 8,
                    background: tieneData ? `${color}18` : '#f9fafb',
                    border: `1px solid ${tieneData ? color : '#e5e7eb'}`,
                  }}>
                    <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 600 }}>R{rotacion}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color, lineHeight: 1.3 }}>
                      {tieneData ? `${pct}%` : '—'}
                    </div>
                    <div style={{ fontSize: 9, color: '#9ca3af' }}>
                      {tieneData ? `${puntos}/${puntos + errores}` : ''}
                    </div>
                  </div>
                </Tooltip>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
            {[['#16a34a', '≥60%'], ['#f59e0b', '40–59%'], ['#ef4444', '<40%']].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                <span style={{ fontSize: 10, color: '#6b7280' }}>{l}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Anotadores ── */}
      {puntosPorJugador.length > 0 && (
        <Card size="small"
          title={<span style={{ fontSize: 13 }}><TrophyOutlined style={{ color: accentColor, marginRight: 6 }} />Anotadores</span>}
        >
          <Table
            columns={[
              {
                title: '#', dataIndex: ['jugador', 'numeroCamiseta'], width: 44,
                render: (n) => <span style={{ fontWeight: 700, color: accentColor }}>{n}</span>,
              },
              {
                title: 'Jugador',
                render: (_, r) => (
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.jugador.nombre} {r.jugador.apellido}</div>
                    <Tag color="default" style={{ fontSize: 10 }}>{r.jugador.posicion}</Tag>
                  </div>
                ),
              },
              {
                title: 'Pts', dataIndex: 'puntos', width: 56,
                sorter: (a, b) => b.puntos - a.puntos,
                defaultSortOrder: 'ascend',
                render: (p) => (
                  <Tag style={{
                    background: accentColor, border: 'none',
                    color: '#fff', fontWeight: 700, minWidth: 36, textAlign: 'center',
                  }}>{p}</Tag>
                ),
              },
            ]}
            dataSource={puntosPorJugador}
            rowKey={(r) => r.jugador._id}
            pagination={false} size="small"
          />
        </Card>
      )}

      {/* ── Errores ── */}
      {erroresPorJugador.length > 0 && (
        <Card size="small"
          title={<span style={{ fontSize: 13 }}><WarningOutlined style={{ color: '#ef4444', marginRight: 6 }} />Errores por jugador</span>}
        >
          <Table
            columns={[
              {
                title: '#', dataIndex: ['jugador', 'numeroCamiseta'], width: 44,
                render: (n) => <span style={{ fontWeight: 700, color: '#ef4444' }}>{n}</span>,
              },
              {
                title: 'Jugador',
                render: (_, r) => (
                  <span style={{ fontWeight: 500 }}>{r.jugador.nombre} {r.jugador.apellido}</span>
                ),
              },
              {
                title: 'Err', dataIndex: 'errores', width: 56,
                render: (e) => (
                  <Tag color="red" style={{ fontWeight: 700, minWidth: 36, textAlign: 'center' }}>{e}</Tag>
                ),
              },
            ]}
            dataSource={erroresPorJugador}
            rowKey={(r) => r.jugador._id}
            pagination={false} size="small"
          />
        </Card>
      )}
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────
export default function ResumenPartido() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [partido,  setPartido]  = useState(null);
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resPartido, resStats] = await Promise.all([
          partidosService.obtener(id),
          statsService.partido(id),
        ]);
        setPartido(resPartido.data);
        setStats(resStats.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  if (loading) return <Skeleton active />;
  if (!partido || !stats) return <Empty description="No se pudo cargar el resumen" />;

  const { resumen, local, rival, sets } = stats;
  const esVictoria = partido.resultado === 'victoria';

  const tabItems = [
    {
      key: 'resumen',
      label: '📊 Resumen',
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
          {/* Sets jugados */}
          <Card size="small" title="Sets jugados">
            <Table
              dataSource={sets}
              rowKey="_id"
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Set', dataIndex: 'numero', width: 60,
                  render: (n) => <span style={{ fontWeight: 700 }}>Set {n}</span>,
                },
                {
                  title: 'Atlético Coventry',
                  dataIndex: 'puntosLocal',
                  render: (p, s) => (
                    <span style={{
                      fontWeight: 700, fontSize: 18,
                      color: s.ganador === 'local' ? PINK : '#6b7280',
                    }}>
                      {p}
                    </span>
                  ),
                },
                {
                  title: partido.rival,
                  dataIndex: 'puntosRival',
                  render: (p, s) => (
                    <span style={{
                      fontWeight: 700, fontSize: 18,
                      color: s.ganador === 'rival' ? '#6366f1' : '#6b7280',
                    }}>
                      {p}
                    </span>
                  ),
                },
                {
                  title: 'Ganador', dataIndex: 'ganador',
                  render: (g) => (
                    <Tag color={g === 'local' ? 'pink' : 'purple'}>
                      {g === 'local' ? 'Atlético Coventry' : partido.rival}
                    </Tag>
                  ),
                },
              ]}
            />
          </Card>

          {/* Stats globales */}
          <Row gutter={12}>
            <Col span={6}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic title="Puntos Coventry" value={resumen.puntosLocal}
                  valueStyle={{ color: PINK, fontWeight: 700 }} />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic title={`Puntos ${partido.rival}`} value={resumen.puntosRival}
                  valueStyle={{ color: '#6366f1', fontWeight: 700 }} />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic title="Side-out %" value={resumen.sideOutPct} suffix="%"
                  valueStyle={{
                    color: resumen.sideOutPct >= 50 ? '#16a34a' : '#dc2626',
                    fontWeight: 700,
                  }} />
              </Card>
            </Col>
            <Col span={6}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic title="Total rallies" value={resumen.totalRallies}
                  valueStyle={{ color: '#374151', fontWeight: 700 }} />
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: 'local',
      label: <span style={{ color: PINK, fontWeight: 600 }}>🏐 Coventry</span>,
      children: (
        <div style={{ marginTop: 16 }}>
          <PanelEquipo data={local} esLocal accentColorRgb="255,79,180" label="Atlético Coventry" />
        </div>
      ),
    },
    {
      key: 'rival',
      label: <span style={{ fontWeight: 600 }}>🔵 {partido.rival}</span>,
      children: (
        <div style={{ marginTop: 16 }}>
          <PanelEquipo data={rival} esLocal={false} accentColorRgb="99,102,241" label={partido.rival} />
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate('/partidos')} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>
              Resumen del partido
            </h1>
            <Badge
              color={esVictoria ? '#16a34a' : '#ef4444'}
              text={
                <span style={{
                  fontWeight: 700,
                  color: esVictoria ? '#16a34a' : '#ef4444',
                }}>
                  {esVictoria ? '🏆 Victoria' : '❌ Derrota'}
                </span>
              }
            />
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              {dayjs(partido.fecha).format('DD [de] MMMM [de] YYYY')}
            </span>
            {partido.cancha && (
              <span style={{ fontSize: 13, color: '#6b7280' }}>
                <EnvironmentOutlined style={{ marginRight: 4 }} />
                {partido.cancha}
              </span>
            )}
            {partido.torneo && (
              <Tag color="blue">{partido.torneo}</Tag>
            )}
            <Tag color="default">{partido.categoria}</Tag>
          </div>
        </div>
      </div>

      {/* ── Scoreboard final ── */}
      <div style={{
        background: `linear-gradient(135deg, #0d0d0d, #000101)`,
        borderRadius: 16, padding: '28px 36px', color: '#fff',
        border: '1px solid rgba(255,79,180,0.15)',
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center', gap: 24,
        }}>
          {/* Coventry */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: PINK, fontSize: 11, fontWeight: 700, letterSpacing: 2, marginBottom: 8 }}>
              ATLÉTICO COVENTRY
            </div>
            <div style={{ fontSize: 72, fontWeight: 900, color: PINK, lineHeight: 1,
              textShadow: `0 0 40px ${PINK}55` }}>
              {partido.setsGanados}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>SETS GANADOS</div>
          </div>

          {/* Centro */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>
              {partido.tipo} · mejor de {partido.mejorDe}
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, color: 'rgba(255,255,255,0.2)' }}>–</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
              {resumen.puntosLocal} – {resumen.puntosRival} pts totales
            </div>
          </div>

          {/* Rival */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700,
              letterSpacing: 2, marginBottom: 8 }}>
              {partido.rival.toUpperCase()}
            </div>
            <div style={{ fontSize: 72, fontWeight: 900, color: '#fff', lineHeight: 1,
              textShadow: '0 0 40px rgba(255,255,255,0.15)' }}>
              {partido.setsPerdidos}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>SETS GANADOS</div>
          </div>
        </div>
      </div>

      {/* ── Tabs de análisis ── */}
      <Card bodyStyle={{ padding: '0 16px 16px' }}>
        <Tabs defaultActiveKey="resumen" items={tabItems} />
      </Card>

    </div>
  );
}
