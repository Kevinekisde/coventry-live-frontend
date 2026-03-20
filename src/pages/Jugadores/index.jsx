import React, { useEffect, useState } from 'react';
import {
  Table, Button, Tag, Space, Input, Select, Card,
  Modal, Form, InputNumber, Avatar, Tooltip,
  App, Popconfirm, Row, Col, Statistic,
} from 'antd';
import {
  PlusOutlined, EditOutlined, UserDeleteOutlined,
  SearchOutlined, UserOutlined, ReloadOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { jugadoresService } from '../../services/jugadores.service';

const POSICIONES = ['Armador', 'Opuesto', 'Punta', 'Central', 'Líbero', 'Auxiliar'];
const POSICION_COLOR = {
  Armador: 'blue', Opuesto: 'purple', Punta: 'green',
  Central: 'orange', Líbero: 'cyan', Auxiliar: 'default',
};

export default function Jugadores() {
  const { message } = App.useApp();
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

  const abrirCrear = () => {
    setEditando(null);
    form.resetFields();
    setModalOpen(true);
  };

  const abrirEditar = (j) => {
    setEditando(j);
    form.setFieldsValue(j);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setEditando(null);
    form.resetFields();
  };

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

  const columns = [
    {
      title: '#',
      dataIndex: 'numeroCamiseta',
      width: 64,
      sorter: (a, b) => a.numeroCamiseta - b.numeroCamiseta,
      defaultSortOrder: 'ascend',
      render: (n) => (
        <span style={{ color: '#1a3a5c', fontWeight: 700, fontSize: 18 }}>{n}</span>
      ),
    },
    {
      title: 'Jugador',
      render: (_, j) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar size={40} icon={<UserOutlined />} src={j.foto}
            style={{ background: '#1a3a5c', flexShrink: 0 }} />
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#1f2937' }}>Plantel</h1>
          <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: 13 }}>
            Atlético Coventry — jugadores activos
          </p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={abrirCrear}>
          Agregar Jugador
        </Button>
      </div>

      {/* Cards por posición */}
      <Row gutter={12}>
        {POSICIONES.map((pos) => (
          <Col key={pos} xs={12} sm={8} md={4}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <Statistic
                title={<Tag color={POSICION_COLOR[pos]} style={{ margin: 0 }}>{pos}</Tag>}
                value={jugadores.filter((j) => j.posicion === pos).length}
                valueStyle={{ fontSize: 22, color: '#1a3a5c', fontWeight: 700 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Tabla */}
      <Card>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input
            placeholder="Buscar por nombre o número..."
            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: 260 }}
          />
          <Select
            placeholder="Filtrar posición"
            allowClear
            value={filtroPosicion}
            onChange={setFiltro}
            style={{ width: 180 }}
            options={POSICIONES.map((p) => ({ value: p, label: p }))}
          />
          <Button icon={<ReloadOutlined />} onClick={cargar}>Actualizar</Button>
          <span style={{ marginLeft: 'auto', color: '#9ca3af', fontSize: 13 }}>
            {jugadoresFiltrados.length} jugador{jugadoresFiltrados.length !== 1 ? 'es' : ''}
          </span>
        </div>

        <Table
          columns={columns}
          dataSource={jugadoresFiltrados}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 15, showSizeChanger: false }}
          size="middle"
        />
      </Card>

      {/* Modal */}
      <Modal
        title={
          <Space>
            <TrophyOutlined style={{ color: '#1a3a5c' }} />
            {editando ? 'Editar Jugador' : 'Agregar Jugador al Plantel'}
          </Space>
        }
        open={modalOpen}
        onCancel={cerrarModal}
        onOk={guardar}
        okText={editando ? 'Guardar cambios' : 'Agregar'}
        cancelText="Cancelar"
        confirmLoading={guardando}
        width={520}
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
                rules={[{ required: true, message: 'Ingresa el nombre' }]}>
                <Input placeholder="Ej: Juan" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="apellido" label="Apellido"
                rules={[{ required: true, message: 'Ingresa el apellido' }]}>
                <Input placeholder="Ej: Pérez" />
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
                rules={[{ required: true, message: 'Selecciona la posición' }]}>
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
                  { value: 'Derecha', label: 'Derecha' },
                  { value: 'Izquierda', label: 'Izquierda' },
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
