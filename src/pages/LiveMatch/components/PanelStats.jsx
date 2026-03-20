import React, { useState } from 'react';
import {
  Card, Row, Col, Statistic, Table,
  Tag, Progress, Skeleton, Tooltip, Tabs,
} from 'antd';
import {
  TrophyOutlined, WarningOutlined,
  ThunderboltOutlined, SyncOutlined,
  AimOutlined, FireOutlined,
} from '@ant-design/icons';

const PINK = '#ff4fb4';

const TIPO_COLOR = {
  ataque:      '#2563eb',
  ace:         '#16a34a',
  bloqueo:     '#7c3aed',
  error_rival: '#9ca3af',
  error_local: '#ef4444',
  otro:        '#6b7280',
};

const TIPO_LABEL = {
  ataque:      '⚡ Ataque',
  ace:         '🚀 Ace',
  bloqueo:     '🛡 Bloqueo',
  error_rival: '✅ Error rival',
  error_local: '❌ Error local',
  otro:        '• Otro',
};

const TIPO_ATAQUE_LABEL = {
  primer_tiempo:  '⚡ 1er tiempo',
  segundo_tiempo: '📐 2do tiempo',
  pipe:           '🔁 Pipe',
  finta:          '🤏 Finta',
  otro:           '• Otro',
};

const ZONAS_GRID = [4, 3, 2, 5, 6, 1]; // frente → fondo

// ── Panel de stats para un equipo ─────────────────────────────
function StatsEquipo({ data, esLocal, accentColor }) {
  if (!data) return null;

  const {
    totalPuntos,
    puntosPorJugador,
    erroresPorJugador,
    puntoPorTipo,
    puntosPorZona,
    puntosPorTipoAtaque,
    eficienciaPorRotacion,
    pelotasLibres, pelotasLibresConvertidas, conversionPelotaLibre,
    doblesPositivas, doblesPositivasConvertidas, conversionDoblePositiva,
  } = data;

  const totalTipo       = Object.values(puntoPorTipo).reduce((a, b) => a + b, 0);
  const totalTipoAtaque = Object.values(puntosPorTipoAtaque).reduce((a, b) => a + b, 0);
  const maxZona         = Math.max(...Object.values(puntosPorZona), 1);

  const colsAnotadores = [
    {
      dataIndex: ['jugador', 'numeroCamiseta'],
      width: 36,
      render: (n) => (
        <span style={{ fontWeight: 700, color: accentColor, fontSize: 13 }}>{n}</span>
      ),
    },
    {
      render: (_, r) => (
        <div>
          <span style={{ fontWeight: 500, fontSize: 13 }}>
            {r.jugador.nombre} {r.jugador.apellido}
          </span>
          <br />
          <Tag color="default" style={{ fontSize: 10 }}>{r.jugador.posicion}</Tag>
        </div>
      ),
    },
    {
      dataIndex: 'puntos',
      width: 44,
      render: (p) => (
        <Tag style={{
          background: accentColor, border: 'none',
          color: '#fff', fontWeight: 700,
          minWidth: 32, textAlign: 'center',
        }}>
          {p}
        </Tag>
      ),
    },
  ];

  const colsErrores = [
    {
      dataIndex: ['jugador', 'numeroCamiseta'],
      width: 36,
      render: (n) => (
        <span style={{ fontWeight: 700, color: '#ef4444', fontSize: 13 }}>{n}</span>
      ),
    },
    {
      render: (_, r) => (
        <span style={{ fontWeight: 500, fontSize: 13 }}>
          {r.jugador.nombre} {r.jugador.apellido}
        </span>
      ),
    },
    {
      dataIndex: 'errores',
      width: 44,
      render: (e) => (
        <Tag color="red" style={{ fontWeight: 700, minWidth: 32, textAlign: 'center' }}>
          {e}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ── Pelota libre + Doble positiva ── */}
      <Row gutter={10}>
        <Col span={12}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
              🏐 Pelota libre
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#2563eb' }}>
              {pelotasLibresConvertidas}
              <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 400 }}>
                /{pelotasLibres}
              </span>
            </div>
            {conversionPelotaLibre !== null
              ? <div style={{ fontSize: 11, color: '#6b7280' }}>{conversionPelotaLibre}% conv.</div>
              : <div style={{ fontSize: 11, color: '#d1d5db' }}>sin datos</div>
            }
            {pelotasLibres > 0 && (
              <Progress
                percent={parseFloat(conversionPelotaLibre)}
                strokeColor="#2563eb" showInfo={false}
                size="small" style={{ marginTop: 6 }}
              />
            )}
          </Card>
        </Col>
        <Col span={12}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
              ⭐ Doble positiva
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#7c3aed' }}>
              {doblesPositivasConvertidas}
              <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 400 }}>
                /{doblesPositivas}
              </span>
            </div>
            {conversionDoblePositiva !== null
              ? <div style={{ fontSize: 11, color: '#6b7280' }}>{conversionDoblePositiva}% conv.</div>
              : <div style={{ fontSize: 11, color: '#d1d5db' }}>sin datos</div>
            }
            {doblesPositivas > 0 && (
              <Progress
                percent={parseFloat(conversionDoblePositiva)}
                strokeColor="#7c3aed" showInfo={false}
                size="small" style={{ marginTop: 6 }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* ── Tipo de finalización ── */}
      <Card
        size="small"
        title={
          <span style={{ fontSize: 13 }}>
            <ThunderboltOutlined style={{ color: '#f59e0b', marginRight: 6 }} />
            Cómo se ganaron los puntos
          </span>
        }
      >
        {totalTipo === 0 ? (
          <span style={{ color: '#9ca3af', fontSize: 13 }}>Sin puntos registrados</span>
        ) : (
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
                  <Progress
                    percent={Math.round((cantidad / totalTipo) * 100)}
                    strokeColor={TIPO_COLOR[tipo]}
                    showInfo={false} size="small"
                  />
                </div>
              ))}
          </div>
        )}
      </Card>

      {/* ── Zona del ataque ── */}
      <Card
        size="small"
        title={
          <span style={{ fontSize: 13 }}>
            <AimOutlined style={{ color: '#2563eb', marginRight: 6 }} />
            Puntos por zona
          </span>
        }
      >
        <div style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center', marginBottom: 6, letterSpacing: 1 }}>
          ── RED ──
        </div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 5, maxWidth: 200, margin: '0 auto',
        }}>
          {ZONAS_GRID.map((zona) => {
            const pts        = puntosPorZona[zona] || 0;
            const intensidad = maxZona > 0 ? pts / maxZona : 0;
            const alpha      = pts > 0 ? 0.15 + intensidad * 0.75 : 0;
            const bg         = pts > 0
              ? `rgba(${esLocal ? '255,79,180' : '99,102,241'}, ${alpha})`
              : '#f3f4f6';
            const borderColor = pts > 0 ? accentColor : '#e5e7eb';
            return (
              <Tooltip key={zona} title={`Zona ${zona}: ${pts} punto${pts !== 1 ? 's' : ''}`}>
                <div style={{
                  height: 44, borderRadius: 6,
                  background: bg, border: `1px solid ${borderColor}`,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 10, color: pts > 0 ? accentColor : '#9ca3af', fontWeight: 600 }}>
                    Z{zona}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: pts > 0 ? accentColor : '#d1d5db' }}>
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
      </Card>

      {/* ── Tipo de ataque ── */}
      {totalTipoAtaque > 0 && (
        <Card
          size="small"
          title={
            <span style={{ fontSize: 13 }}>
              <FireOutlined style={{ color: '#ef4444', marginRight: 6 }} />
              Tipo de ataque
            </span>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {Object.entries(puntosPorTipoAtaque)
              .filter(([, v]) => v > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([tipo, cantidad]) => (
                <div key={tipo}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 12, color: '#374151' }}>{TIPO_ATAQUE_LABEL[tipo]}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>
                      {cantidad} ({Math.round((cantidad / totalTipoAtaque) * 100)}%)
                    </span>
                  </div>
                  <Progress
                    percent={Math.round((cantidad / totalTipoAtaque) * 100)}
                    strokeColor={accentColor} showInfo={false} size="small"
                  />
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* ── Eficiencia por rotación (solo local) ── */}
      {esLocal && (
        <Card
          size="small"
          title={
            <span style={{ fontSize: 13 }}>
              <SyncOutlined style={{ color: '#7c3aed', marginRight: 6 }} />
              Eficiencia por rotación
            </span>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 5 }}>
            {eficienciaPorRotacion.map(({ rotacion, puntos, errores, pct }) => {
              const tieneData  = puntos + errores > 0;
              const color = !tieneData ? '#9ca3af'
                : pct >= 60 ? '#16a34a'
                : pct >= 40 ? '#f59e0b'
                : '#ef4444';
              return (
                <Tooltip
                  key={rotacion}
                  title={tieneData
                    ? `Rot. ${rotacion}: ${puntos} pts / ${errores} err — ${pct}%`
                    : `Rot. ${rotacion}: sin datos`
                  }
                >
                  <div style={{
                    textAlign: 'center',
                    background: tieneData ? `${color}18` : '#f9fafb',
                    border: `1px solid ${tieneData ? color : '#e5e7eb'}`,
                    borderRadius: 8, padding: '6px 4px',
                  }}>
                    <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 600 }}>R{rotacion}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color, lineHeight: 1.2 }}>
                      {tieneData ? `${pct}%` : '—'}
                    </div>
                    <div style={{ fontSize: 9, color: '#9ca3af', marginTop: 2 }}>
                      {tieneData ? `${puntos}/${puntos + errores}` : ''}
                    </div>
                  </div>
                </Tooltip>
              );
            })}
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 10, justifyContent: 'center' }}>
            {[
              { color: '#16a34a', label: '≥60% fuerte' },
              { color: '#f59e0b', label: '40–59% media' },
              { color: '#ef4444', label: '<40% débil'   },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <span style={{ fontSize: 10, color: '#6b7280' }}>{label}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Top anotadores ── */}
      {puntosPorJugador.length > 0 && (
        <Card
          size="small"
          title={
            <span style={{ fontSize: 13 }}>
              <TrophyOutlined style={{ color: accentColor, marginRight: 6 }} />
              Top Anotadores
            </span>
          }
        >
          <Table
            columns={colsAnotadores}
            dataSource={puntosPorJugador.slice(0, 5)}
            rowKey={(r) => r.jugador._id}
            pagination={false} size="small" showHeader={false}
          />
        </Card>
      )}

      {/* ── Top errores ── */}
      {erroresPorJugador.length > 0 && (
        <Card
          size="small"
          title={
            <span style={{ fontSize: 13 }}>
              <WarningOutlined style={{ color: '#ef4444', marginRight: 6 }} />
              Más Errores
            </span>
          }
        >
          <Table
            columns={colsErrores}
            dataSource={erroresPorJugador.slice(0, 5)}
            rowKey={(r) => r.jugador._id}
            pagination={false} size="small" showHeader={false}
          />
        </Card>
      )}

    </div>
  );
}

// ── Componente principal ───────────────────────────────────────
export default function PanelStats({ stats, partido }) {
  if (!stats) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Skeleton active />
        <Skeleton active />
        <Skeleton active />
      </div>
    );
  }

  const { resumen, local, rival } = stats;

  const tabItems = [
    {
      key: 'resumen',
      label: '📊 Resumen',
      children: (
        <Row gutter={[10, 10]} style={{ marginTop: 12 }}>
          <Col span={8}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Statistic
                title="Coventry"
                value={resumen.puntosLocal}
                valueStyle={{ color: PINK, fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Statistic
                title="Side-out %"
                value={resumen.sideOutPct}
                suffix="%"
                valueStyle={{
                  color: resumen.sideOutPct >= 50 ? '#16a34a' : '#dc2626',
                  fontWeight: 700,
                }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Statistic
                title={partido?.rival || 'Rival'}
                value={resumen.puntosRival}
                valueStyle={{ color: '#6b7280', fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col span={24}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Statistic
                title="Total rallies jugados"
                value={resumen.totalRallies}
                valueStyle={{ color: '#374151', fontWeight: 700 }}
              />
            </Card>
          </Col>
        </Row>
      ),
    },
    {
      key: 'local',
      label: (
        <span style={{ color: PINK, fontWeight: 600 }}>
          🏐 Coventry
        </span>
      ),
      children: (
        <div style={{ marginTop: 12 }}>
          <StatsEquipo data={local} esLocal partido={partido} accentColor={PINK} />
        </div>
      ),
    },
    {
      key: 'rival',
      label: (
        <span style={{ color: '#6b7280', fontWeight: 600 }}>
          🔵 {partido?.rival || 'Rival'}
        </span>
      ),
      children: (
        <div style={{ marginTop: 12 }}>
          <StatsEquipo data={rival} esLocal={false} partido={partido} accentColor="#6366f1" />
        </div>
      ),
    },
  ];

  return (
    <Card
      style={{ minHeight: 400 }}
      bodyStyle={{ padding: '0 16px 16px' }}
    >
      <Tabs
        defaultActiveKey="local"
        items={tabItems}
        size="small"
      />
    </Card>
  );
}
