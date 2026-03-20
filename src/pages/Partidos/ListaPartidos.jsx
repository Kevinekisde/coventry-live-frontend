import React, { useEffect, useState } from 'react';
import {
  Table, Button, Tag, Space, Input, Select, Card,
  Badge, Tooltip, App, Row, Col, Statistic, Empty,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, EyeOutlined,
  PlayCircleOutlined, TrophyOutlined, CloseCircleOutlined,
  ClockCircleOutlined, ReloadOutlined, BarChartOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { partidosService } from '../../services/partidos.service';

const ESTADO_CONFIG = {
  pendiente:  { color: 'default',   icon: <ClockCircleOutlined />,  label: 'Pendiente'  },
  en_juego:   { color: 'processing', icon: <PlayCircleOutlined />,   label: 'En juego'   },
  finalizado: { color: 'default',   icon: null,                     label: 'Finalizado' },
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
  const navigate = useNavigate();

  const [partidos, setPartidos]     = useState([]);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState('');
  const [filtroEstado, setFiltroEstado]       = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState(null);

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

  // ── Stats rápidas ───────────────────────────────────────
  const finalizados = partidos.filter((p) => p.estado === 'finalizado');
  const victorias   = finalizados.filter((p) => p.resultado === 'victoria').length;
  const derrotas    = finalizados.filter((p) => p.resultado === 'derrota').length;
  const enJuego     = partidos.filter((p) => p.estado === 'en_juego');

  // ── Filtros locales ─────────────────────────────────────
  const partidosFiltrados = partidos.filter((p) => {
    const texto = `${p.rival} ${p.torneo || ''}`.toLowerCase();
    return (
      texto.includes(search.toLowerCase()) &&
      (filtroEstado    ? p.estado    === filtroEstado    : true) &&
      (filtroCategoria ? p.categoria === filtroCategoria : true)
    );
  });

  // ── Columnas ────────────────────────────────────────────
  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      width: 110,
      sorter: (a, b) => dayjs(a.fecha).unix() - dayjs(b.fecha).unix(),
      defaultSortOrder: 'descend',
      render: (f) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1f2937', fontSize: 13 }}>
            {dayjs(f).format('DD MMM YYYY')}
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>
            {dayjs(f).format('dddd')}
          </div>
        </div>
      ),
    },
    {
      title: 'Rival',
      dataIndex: 'rival',
      render: (rival, p) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1f2937' }}>vs {rival}</div>
          {p.torneo && (
            <div style={{ fontSize: 11, color: '#6b7280' }}>{p.torneo}</div>
          )}
          {p.cancha && (
            <div style={{ fontSize: 11, color: '#9ca3af' }}>📍 {p.cancha}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Categoría',
      dataIndex: 'categoria',
      width: 150,
      render: (c) => <Tag color="blue">{c}</Tag>,
    },
    {
      title: 'Sets',
      width: 100,
      render: (_, p) => (
        p.estado === 'finalizado' ? (
          <span style={{ fontWeight: 700, fontSize: 16, color: '#1a3a5c' }}>
            {p.setsGanados}
            <span style={{ color: '#9ca3af', fontWeight: 400 }}> – </span>
            {p.setsPerdidos}
          </span>
        ) : (
          <span style={{ color: '#9ca3af', fontSize: 13 }}>—</span>
        )
      ),
    },
    {
      title: 'Resultado',
      width: 110,
      render: (_, p) => {
        if (p.estado !== 'finalizado') return null;
        const cfg = RESULTADO_CONFIG[p.resultado];
        return <Badge status={cfg.color} text={<span style={{ fontWeight: 600 }}>{cfg.label}</span>} />;
      },
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      width: 130,
      render: (estado) => {
        const cfg = ESTADO_CONFIG[estado];
        return (
          <Badge
            status={cfg.color}
            text={
              <span style={{ fontSize: 13 }}>
                {cfg.icon && <span style={{ marginRight: 4 }}>{cfg.icon}</span>}
                {cfg.label}
              </span>
            }
          />
        );
      },
    },
    {
      title: '',
      width: 130,
      render: (_, p) => (
        <Space>
          {p.estado === 'pendiente' && (
            <Tooltip title="Iniciar partido">
              <Button
                type="primary" size="small"
                icon={<PlayCircleOutlined />}
                onClick={() => navigate(`/partidos/nuevo?id=${p._id}`)}
              >
                Iniciar
              </Button>
            </Tooltip>
          )}
          {p.estado === 'en_juego' && (
            <Tooltip title="Continuar partido en vivo">
              <Button
                type="primary" size="small" danger
                icon={<PlayCircleOutlined />}
                onClick={() => navigate(`/partidos/${p._id}/live`)}
              >
                En vivo
              </Button>
            </Tooltip>
          )}
          {p.estado === 'finalizado' && (
            <Tooltip title="Ver resumen y estadísticas">
              <Button
                size="small"
                icon={<BarChartOutlined />}
                onClick={() => navigate(`/partidos/${p._id}/resumen`)}
              >
                Resumen
              </Button>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#1f2937' }}>Partidos</h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>
            Historial de partidos de Atlético Coventry
          </p>
        </div>
        <Button
          type="primary" icon={<PlusOutlined />} size="large"
          onClick={() => navigate('/partidos/nuevo')}
        >
          Nuevo Partido
        </Button>
      </div>

      {/* ── Stats rápidas ── */}
      <Row gutter={12}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Total partidos"
              value={partidos.length}
              valueStyle={{ color: '#1a3a5c', fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Victorias"
              value={victorias}
              valueStyle={{ color: '#16a34a', fontWeight: 700 }}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Derrotas"
              value={derrotas}
              valueStyle={{ color: '#dc2626', fontWeight: 700 }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="En juego ahora"
              value={enJuego.length}
              valueStyle={{ color: enJuego.length > 0 ? '#d97706' : '#6b7280', fontWeight: 700 }}
              prefix={<PlayCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* ── Partido en juego banner ── */}
      {enJuego.length > 0 && (
        <Card
          style={{ background: '#fef3c7', border: '1px solid #f59e0b', cursor: 'pointer' }}
          size="small"
          onClick={() => navigate(`/partidos/${enJuego[0]._id}/live`)}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Badge status="processing" />
              <span style={{ fontWeight: 700, color: '#92400e' }}>
                Partido en curso: Atlético Coventry vs {enJuego[0].rival}
              </span>
            </div>
            <Button type="primary" size="small" icon={<PlayCircleOutlined />}
              style={{ background: '#d97706', borderColor: '#d97706' }}>
              Continuar
            </Button>
          </div>
        </Card>
      )}

      {/* ── Tabla ── */}
      <Card>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input
            placeholder="Buscar por rival o torneo..."
            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: 240 }}
          />
          <Select
            placeholder="Estado"
            allowClear
            value={filtroEstado}
            onChange={setFiltroEstado}
            style={{ width: 140 }}
            options={[
              { value: 'pendiente',  label: 'Pendiente'  },
              { value: 'en_juego',   label: 'En juego'   },
              { value: 'finalizado', label: 'Finalizado' },
            ]}
          />
          <Select
            placeholder="Categoría"
            allowClear
            value={filtroCategoria}
            onChange={setFiltroCategoria}
            style={{ width: 180 }}
            options={CATEGORIAS.map((c) => ({ value: c, label: c }))}
          />
          <Button icon={<ReloadOutlined />} onClick={cargar}>Actualizar</Button>
          <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: 13 }}>
            {partidosFiltrados.length} partido{partidosFiltrados.length !== 1 ? 's' : ''}
          </span>
        </div>

        <Table
          columns={columns}
          dataSource={partidosFiltrados}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          size="middle"
          locale={{
            emptyText: (
              <Empty
                description="No hay partidos registrados"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
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
