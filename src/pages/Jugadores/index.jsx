import React, { useEffect, useState } from 'react';
import {
  Table, Button, Tag, Space, Input, Select, Card,
  Modal, Form, InputNumber, Avatar, Tooltip,
  App, Popconfirm, Row, Col, Statistic, Grid,
} from 'antd';
import {
  PlusOutlined, EditOutlined, UserDeleteOutlined,
  SearchOutlined, UserOutlined, ReloadOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { jugadoresService } from '../../services/jugadores.service';

const { useBreakpoint } = Grid;

const POSICIONES = ['Armador', 'Opuesto', 'Punta', 'Central', 'Líbero', 'Auxiliar'];
const POSICION_COLOR = {
  Armador: 'blue', Opuesto: 'purple', Punta: 'green',
  Central: 'orange', Líbero: 'cyan', Auxiliar: 'default',
};

export default function Jugadores() {
  const { message } = App.useApp();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [jugadores, setJugadores]   = useState([]);
  const [loading, setLoading]       = useState(false);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editando, setEditando]     = useState(null);
  const [search, setSearch]         = useState('');
  const [filtroPosicion, setFiltro] = useState(null);
  const [guardando, setGuardando]   = useState(false);
  const [form] = Form.useForm();

  const cargar = async () => {
    setLoading(true);
    try {
      const res = await jugadoresService.listar({ activo: true });
      setJugadores(res.data);
    } catch (err) {
      message.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const jugadoresFiltrados = jugadores.filter((j) => {
    const texto = `${j.nombre} ${j.apellido} ${j.numeroCamiseta}`.toLowerCase();
    return (
      texto.includes(search.toLowerCase()) &&
      (filtroPosicion ? j.posicion === filtroPosicion : true)
    );
  });

  const abrirCrear = () => { setEditando(null); form.resetFields(); setModalOpen(true); };
  const abrirEditar = (j) => { setEditando(j); form.setFieldsValue(j); setModalOpen(true); };
  const cerrarModal = () => { setModalOpen(false); setEditando(null); form.resetFields(); };

  const guardar = async () => {
    try {
      const values = await form.validateFields();
      setGuardando(true);
      if (editando) {
        await jugadoresService.editar(editando._id, values);
        message.success('Jugador actualizado');
      } else {
        await jugadoresService.crear(values);
        message.success('Jugador agregado al plantel');
      }
      cerrarModal();
      cargar();
    } catch (err) {
      if (err.message) message.error(err.message);
    } finally {
      setGuardando(false);
    }
  };

  const desactivar = async (j) => {
    try {
      await jugadoresService.desactivar(j._id);
      message.success(`${j.nombre} ${j.apellido} removido del plantel`);
      cargar();
    } catch (err) {
      message.error(err.message);
    }
  };

  // ── Columnas desktop ──────────────────────────────────────
  const columnsDesktop = [
    {
      title: '#',
      dataIndex: 'numeroCamiseta',
      width: 64,
      sorter: (a, b) => a.numeroCamiseta - b.numeroCamiseta,
      defaultSortOrder: 'ascend',
      render: (n) => (
        <span style={{ color: '#ff4fb4', fontWeight: 700, fontSize: 18 }}>{n}</span>
      ),
    },
    {
      title: 'Jugador',
      render: (_, j) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar size={40} icon={<UserOutlined />} src={j.foto}
            style={{ background: '#000101', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, color: '#1f2937' }}>
              {j.nombre} {j.apellido}
            </div>
            {j.altura && (
              <div style={{ fontSize: 12, color: '#9ca3af' }}>{j.altura} cm</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Posición',
      dataIndex: 'posicion',
      width: 130,
      render: (p) => <Tag color={POSICION_COLOR[p]}>{p}</Tag>,
    },
    {
      title: 'Mano',
      dataIndex: 'mano',
      width: 90,
      render: (m) => <span style={{ color: '#6b7280', fontSize: 13 }}>{m}</span>,
    },
    {
      title: 'Notas',
      dataIndex: 'notas',
      ellipsis: true,
      render: (n) => <span style={{ color: '#9ca3af', fontSize: 13 }}>{n || '—'}</span>,
    },
    {
      title: '',
      width: 90,
      render: (_, j) => (
        <Space>
          <Tooltip title="Editar">
            <Button size="small" type="text" icon={<EditOutlined />}
              onClick={() => abrirEditar(j)} />
          </Tooltip>
          <Popconfirm
            title="¿Remover del plantel?"
            description={`${j.nombre} ${j.apellido} dejará de aparecer en nóminas`}
            onConfirm={() => desactivar(j)}
            okText="Remover" cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Remover del plantel">
              <Button size="small" type="text" danger icon={<UserDeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ── Columnas móvil — compactas ────────────────────────────
  const columnsMobile = [
    {
      title: '#',
      dataIndex: 'numeroCamiseta',
      width: 44,
      render: (n) => (
        <span style={{ color: '#ff4fb4', fontWeight: 700, fontSize: 16 }}>{n}</span>
      ),
    },
    {
      title: 'Jugador',
      render: (_, j) => (
        <div>
          <div style={{ fontWeight: 600, color: '#1f2937', fontSize: 14 }}>
            {j.nombre} {j.apellido}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
            <Tag color={POSICION_COLOR[j.posicion]} style={{ margin: 0, fontSize: 11 }}>
              {j.posicion}
            </Tag>
            {j.altura && (
              <span style={{ fontSize: 11, color: '#9ca3af' }}>{j.altura} cm</span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '',
      width: 72,
      render: (_, j) => (
        <Space size={4}>
          <Button size="small" type="text" icon={<EditOutlined />}
            onClick={() => abrirEditar(j)} />
          <Popconfirm
            title="¿Remover del plantel?"
            onConfirm={() => desactivar(j)}
            okText="Remover" cancelText="Cancelar"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" type="text" danger icon={<UserDeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 20 }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'center' : 'flex-start',
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 20 : 24, fontWeight: 700, color: '#1f2937' }}>
            Plantel
          </h1>
          {!isMobile && (
            <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>
              Atlético Coventry — jugadores activos
            </p>
          )}
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size={isMobile ? 'middle' : 'large'}
          onClick={abrirCrear}
        >
          {isMobile ? 'Agregar' : 'Agregar Jugador'}
        </Button>
      </div>

      {/* ── Cards por posición ── */}
      <Row gutter={[8, 8]}>
        {POSICIONES.map((pos) => (
          <Col key={pos} xs={8} sm={8} md={4}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 4 }}>
                <Tag color={POSICION_COLOR[pos]} style={{ margin: 0, fontSize: isMobile ? 10 : 12 }}>
                  {isMobile ? pos.slice(0, 3) : pos}
                </Tag>
              </div>
              <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: '#ff4fb4' }}>
                {jugadores.filter((j) => j.posicion === pos).length}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── Tabla ── */}
      <Card bodyStyle={{ padding: isMobile ? '12px 8px' : 24 }}>

        {/* Filtros */}
        <div style={{
          display: 'flex', gap: 8, marginBottom: 12,
          flexDirection: isMobile ? 'column' : 'row',
          flexWrap: 'wrap', alignItems: isMobile ? 'stretch' : 'center',
        }}>
          <Input
            placeholder="Buscar por nombre o número..."
            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: isMobile ? '100%' : 260 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <Select
              placeholder="Posición"
              allowClear
              value={filtroPosicion}
              onChange={setFiltro}
              style={{ flex: 1, minWidth: 130 }}
              options={POSICIONES.map((p) => ({ value: p, label: p }))}
            />
            <Button icon={<ReloadOutlined />} onClick={cargar} />
          </div>
          <span style={{
            color: '#9ca3af', fontSize: 12,
            marginLeft: isMobile ? 0 : 'auto',
          }}>
            {jugadoresFiltrados.length} jugador{jugadoresFiltrados.length !== 1 ? 'es' : ''}
          </span>
        </div>

        <Table
          columns={isMobile ? columnsMobile : columnsDesktop}
          dataSource={jugadoresFiltrados}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: isMobile ? 10 : 15, showSizeChanger: false }}
          size={isMobile ? 'small' : 'middle'}
          scroll={isMobile ? undefined : { x: 600 }}
        />
      </Card>

      {/* ── Modal ── */}
      <Modal
        title={
          <Space>
            <TrophyOutlined style={{ color: '#ff4fb4' }} />
            {editando ? 'Editar Jugador' : 'Agregar Jugador'}
          </Space>
        }
        open={modalOpen}
        onCancel={cerrarModal}
        onOk={guardar}
        okText={editando ? 'Guardar' : 'Agregar'}
        cancelText="Cancelar"
        confirmLoading={guardando}
        width={isMobile ? '95vw' : 520}
        style={isMobile ? { top: 20 } : {}}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 16 }}
          initialValues={{ mano: 'Derecha' }}
        >
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="nombre" label="Nombre"
                rules={[{ required: true, message: 'Requerido' }]}>
                <Input placeholder="Juan" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="apellido" label="Apellido"
                rules={[{ required: true, message: 'Requerido' }]}>
                <Input placeholder="Pérez" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={8}>
              <Form.Item name="numeroCamiseta" label="N° Camiseta"
                rules={[{ required: true, message: 'Requerido' }]}>
                <InputNumber min={1} max={99} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="posicion" label="Posición"
                rules={[{ required: true, message: 'Requerido' }]}>
                <Select
                  placeholder="Seleccionar..."
                  options={POSICIONES.map((p) => ({
                    value: p,
                    label: <Tag color={POSICION_COLOR[p]}>{p}</Tag>,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="mano" label="Mano hábil">
                <Select options={[
                  { value: 'Derecha',    label: 'Derecha'    },
                  { value: 'Izquierda',  label: 'Izquierda'  },
                ]} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="altura" label="Altura (cm)">
                <InputNumber min={140} max={230} style={{ width: '100%' }} placeholder="185" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="notas" label="Notas">
            <Input.TextArea rows={2} placeholder="Observaciones opcionales..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
