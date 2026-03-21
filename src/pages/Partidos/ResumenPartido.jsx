import React, { useEffect, useState } from 'react';
import {
  Card, Row, Col, Statistic, Table, Tag, Progress,
  Tabs, Badge, Button, Skeleton, Empty, Tooltip, Grid, Collapse,
} from 'antd';
import {
  TrophyOutlined, WarningOutlined, ArrowLeftOutlined,
  ThunderboltOutlined, SyncOutlined, AimOutlined,
  FireOutlined, CalendarOutlined, EnvironmentOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { partidosService } from '../../services/partidos.service';
import { statsService }    from '../../services/stats.service';

dayjs.locale('es');

const { useBreakpoint } = Grid;
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

// ── Heatmap zonas ──────────────────────────────────────────────
function HeatmapZonas({ puntosPorZona, accentColor }) {
  const maxZona = Math.max(...Object.values(puntosPorZona), 1);
  return (
    <div>
      <div style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center', marginBottom: 6, letterSpacing: 1 }}>
        ── RED ──
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, maxWidth: 200, margin: '0 auto' }}>
        {ZONAS_GRID.map((zona) => {
          const pts        = puntosPorZona[zona] || 0;
          const intensidad = pts / maxZona;
          const bg         = pts > 0 ? `rgba(${accentColor}, ${0.12 + intensidad * 0.75})` : '#f3f4f6';
          return (
            <Tooltip key={zona} title={`Zona ${zona}: ${pts} punto${pts !== 1 ? 's' : ''}`}>
              <div style={{
                height: 44, borderRadius: 8, background: bg,
                border: `1px solid ${pts > 0 ? `rgba(${accentColor}, 0.5)` : '#e5e7eb'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 9, color: '#9ca3af', fontWeight: 600 }}>Z{zona}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: pts > 0 ? `rgb(${accentColor})` : '#d1d5db' }}>
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

// ── Panel equipo ───────────────────────────────────────────────
function PanelEquipo({ data, esLocal, accentColorRgb, isMobile }) {
  if (!data || data.totalPuntos === 0)
    return <Empty description="Sin datos registrados" image={Empty.PRESENTED_IMAGE_SIMPLE} />;

  const {
    puntosPorJugador, erroresPorJugador, puntoPorTipo,
    puntosPorZona, puntosPorTipoAtaque, eficienciaPorRotacion,
    pelotasLibres, pelotasLibresConvertidas, conversionPelotaLibre,
    doblesPositivas, doblesPositivasConvertidas, conversionDoblePositiva,
  } = data;

  const accentColor  = `rgb(${accentColorRgb})`;
  const totalTipo    = Object.values(puntoPorTipo).reduce((a, b) => a + b, 0);
  const totalTipoAtq = Object.values(puntosPorTipoAtaque).reduce((a, b) => a + b, 0);

  const colsAnotadores = [
    {
      title: '#', dataIndex: ['jugador', 'numeroCamiseta'], width: 40,
      render: (n) => <span style={{ fontWeight: 700, color: accentColor }}>{n}</span>,
    },
    {
      title: 'Jugador',
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: isMobile ? 12 : 13 }}>
            {r.jugador.nombre} {r.jugador.apellido}
          </div>
          {!isMobile && <Tag color="default" style={{ fontSize: 10 }}>{r.jugador.posicion}</Tag>}
        </div>
      ),
    },
    {
      title: 'Pts', dataIndex: 'puntos', width: 52,
      sorter: (a, b) => b.puntos - a.puntos, defaultSortOrder: 'ascend',
      render: (p) => (
        <Tag style={{ background: accentColor, border: 'none', color: '#fff', fontWeight: 700, minWidth: 32, textAlign: 'center' }}>
          {p}
        </Tag>
      ),
    },
  ];

  const colsErrores = [
    {
      title: '#', dataIndex: ['jugador', 'numeroCamiseta'], width: 40,
      render: (n) => <span style={{ fontWeight: 700, color: '#ef4444' }}>{n}</span>,
    },
    {
      title: 'Jugador',
      render: (_, r) => (
        <span style={{ fontWeight: 500, fontSize: isMobile ? 12 : 13 }}>
          {r.jugador.nombre} {r.jugador.apellido}
        </span>
      ),
    },
    {
      title: 'Err', dataIndex: 'errores', width: 52,
      render: (e) => (
        <Tag color="red" style={{ fontWeight: 700, minWidth: 32, textAlign: 'center' }}>{e}</Tag>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Row gutter={[8, 8]}>
        <Col span={12}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 3 }}>🏐 Pelota libre</div>
            <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: '#2563eb' }}>
              {pelotasLibresConvertidas}
              <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 400 }}>/{pelotasLibres}</span>
            </div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>
              {conversionPelotaLibre !== null ? `${conversionPelotaLibre}% conv.` : 'sin datos'}
            </div>
            {pelotasLibres > 0 && (
              <Progress percent={parseFloat(conversionPelotaLibre)} strokeColor="#2563eb"
                showInfo={false} size="small" style={{ marginTop: 4 }} />
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 3 }}>⭐ Doble positiva</div>
            <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: '#7c3aed' }}>
              {doblesPositivasConvertidas}
              <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 400 }}>/{doblesPositivas}</span>
            </div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>
              {conversionDoblePositiva !== null ? `${conversionDoblePositiva}% conv.` : 'sin datos'}
            </div>
            {doblesPositivas > 0 && (
              <Progress percent={parseFloat(conversionDoblePositiva)} strokeColor="#7c3aed"
                showInfo={false} size="small" style={{ marginTop: 4 }} />
            )}
          </Card>
        </Col>
      </Row>

      <Card size="small"
        title={<span style={{ fontSize: 12 }}><ThunderboltOutlined style={{ color: '#f59e0b', marginRight: 5 }} />Cómo se ganaron los puntos</span>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {Object.entries(puntoPorTipo).filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a).map(([tipo, cantidad]) => (
            <div key={tipo}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ fontSize: 11, color: '#374151' }}>{TIPO_LABEL[tipo]}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: TIPO_COLOR[tipo] }}>
                  {cantidad} ({Math.round((cantidad / totalTipo) * 100)}%)
                </span>
              </div>
              <Progress percent={Math.round((cantidad / totalTipo) * 100)}
                strokeColor={TIPO_COLOR[tipo]} showInfo={false} size="small" />
            </div>
          ))}
        </div>
      </Card>

      <Row gutter={[8, 8]}>
        <Col xs={24} sm={12}>
          <Card size="small"
            title={<span style={{ fontSize: 12 }}><AimOutlined style={{ color: '#2563eb', marginRight: 5 }} />Zona del ataque</span>}
          >
            <HeatmapZonas puntosPorZona={puntosPorZona} accentColor={accentColorRgb} />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card size="small"
            title={<span style={{ fontSize: 12 }}><FireOutlined style={{ color: '#ef4444', marginRight: 5 }} />Tipo de ataque</span>}
          >
            {totalTipoAtq === 0 ? (
              <span style={{ color: '#9ca3af', fontSize: 12 }}>Sin datos</span>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {Object.entries(puntosPorTipoAtaque).filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a).map(([tipo, cantidad]) => (
                  <div key={tipo}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
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

      {esLocal && (
        <Card size="small"
          title={<span style={{ fontSize: 12 }}><SyncOutlined style={{ color: '#7c3aed', marginRight: 5 }} />Eficiencia por rotación</span>}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: isMobile ? 4 : 6 }}>
            {eficienciaPorRotacion.map(({ rotacion, puntos, errores, pct }) => {
              const tieneData = puntos + errores > 0;
              const color = !tieneData ? '#9ca3af' : pct >= 60 ? '#16a34a' : pct >= 40 ? '#f59e0b' : '#ef4444';
              return (
                <Tooltip key={rotacion} title={tieneData ? `Rot. ${rotacion}: ${puntos} pts / ${errores} err — ${pct}%` : 'Sin datos'}>
                  <div style={{
                    textAlign: 'center', padding: isMobile ? '6px 2px' : '8px 4px', borderRadius: 8,
                    background: tieneData ? `${color}18` : '#f9fafb',
                    border: `1px solid ${tieneData ? color : '#e5e7eb'}`,
                  }}>
                    <div style={{ fontSize: 9, color: '#6b7280', fontWeight: 600 }}>R{rotacion}</div>
                    <div style={{ fontSize: isMobile ? 13 : 16, fontWeight: 700, color, lineHeight: 1.3 }}>
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
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 8 }}>
            {[['#16a34a', '≥60%'], ['#f59e0b', '40–59%'], ['#ef4444', '<40%']].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: c }} />
                <span style={{ fontSize: 10, color: '#6b7280' }}>{l}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {puntosPorJugador.length > 0 && (
        <Card size="small"
          title={<span style={{ fontSize: 12 }}><TrophyOutlined style={{ color: accentColor, marginRight: 5 }} />Anotadores</span>}
        >
          <Table columns={colsAnotadores} dataSource={puntosPorJugador}
            rowKey={(r) => r.jugador._id} pagination={false} size="small" />
        </Card>
      )}

      {erroresPorJugador.length > 0 && (
        <Card size="small"
          title={<span style={{ fontSize: 12 }}><WarningOutlined style={{ color: '#ef4444', marginRight: 5 }} />Errores por jugador</span>}
        >
          <Table columns={colsErrores} dataSource={erroresPorJugador}
            rowKey={(r) => r.jugador._id} pagination={false} size="small" />
        </Card>
      )}
    </div>
  );
}

// ── Fila individual de rally ───────────────────────────────────
function FilaRally({ rally, idx, rivalNombre, isMobile }) {
  const esLocal = rally.equipoGanador === 'local';

  return (
    <div style={{
      display: 'flex', gap: isMobile ? 8 : 12,
      padding: isMobile ? '8px 6px' : '10px 12px',
      borderRadius: 8,
      background: esLocal ? 'rgba(255,79,180,0.04)' : 'rgba(239,68,68,0.04)',
      border: `1px solid ${esLocal ? 'rgba(255,79,180,0.12)' : 'rgba(239,68,68,0.1)'}`,
      alignItems: 'flex-start',
    }}>

      {/* Número */}
      <div style={{
        width: isMobile ? 22 : 26, height: isMobile ? 22 : 26,
        borderRadius: '50%', flexShrink: 0,
        background: esLocal ? PINK : '#ef4444',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 700, fontSize: isMobile ? 10 : 11, marginTop: 2,
      }}>
        {idx + 1}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Fila principal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: isMobile ? 14 : 16, color: '#1f2937' }}>
              <span style={{ color: PINK }}>{rally.marcadorLocal}</span>
              <span style={{ color: '#9ca3af', fontWeight: 400 }}> – </span>
              <span style={{ color: '#6b7280' }}>{rally.marcadorRival}</span>
            </span>
            <Tag style={{
              background: esLocal ? PINK : '#ef4444',
              border: 'none', color: '#fff',
              fontSize: 10, fontWeight: 600, margin: 0, padding: '0 6px',
            }}>
              {esLocal ? 'COV' : rivalNombre.split(' ')[0]}
            </Tag>
          </div>
          <Tag style={{
            color: TIPO_COLOR[rally.tipoFinalizacion],
            borderColor: TIPO_COLOR[rally.tipoFinalizacion],
            background: `${TIPO_COLOR[rally.tipoFinalizacion]}12`,
            fontSize: 10, margin: 0, flexShrink: 0,
          }}>
            {TIPO_LABEL[rally.tipoFinalizacion]}
          </Tag>
        </div>

        {/* Detalles */}
        <div style={{ display: 'flex', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
          {rally.jugadorPunto && (
            <Tag icon={<TrophyOutlined />} color="gold" style={{ fontSize: 10, margin: 0 }}>
              #{rally.jugadorPunto.numeroCamiseta} {rally.jugadorPunto.nombre}
              {!isMobile && ` ${rally.jugadorPunto.apellido}`}
            </Tag>
          )}
          {rally.jugadorError && (
            <Tag icon={<WarningOutlined />} color="red" style={{ fontSize: 10, margin: 0 }}>
              Error: #{rally.jugadorError.numeroCamiseta} {rally.jugadorError.nombre}
            </Tag>
          )}
          {rally.zonaAtaque && (
            <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>📍 Z{rally.zonaAtaque}</Tag>
          )}
          {rally.tipoAtaque && (
            <Tag color="purple" style={{ fontSize: 10, margin: 0 }}>
              {TIPO_ATAQUE_LABEL[rally.tipoAtaque]}
            </Tag>
          )}
          {rally.pelotaLibre && (
            <Tag color="cyan" style={{ fontSize: 10, margin: 0 }}>🏐 P. libre</Tag>
          )}
          {rally.doblePositiva && (
            <Tag color="geekblue" style={{ fontSize: 10, margin: 0 }}>⭐ Doble +</Tag>
          )}
          {rally.rotacionLocal && (
            <Tag color="default" style={{ fontSize: 10, margin: 0 }}>R{rally.rotacionLocal}</Tag>
          )}
        </div>

        {/* Notas */}
        {rally.notas && (
          <div style={{
            marginTop: 5, fontSize: 11, color: '#6b7280', fontStyle: 'italic',
            background: '#f9fafb', borderRadius: 4, padding: '3px 8px',
            borderLeft: '2px solid #e5e7eb',
          }}>
            "{rally.notas}"
          </div>
        )}
      </div>
    </div>
  );
}

// ── Mini resumen de tipos al pie de cada set ───────────────────
function ResumenTiposSet({ rallies }) {
  const conteo = rallies.reduce((acc, r) => {
    acc[r.tipoFinalizacion] = (acc[r.tipoFinalizacion] || 0) + 1;
    return acc;
  }, {});
  const total = rallies.length;
  if (total === 0) return null;

  return (
    <div style={{
      marginTop: 12, padding: '10px 12px', borderRadius: 8,
      background: '#f8fafc', border: '1px solid #e5e7eb',
    }}>
      <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>
        Resumen del set
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {Object.entries(conteo).sort(([, a], [, b]) => b - a).map(([tipo, cant]) => (
          <Tooltip key={tipo} title={TIPO_LABEL[tipo]}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: `${TIPO_COLOR[tipo]}14`,
              border: `1px solid ${TIPO_COLOR[tipo]}40`,
              borderRadius: 6, padding: '3px 8px',
            }}>
              <span style={{ fontSize: 11, color: TIPO_COLOR[tipo], fontWeight: 600 }}>{cant}</span>
              <span style={{ fontSize: 10, color: '#6b7280' }}>
                {TIPO_LABEL[tipo]} ({Math.round((cant / total) * 100)}%)
              </span>
            </div>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}

// ── Sección punto a punto ──────────────────────────────────────
function SeccionRallies({ ralliesPorSet, rivalNombre, isMobile }) {
  if (!ralliesPorSet || ralliesPorSet.length === 0)
    return <Empty description="Sin rallies registrados" image={Empty.PRESENTED_IMAGE_SIMPLE} />;

  const panels = ralliesPorSet.map(({ set, puntosLocal, puntosRival, rallies }) => {
    const ganadorSet = puntosLocal > puntosRival ? 'local' : 'rival';
    return {
      key: `set-${set}`,
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>Set {set}</span>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: ganadorSet === 'local' ? PINK : '#6366f1',
            }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 800, fontSize: 16, color: PINK }}>{puntosLocal}</span>
            <span style={{ color: '#9ca3af', fontSize: 12 }}>–</span>
            <span style={{ fontWeight: 800, fontSize: 16, color: '#6b7280' }}>{puntosRival}</span>
            <Tag style={{ margin: 0, fontSize: 11 }}>{rallies.length} rallies</Tag>
          </div>
        </div>
      ),
      children: (
        <div>
          {rallies.length === 0 ? (
            <Empty description="Sin datos" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {rallies.map((r, i) => (
                  <FilaRally
                    key={r._id}
                    rally={r}
                    idx={i}
                    rivalNombre={rivalNombre}
                    isMobile={isMobile}
                  />
                ))}
              </div>
              <ResumenTiposSet rallies={rallies} />
            </>
          )}
        </div>
      ),
    };
  });

  // Abrir el último set por defecto
  const defaultOpen = [`set-${ralliesPorSet[ralliesPorSet.length - 1].set}`];

  return (
    <Collapse
      items={panels}
      defaultActiveKey={defaultOpen}
      style={{ background: 'transparent' }}
    />
  );
}

// ── Página principal ───────────────────────────────────────────
export default function ResumenPartido() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const screens  = useBreakpoint();
  const isMobile = !screens.md;

  const [partido,       setPartido]       = useState(null);
  const [stats,         setStats]         = useState(null);
  const [ralliesPorSet, setRalliesPorSet] = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resPartido, resStats, resRallies] = await Promise.all([
          partidosService.obtener(id),
          statsService.partido(id),
          partidosService.ralliesPartido(id),
        ]);
        setPartido(resPartido.data);
        setStats(resStats.data);
        setRalliesPorSet(resRallies.data);
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

  const columnsSets = isMobile
    ? [
        { title: 'Set', dataIndex: 'numero', width: 52, render: (n) => <span style={{ fontWeight: 700, fontSize: 12 }}>Set {n}</span> },
        { title: 'COV', dataIndex: 'puntosLocal', render: (p, s) => <span style={{ fontWeight: 700, fontSize: 16, color: s.ganador === 'local' ? PINK : '#9ca3af' }}>{p}</span> },
        { title: partido.rival.slice(0, 8), dataIndex: 'puntosRival', render: (p, s) => <span style={{ fontWeight: 700, fontSize: 16, color: s.ganador === 'rival' ? '#6366f1' : '#9ca3af' }}>{p}</span> },
        { title: '🏆', dataIndex: 'ganador', width: 36, render: (g) => <span style={{ fontSize: 16 }}>{g === 'local' ? '🩷' : '🔵'}</span> },
      ]
    : [
        { title: 'Set', dataIndex: 'numero', width: 60, render: (n) => <span style={{ fontWeight: 700 }}>Set {n}</span> },
        { title: 'Atlético Coventry', dataIndex: 'puntosLocal', render: (p, s) => <span style={{ fontWeight: 700, fontSize: 18, color: s.ganador === 'local' ? PINK : '#6b7280' }}>{p}</span> },
        { title: partido.rival, dataIndex: 'puntosRival', render: (p, s) => <span style={{ fontWeight: 700, fontSize: 18, color: s.ganador === 'rival' ? '#6366f1' : '#6b7280' }}>{p}</span> },
        { title: 'Ganador', dataIndex: 'ganador', render: (g) => <Tag color={g === 'local' ? 'pink' : 'purple'}>{g === 'local' ? 'Atlético Coventry' : partido.rival}</Tag> },
      ];

  const tabItems = [
    {
      key: 'resumen',
      label: '📊 Resumen',
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
          <Card size="small" title="Sets jugados">
            <Table dataSource={sets} rowKey="_id" pagination={false} size="small" columns={columnsSets} />
          </Card>
          <Row gutter={[8, 8]}>
            <Col xs={12} sm={6}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic title={<span style={{ fontSize: isMobile ? 10 : 13 }}>Pts Coventry</span>}
                  value={resumen.puntosLocal} valueStyle={{ color: PINK, fontWeight: 700, fontSize: isMobile ? 20 : 24 }} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic title={<span style={{ fontSize: isMobile ? 10 : 13 }}>Pts {isMobile ? partido.rival.slice(0, 8) : partido.rival}</span>}
                  value={resumen.puntosRival} valueStyle={{ color: '#6366f1', fontWeight: 700, fontSize: isMobile ? 20 : 24 }} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic title={<span style={{ fontSize: isMobile ? 10 : 13 }}>Side-out %</span>}
                  value={resumen.sideOutPct} suffix="%" valueStyle={{ color: resumen.sideOutPct >= 50 ? '#16a34a' : '#dc2626', fontWeight: 700, fontSize: isMobile ? 20 : 24 }} />
              </Card>
            </Col>
            <Col xs={12} sm={6}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic title={<span style={{ fontSize: isMobile ? 10 : 13 }}>Rallies</span>}
                  value={resumen.totalRallies} valueStyle={{ color: '#374151', fontWeight: 700, fontSize: isMobile ? 20 : 24 }} />
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: 'local',
      label: <span style={{ color: PINK, fontWeight: 600 }}>{isMobile ? '🩷 COV' : '🏐 Coventry'}</span>,
      children: (
        <div style={{ marginTop: 12 }}>
          <PanelEquipo data={local} esLocal accentColorRgb="255,79,180" isMobile={isMobile} />
        </div>
      ),
    },
    {
      key: 'rival',
      label: <span style={{ fontWeight: 600 }}>{isMobile ? `🔵 ${partido.rival.slice(0, 6)}` : `🔵 ${partido.rival}`}</span>,
      children: (
        <div style={{ marginTop: 12 }}>
          <PanelEquipo data={rival} esLocal={false} accentColorRgb="99,102,241" isMobile={isMobile} />
        </div>
      ),
    },
    // ── Nuevo tab ──────────────────────────────────────────
    {
      key: 'rallies',
      label: (
        <span>
          <UnorderedListOutlined style={{ marginRight: isMobile ? 0 : 5 }} />
          {isMobile ? 'Puntos' : 'Punto a punto'}
        </span>
      ),
      children: (
        <div style={{ marginTop: 12 }}>
          <SeccionRallies
            ralliesPorSet={ralliesPorSet}
            rivalNombre={partido.rival}
            isMobile={isMobile}
          />
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <Button icon={<ArrowLeftOutlined />} type="text"
          onClick={() => navigate('/partidos')} style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: isMobile ? 17 : 22, fontWeight: 700 }}>
              Resumen del partido
            </h1>
            <Badge
              color={esVictoria ? '#16a34a' : '#ef4444'}
              text={
                <span style={{ fontWeight: 700, color: esVictoria ? '#16a34a' : '#ef4444', fontSize: 13 }}>
                  {esVictoria ? '🏆 Victoria' : '❌ Derrota'}
                </span>
              }
            />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              <CalendarOutlined style={{ marginRight: 4 }} />
              {dayjs(partido.fecha).format(isMobile ? 'DD/MM/YYYY' : 'DD [de] MMMM [de] YYYY')}
            </span>
            {partido.cancha && !isMobile && (
              <span style={{ fontSize: 12, color: '#6b7280' }}>
                <EnvironmentOutlined style={{ marginRight: 4 }} />
                {partido.cancha}
              </span>
            )}
            {partido.torneo && <Tag color="blue" style={{ fontSize: 11 }}>{partido.torneo}</Tag>}
            {!isMobile && <Tag color="default">{partido.categoria}</Tag>}
          </div>
        </div>
      </div>

      {/* Scoreboard */}
      <div style={{
        background: 'linear-gradient(135deg, #0d0d0d, #000101)',
        borderRadius: isMobile ? 12 : 16,
        padding: isMobile ? '20px 16px' : '28px 36px',
        color: '#fff', border: '1px solid rgba(255,79,180,0.15)',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: isMobile ? 8 : 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: PINK, fontSize: isMobile ? 9 : 11, fontWeight: 700, letterSpacing: isMobile ? 1 : 2, marginBottom: 6 }}>
              {isMobile ? 'COVENTRY' : 'ATLÉTICO COVENTRY'}
            </div>
            <div style={{ fontSize: isMobile ? 52 : 72, fontWeight: 900, color: PINK, lineHeight: 1, textShadow: `0 0 40px ${PINK}55` }}>
              {partido.setsGanados}
            </div>
            <div style={{ fontSize: isMobile ? 10 : 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>SETS</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            {!isMobile && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>{partido.tipo} · mejor de {partido.mejorDe}</div>}
            <div style={{ fontSize: isMobile ? 24 : 36, fontWeight: 700, color: 'rgba(255,255,255,0.2)' }}>–</div>
            <div style={{ fontSize: isMobile ? 10 : 13, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
              {resumen.puntosLocal}–{resumen.puntosRival}{!isMobile && ' pts totales'}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: isMobile ? 9 : 11, fontWeight: 700, letterSpacing: isMobile ? 1 : 2, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {partido.rival.toUpperCase()}
            </div>
            <div style={{ fontSize: isMobile ? 52 : 72, fontWeight: 900, color: '#fff', lineHeight: 1, textShadow: '0 0 40px rgba(255,255,255,0.15)' }}>
              {partido.setsPerdidos}
            </div>
            <div style={{ fontSize: isMobile ? 10 : 13, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>SETS</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Card bodyStyle={{ padding: isMobile ? '0 6px 12px' : '0 16px 16px' }}>
        <Tabs defaultActiveKey="resumen" items={tabItems} size={isMobile ? 'small' : 'middle'} />
      </Card>
    </div>
  );
}
