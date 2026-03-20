import React, { useEffect, useState } from 'react';
import {
  Card, Row, Col, Statistic, Table, Tag,
  Select, Progress, Skeleton, Empty, Tabs,
  Avatar, Grid,
} from 'antd';
import {
  TrophyOutlined, WarningOutlined,
  TeamOutlined, CalendarOutlined,
} from '@ant-design/icons';
import { statsService }     from '../../services/stats.service';
import { jugadoresService } from '../../services/jugadores.service';

const { useBreakpoint } = Grid;
const PINK = '#ff4fb4';

const POSICION_COLOR = {
  Armador: 'blue', Opuesto: 'purple', Punta: 'green',
  Central: 'orange', Líbero: 'cyan', Auxiliar: 'default',
};

export default function Estadisticas() {
  const screens    = useBreakpoint();
  const isMobile   = !screens.md;

  const [temporada,   setTemporada]   = useState(null);
  const [jugadores,   setJugadores]   = useState([]);
  const [jugadorId,   setJugadorId]   = useState(null);
  const [statsJug,    setStatsJug]    = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [loadingJug,  setLoadingJug]  = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [resTemp, resJug] = await Promise.all([
          statsService.temporada(),
          jugadoresService.listar({ activo: true }),
        ]);
        setTemporada(resTemp.data);
        setJugadores(resJug.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  useEffect(() => {
    if (!jugadorId) { setStatsJug(null); return; }
    const cargar = async () => {
      setLoadingJug(true);
      try {
        const res = await statsService.jugador(jugadorId);
        setStatsJug(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingJug(false);
      }
    };
    cargar();
  }, [jugadorId]);

  if (loading) return <Skeleton active />;
  if (!temporada) return <Empty description="Sin datos de temporada" />;

  const { partidos, topAnotadores, topErrores } = temporada;
  const pctVictorias = partidos.total > 0
    ? ((partidos.victorias / partidos.total) * 100).toFixed(1) : 0;

  // ── Columnas top anotadores ─────────────────────────────
  const colsTop = [
    {
      title: 'Pos', key: 'pos', width: 40,
      render: (_, __, i) => (
        <span style={{
          fontWeight: 700,
          color: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : '#cd7f32',
        }}>
          {i + 1}
        </span>
      ),
    },
    {
      title: 'Jugador',
      render: (_, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size={isMobile ? 28 : 32}
            style={{ background: PINK, fontSize: 11, flexShrink: 0 }}>
            {r.jugador.numeroCamiseta}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: isMobile ? 12 : 13 }}>
              {r.jugador.nombre} {r.jugador.apellido}
            </div>
            {!isMobile && (
              <Tag color={POSICION_COLOR[r.jugador.posicion]}
                style={{ fontSize: 10, margin: 0 }}>
                {r.jugador.posicion}
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Pts', dataIndex: 'puntos', width: isMobile ? 56 : 80,
      render: (p) => (
        <Tag style={{
          background: PINK, border: 'none', color: '#fff',
          fontWeight: 700, minWidth: 36, textAlign: 'center',
        }}>
          {p}
        </Tag>
      ),
    },
  ];

  const colsErrores = [
    {
      title: 'Pos', key: 'pos', width: 40,
      render: (_, __, i) => (
        <span style={{ color: '#6b7280' }}>{i + 1}</span>
      ),
    },
    {
      title: 'Jugador',
      render: (_, r) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar size={isMobile ? 28 : 32}
            style={{ background: '#6b7280', fontSize: 11, flexShrink: 0 }}>
            {r.jugador.numeroCamiseta}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, fontSize: isMobile ? 12 : 13 }}>
              {r.jugador.nombre} {r.jugador.apellido}
            </div>
            {!isMobile && (
              <Tag color={POSICION_COLOR[r.jugador.posicion]}
                style={{ fontSize: 10, margin: 0 }}>
                {r.jugador.posicion}
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Err', dataIndex: 'errores', width: isMobile ? 56 : 80,
      render: (e) => (
        <Tag color="red" style={{ fontWeight: 700, minWidth: 36, textAlign: 'center' }}>
          {e}
        </Tag>
      ),
    },
  ];

  // ── Columnas historial jugador ──────────────────────────
  const colsHistorial = isMobile
    ? [
        {
          title: 'Partido',
          render: (_, r) => (
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>
                vs {r.partido.rival}
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>
                {new Date(r.partido.fecha).toLocaleDateString('es-CL')}
              </div>
            </div>
          ),
        },
        {
          title: 'Pts',
          dataIndex: 'puntos',
          width: 52,
          render: (p) => (
            <Tag style={{
              background: PINK, border: 'none',
              color: '#fff', fontWeight: 700,
              minWidth: 32, textAlign: 'center',
            }}>{p}</Tag>
          ),
        },
        {
          title: 'Err',
          dataIndex: 'errores',
          width: 52,
          render: (e) => (
            <Tag color={e > 0 ? 'red' : 'default'}
              style={{ fontWeight: 700, minWidth: 32, textAlign: 'center' }}>
              {e}
            </Tag>
          ),
        },
      ]
    : [
        {
          title: 'Rival',
          dataIndex: ['partido', 'rival'],
          render: (r) => <span style={{ fontWeight: 500 }}>vs {r}</span>,
        },
        {
          title: 'Fecha',
          dataIndex: ['partido', 'fecha'],
          render: (f) => (
            <span style={{ color: '#6b7280', fontSize: 12 }}>
              {new Date(f).toLocaleDateString('es-CL')}
            </span>
          ),
        },
        {
          title: 'Puntos', dataIndex: 'puntos', width: 80,
          render: (p) => (
            <Tag style={{
              background: PINK, border: 'none',
              color: '#fff', fontWeight: 700, minWidth: 36, textAlign: 'center',
            }}>{p}</Tag>
          ),
        },
        {
          title: 'Errores', dataIndex: 'errores', width: 80,
          render: (e) => (
            <Tag color={e > 0 ? 'red' : 'default'}
              style={{ fontWeight: 700, minWidth: 36, textAlign: 'center' }}>{e}</Tag>
          ),
        },
      ];

  // ── Tab Temporada ───────────────────────────────────────
  const tabTemporada = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>

      {/* Stats generales */}
      <Row gutter={[8, 8]}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title={<span style={{ fontSize: isMobile ? 11 : 13 }}>Jugados</span>}
              value={partidos.total}
              valueStyle={{ color: '#1f2937', fontWeight: 700, fontSize: isMobile ? 20 : 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title={<span style={{ fontSize: isMobile ? 11 : 13 }}>Victorias</span>}
              value={partidos.victorias}
              valueStyle={{ color: '#16a34a', fontWeight: 700, fontSize: isMobile ? 20 : 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title={<span style={{ fontSize: isMobile ? 11 : 13 }}>Derrotas</span>}
              value={partidos.derrotas}
              valueStyle={{ color: '#ef4444', fontWeight: 700, fontSize: isMobile ? 20 : 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title={<span style={{ fontSize: isMobile ? 11 : 13 }}>% victorias</span>}
              value={pctVictorias}
              suffix="%"
              valueStyle={{
                color: pctVictorias >= 50 ? '#16a34a' : '#ef4444',
                fontWeight: 700,
                fontSize: isMobile ? 20 : 24,
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Barra balance */}
      <Card size="small" title="Balance de temporada">
        <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#16a34a', fontWeight: 600, fontSize: 13 }}>
            {partidos.victorias} victorias
          </span>
          <span style={{ color: '#ef4444', fontWeight: 600, fontSize: 13 }}>
            {partidos.derrotas} derrotas
          </span>
        </div>
        <Progress
          percent={parseFloat(pctVictorias)}
          strokeColor="#16a34a"
          trailColor="#fca5a5"
          showInfo={false}
          size={['100%', 12]}
        />
      </Card>

      {/* Top anotadores */}
      <Card
        size={isMobile ? 'small' : 'default'}
        title={
          <span style={{ fontSize: isMobile ? 13 : 14 }}>
            <TrophyOutlined style={{ color: PINK, marginRight: 6 }} />
            Top anotadores
          </span>
        }
        bodyStyle={{ padding: isMobile ? '8px 0' : '16px 24px' }}
      >
        {topAnotadores.length === 0
          ? <Empty description="Sin datos" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          : (
            <Table
              columns={colsTop}
              dataSource={topAnotadores}
              rowKey={(r) => r.jugador._id}
              pagination={false}
              size="small"
            />
          )
        }
      </Card>

      {/* Top errores */}
      <Card
        size={isMobile ? 'small' : 'default'}
        title={
          <span style={{ fontSize: isMobile ? 13 : 14 }}>
            <WarningOutlined style={{ color: '#ef4444', marginRight: 6 }} />
            Más errores
          </span>
        }
        bodyStyle={{ padding: isMobile ? '8px 0' : '16px 24px' }}
      >
        {topErrores.length === 0
          ? <Empty description="Sin datos" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          : (
            <Table
              columns={colsErrores}
              dataSource={topErrores}
              rowKey={(r) => r.jugador._id}
              pagination={false}
              size="small"
            />
          )
        }
      </Card>
    </div>
  );

  // ── Tab Por jugador ─────────────────────────────────────
  const tabJugador = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
      <Select
        placeholder="Seleccionar jugador..."
        size={isMobile ? 'middle' : 'large'}
        style={{ width: '100%' }}
        value={jugadorId}
        onChange={setJugadorId}
        allowClear
        showSearch
        filterOption={(input, opt) =>
          opt.label.toLowerCase().includes(input.toLowerCase())
        }
        options={jugadores.map((j) => ({
          value: j._id,
          label: `#${j.numeroCamiseta} ${j.nombre} ${j.apellido} — ${j.posicion}`,
        }))}
      />

      {!jugadorId && (
        <Empty
          description="Selecciona un jugador para ver su historial"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}

      {jugadorId && loadingJug && <Skeleton active />}

      {jugadorId && !loadingJug && statsJug && (
        <>
          {/* Totales */}
          <Row gutter={[8, 8]}>
            <Col span={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title={<span style={{ fontSize: isMobile ? 11 : 13 }}>Puntos</span>}
                  value={statsJug.totales.puntos}
                  valueStyle={{
                    color: PINK, fontWeight: 700,
                    fontSize: isMobile ? 20 : 24,
                  }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title={<span style={{ fontSize: isMobile ? 11 : 13 }}>Errores</span>}
                  value={statsJug.totales.errores}
                  valueStyle={{
                    color: '#ef4444', fontWeight: 700,
                    fontSize: isMobile ? 20 : 24,
                  }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Statistic
                  title={<span style={{ fontSize: isMobile ? 11 : 13 }}>Partidos</span>}
                  value={statsJug.porPartido.length}
                  valueStyle={{
                    color: '#6b7280', fontWeight: 700,
                    fontSize: isMobile ? 20 : 24,
                  }}
                />
              </Card>
            </Col>
          </Row>

          {/* Historial */}
          <Card
            title="Historial por partido"
            size={isMobile ? 'small' : 'default'}
            bodyStyle={{ padding: isMobile ? '8px 0' : '16px 24px' }}
          >
            {statsJug.porPartido.length === 0
              ? <Empty description="Sin partidos" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              : (
                <Table
                  columns={colsHistorial}
                  dataSource={statsJug.porPartido}
                  rowKey={(r) => r.partido._id}
                  pagination={{ pageSize: isMobile ? 5 : 10, showSizeChanger: false }}
                  size="small"
                />
              )
            }
          </Card>
        </>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 20 }}>

      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: isMobile ? 20 : 24, fontWeight: 700, color: '#1f2937' }}>
          Estadísticas
        </h1>
        {!isMobile && (
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>
            Atlético Coventry — análisis de temporada
          </p>
        )}
      </div>

      <Card bodyStyle={{ padding: isMobile ? '0 8px 12px' : '0 16px 16px' }}>
        <Tabs
          defaultActiveKey="temporada"
          size={isMobile ? 'small' : 'middle'}
          items={[
            {
              key: 'temporada',
              label: (
                <span>
                  <CalendarOutlined style={{ marginRight: isMobile ? 0 : 6 }} />
                  {!isMobile && 'Temporada'}
                  {isMobile && 'Temporada'}
                </span>
              ),
              children: tabTemporada,
            },
            {
              key: 'jugador',
              label: (
                <span>
                  <TeamOutlined style={{ marginRight: isMobile ? 0 : 6 }} />
                  {isMobile ? 'Jugador' : 'Por Jugador'}
                </span>
              ),
              children: tabJugador,
            },
          ]}
        />
      </Card>
    </div>
  );
}
