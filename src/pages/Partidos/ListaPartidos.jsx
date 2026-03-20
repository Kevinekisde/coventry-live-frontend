import React, { useEffect, useState } from 'react';
import {
  Table, Button, Tag, Space, Input, Select, Card,
  Badge, Tooltip, App, Row, Col, Statistic, Empty, Grid,
} from 'antd';
import {
  PlusOutlined, SearchOutlined,
  PlayCircleOutlined, TrophyOutlined, CloseCircleOutlined,
  ClockCircleOutlined, ReloadOutlined, BarChartOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { partidosService } from '../../services/partidos.service';

const { useBreakpoint } = Grid;

const ESTADO_CONFIG = {
  pendiente:  { color: 'default',    icon: <ClockCircleOutlined />, label: 'Pendiente'  },
  en_juego:   { color: 'processing', icon: <PlayCircleOutlined />,  label: 'En juego'   },
  finalizado: { color: 'default',    icon: null,                    label: 'Finalizado' },
};

const RESULTADO_CONFIG = {
  victoria: { color: 'success', label: 'Victoria' },
  derrota:  { color: 'error',   label: 'Derrota'  },
};

const CATEGORIAS = [
  'Adulto Masculino', 'Adulto Femenino',
  'Sub-18 M', 'Sub-18 F', 'Sub-15 M', 'Sub-15 F',
];

export default function ListaPartidos() {
  const { message } = App.useApp();
  const navigate    = useNavigate();
  const screens     = useBreakpoint();
  const isMobile    = !screens.md;

  const [partidos,         setPartidos]         = useState([]);
  const [loading,          setLoading]           = useState(false);
  const [search,           setSearch]            = useState('');
  const [filtroEstado,     setFiltroEstado]      = useState(null);
  const [filtroCategoria,  setFiltroCategoria]   = useState(null);
  const [filtrosVisible,   setFiltrosVisible]    = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await partidosService.listar();
      setPartidos(res.data);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const finalizados = partidos.filter((p) => p.estado === 'finalizado');
  const victorias   = finalizados.filter((p) => p.resultado === 'victoria').length;
  const derrotas    = finalizados.filter((p) => p.resultado === 'derrota').length;
  const enJuego     = partidos.filter((p) => p.estado === 'en_juego');

  const partidosFiltrados = partidos.filter((p) => {
    const texto = `${p.rival} ${p.torneo || ''}`.toLowerCase();
    return (
      texto.includes(search.toLowerCase()) &&
      (filtroEstado    ? p.estado    === filtroEstado    : true) &&
      (filtroCategoria ? p.categoria === filtroCategoria : true)
    );
  });

  // ── Columnas desktop ──────────────────────────────────────
  const columnsDesktop = [
    {
      title: 'Fecha', dataIndex: 'fecha', width: 110,
      sorter: (a, b) => dayjs(a.fecha).unix() - dayjs(b.fecha).unix(),
      defaultSortOrder: 'descend',
      render: (f) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1f2937', fontSize: 13 }}>
            {dayjs(f).format('DD MMM YYYY')}
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>{dayjs(f).format('dddd')}</div>
        </div>
      ),
    },
    {
      title: 'Rival', dataIndex: 'rival',
      render: (rival, p) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1f2937' }}>vs {rival}</div>
          {p.torneo && <div style={{ fontSize: 11, color: '#6b7280' }}>{p.torneo}</div>}
          {p.cancha && <div style={{ fontSize: 11, color: '#9ca3af' }}>📍 {p.cancha}</div>}
        </div>
      ),
    },
    {
      title: 'Categoría', dataIndex: 'categoria', width: 150,
      render: (c) => <Tag color="blue">{c}</Tag>,
    },
    {
      title: 'Sets', width: 80,
      render: (_, p) => p.estado === 'finalizado'
        ? (
          <span style={{ fontWeight: 700, fontSize: 16, color: '#ff4fb4' }}>
            {p.setsGanados}
            <span style={{ color: '#9ca3af', fontWeight: 400 }}> – </span>
            {p.setsPerdidos}
          </span>
        ) : <span style={{ color: '#9ca3af' }}>—</span>,
    },
    {
      title: 'Resultado', width: 110,
      render: (_, p) => {
        if (p.estado !== 'finalizado') return null;
        const cfg = RESULTADO_CONFIG[p.resultado];
        return <Badge status={cfg.color} text={<span style={{ fontWeight: 600 }}>{cfg.label}</span>} />;
      },
    },
    {
      title: 'Estado', dataIndex: 'estado', width: 120,
      render: (estado) => {
        const cfg = ESTADO_CONFIG[estado];
        return (
          <Badge status={cfg.color} text={
            <span style={{ fontSize: 13 }}>
              {cfg.icon && <span style={{ marginRight: 4 }}>{cfg.icon}</span>}
              {cfg.label}
            </span>
          } />
        );
      },
    },
    {
      title: '', width: 110,
      render: (_, p) => (
        <Space>
          {p.estado === 'pendiente' && (
            <Button type="primary" size="small" icon={<PlayCircleOutlined />}
              onClick={() => navigate(`/partidos/nuevo?id=${p._id}`)}>
              Iniciar
            </Button>
          )}
          {p.estado === 'en_juego' && (
            <Button type="primary" size="small" danger icon={<PlayCircleOutlined />}
              onClick={() => navigate(`/partidos/${p._id}/live`)}>
              En vivo
            </Button>
          )}
          {p.estado === 'finalizado' && (
            <Button size="small" icon={<BarChartOutlined />}
              onClick={() => navigate(`/partidos/${p._id}/resumen`)}>
              Resumen
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // ── Columnas móvil — todo en 2 columnas ──────────────────
  const columnsMobile = [
    {
      title: 'Partido',
      render: (_, p) => (
        <div>
          {/* Rival + fecha */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1f2937' }}>
              vs {p.rival}
            </div>
            <span style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0, marginLeft: 8 }}>
              {dayjs(p.fecha).format('DD MMM')}
            </span>
          </div>

          {/* Torneo + cancha */}
          {(p.torneo || p.cancha) && (
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
              {p.torneo && <span>{p.torneo}</span>}
              {p.torneo && p.cancha && <span> · </span>}
              {p.cancha && <span>📍 {p.cancha}</span>}
            </div>
          )}

          {/* Tags de estado + resultado */}
          <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap', alignItems: 'center' }}>
            {p.estado === 'finalizado' && p.resultado && (
              <Badge
                status={RESULTADO_CONFIG[p.resultado].color}
                text={
                  <span style={{ fontSize: 12, fontWeight: 600 }}>
                    {RESULTADO_CONFIG[p.resultado].label}
                  </span>
                }
              />
            )}
            {p.estado === 'en_juego' && (
              <Badge status="processing" text={
                <span style={{ fontSize: 12, color: '#d97706', fontWeight: 600 }}>En juego</span>
              } />
            )}
            {p.estado === 'pendiente' && (
              <span style={{ fontSize: 11, color: '#9ca3af' }}>Pendiente</span>
            )}
            {p.estado === 'finalizado' && (
              <span style={{ fontSize: 13, fontWeight: 700, color: '#ff4fb4' }}>
                {p.setsGanados} – {p.setsPerdidos}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '',
      width: 80,
      render: (_, p) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {p.estado === 'pendiente' && (
            <Button type="primary" size="small" icon={<PlayCircleOutlined />}
              onClick={() => navigate(`/partidos/nuevo?id=${p._id}`)}>
              Iniciar
            </Button>
          )}
          {p.estado === 'en_juego' && (
            <Button type="primary" size="small" danger icon={<PlayCircleOutlined />}
              onClick={() => navigate(`/partidos/${p._id}/live`)}>
              Live
            </Button>
          )}
          {p.estado === 'finalizado' && (
            <Button size="small" icon={<BarChartOutlined />}
              onClick={() => navigate(`/partidos/${p._id}/resumen`)} />
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 20 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 20 : 24, fontWeight: 700, color: '#1f2937' }}>
            Partidos
          </h1>
          {!isMobile && (
            <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>
              Historial de partidos de Atlético Coventry
            </p>
          )}
        </div>
        <Button
          type="primary" icon={<PlusOutlined />}
          size={isMobile ? 'middle' : 'large'}
          onClick={() => navigate('/partidos/nuevo')}
        >
          {isMobile ? 'Nuevo' : 'Nuevo Partido'}
        </Button>
      </div>

      {/* ── Stats rápidas ── */}
      <Row gutter={[8, 8]}>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title={<span style={{ fontSize: isMobile ? 11 : 13 }}>Total</span>}
              value={partidos.length}
              valueStyle={{ color: '#1f2937', fontWeight: 700, fontSize: isMobile ? 20 : 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title={<span style={{ fontSize: isMobile ? 11 : 13 }}>Victorias</span>}
              value={victorias}
              valueStyle={{ color: '#16a34a', fontWeight: 700, fontSize: isMobile ? 20 : 24 }}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title={<span style={{ fontSize: isMobile ? 11 : 13 }}>Derrotas</span>}
              value={derrotas}
              valueStyle={{ color: '#dc2626', fontWeight: 700, fontSize: isMobile ? 20 : 24 }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title={<span style={{ fontSize: isMobile ? 11 : 13 }}>En juego</span>}
              value={enJuego.length}
              valueStyle={{
                color: enJuego.length > 0 ? '#d97706' : '#6b7280',
                fontWeight: 700, fontSize: isMobile ? 20 : 24,
              }}
              prefix={<PlayCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* ── Banner partido en juego ── */}
      {enJuego.length > 0 && (
        <Card
          size="small"
          style={{ background: '#fef3c7', border: '1px solid #f59e0b', cursor: 'pointer' }}
          onClick={() => navigate(`/partidos/${enJuego[0]._id}/live`)}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <Badge status="processing" />
              <span style={{
                fontWeight: 700, color: '#92400e',
                fontSize: isMobile ? 13 : 14,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {isMobile
                  ? `vs ${enJuego[0].rival}`
                  : `Partido en curso: Atlético Coventry vs ${enJuego[0].rival}`
                }
              </span>
            </div>
            <Button type="primary" size="small" icon={<PlayCircleOutlined />}
              style={{ background: '#d97706', borderColor: '#d97706', flexShrink: 0 }}>
              {isMobile ? 'Live' : 'Continuar'}
            </Button>
          </div>
        </Card>
      )}

      {/* ── Tabla ── */}
      <Card bodyStyle={{ padding: isMobile ? '12px 8px' : 24 }}>

        {/* Filtros desktop: todos en fila */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <Input
              placeholder="Buscar por rival o torneo..."
              prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
              value={search} onChange={(e) => setSearch(e.target.value)}
              allowClear style={{ width: 240 }}
            />
            <Select placeholder="Estado" allowClear value={filtroEstado}
              onChange={setFiltroEstado} style={{ width: 140 }}
              options={[
                { value: 'pendiente',  label: 'Pendiente'  },
                { value: 'en_juego',   label: 'En juego'   },
                { value: 'finalizado', label: 'Finalizado' },
              ]}
            />
            <Select placeholder="Categoría" allowClear value={filtroCategoria}
              onChange={setFiltroCategoria} style={{ width: 180 }}
              options={CATEGORIAS.map((c) => ({ value: c, label: c }))}
            />
            <Button icon={<ReloadOutlined />} onClick={cargar}>Actualizar</Button>
            <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: 13 }}>
              {partidosFiltrados.length} partido{partidosFiltrados.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Filtros móvil: buscador + botón filtros colapsable */}
        {isMobile && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: filtrosVisible ? 8 : 0 }}>
              <Input
                placeholder="Buscar rival o torneo..."
                prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                value={search} onChange={(e) => setSearch(e.target.value)}
                allowClear style={{ flex: 1 }}
              />
              <Button
                icon={<FilterOutlined />}
                onClick={() => setFiltrosVisible(!filtrosVisible)}
                type={filtroEstado || filtroCategoria ? 'primary' : 'default'}
              />
              <Button icon={<ReloadOutlined />} onClick={cargar} />
            </div>

            {filtrosVisible && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Select placeholder="Estado" allowClear value={filtroEstado}
                  onChange={setFiltroEstado} style={{ flex: 1, minWidth: 120 }}
                  options={[
                    { value: 'pendiente',  label: 'Pendiente'  },
                    { value: 'en_juego',   label: 'En juego'   },
                    { value: 'finalizado', label: 'Finalizado' },
                  ]}
                />
                <Select placeholder="Categoría" allowClear value={filtroCategoria}
                  onChange={setFiltroCategoria} style={{ flex: 1, minWidth: 130 }}
                  options={CATEGORIAS.map((c) => ({ value: c, label: c }))}
                />
              </div>
            )}

            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>
              {partidosFiltrados.length} partido{partidosFiltrados.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        <Table
          columns={isMobile ? columnsMobile : columnsDesktop}
          dataSource={partidosFiltrados}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: isMobile ? 8 : 10, showSizeChanger: false }}
          size={isMobile ? 'small' : 'middle'}
          locale={{
            emptyText: (
              <Empty description="No hay partidos registrados"
                image={Empty.PRESENTED_IMAGE_SIMPLE}>
                <Button type="primary" icon={<PlusOutlined />}
                  onClick={() => navigate('/partidos/nuevo')}>
                  Crear primer partido
                </Button>
              </Empty>
            ),
          }}
        />
      </Card>
    </div>
  );
}
