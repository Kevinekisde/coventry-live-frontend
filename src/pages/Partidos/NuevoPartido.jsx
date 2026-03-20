import React, { useEffect, useState } from 'react';
import {
  Card, Form, Input, Select, DatePicker, Button,
  Steps, Avatar, Checkbox, Tag, Alert, App,
  Row, Col, Divider, Badge, Empty, Spin,
} from 'antd';
import {
  ArrowLeftOutlined, ArrowRightOutlined,
  PlayCircleOutlined, TeamOutlined,
  TrophyOutlined, UserOutlined, CalendarOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { partidosService } from '../../services/partidos.service';
import { jugadoresService } from '../../services/jugadores.service';

const CATEGORIAS = [
  'Adulto Masculino', 'Adulto Femenino',
  'Sub-18 M', 'Sub-18 F', 'Sub-15 M', 'Sub-15 F',
];

const POSICION_COLOR = {
  Armador: 'blue', Opuesto: 'purple', Punta: 'green',
  Central: 'orange', Líbero: 'cyan', Auxiliar: 'default',
};

const STEPS = [
  { title: 'Datos del partido', icon: <CalendarOutlined /> },
  { title: 'Nómina',            icon: <TeamOutlined />     },
  { title: 'Confirmar',         icon: <TrophyOutlined />   },
];

export default function NuevoPartido() {
  const { message } = App.useApp();
  const navigate    = useNavigate();

  const [step, setStep]           = useState(0);
  const [form] = Form.useForm();

  // Jugadores disponibles
  const [jugadores, setJugadores] = useState([]);
  const [loadingJug, setLoadingJug] = useState(false);

  // Nómina seleccionada: { [jugadorId]: { seleccionado, titular } }
  const [nomina, setNomina] = useState({});

  const [creando, setCreando]     = useState(false);
  const [datosPartido, setDatosPartido] = useState(null);

  // ── Cargar jugadores ────────────────────────────────────
  useEffect(() => {
    const cargarJugadores = async () => {
      setLoadingJug(true);
      try {
        const res = await jugadoresService.listar({ activo: true });
        setJugadores(res.data);
      } catch (err) {
        message.error(err.message);
      } finally {
        setLoadingJug(false);
      }
    };
    cargarJugadores();
  }, []);

  // ── Navegación entre pasos ──────────────────────────────
  const siguientePaso = async () => {
    if (step === 0) {
      try {
        const values = await form.validateFields();
        setDatosPartido(values);
        setStep(1);
      } catch (_) {}
    } else if (step === 1) {
      const seleccionados = Object.entries(nomina).filter(([, v]) => v.seleccionado);
      if (seleccionados.length < 6) {
        message.warning('Selecciona al menos 6 jugadores para la nómina');
        return;
      }
      setStep(2);
    }
  };

  const pasoAnterior = () => setStep((s) => s - 1);

  // ── Toggle jugador en nómina ────────────────────────────
  const toggleJugador = (id) => {
    setNomina((prev) => ({
      ...prev,
      [id]: {
        seleccionado: !prev[id]?.seleccionado,
        titular:      prev[id]?.titular || false,
      },
    }));
  };

  const toggleTitular = (id) => {
    setNomina((prev) => ({
      ...prev,
      [id]: { ...prev[id], titular: !prev[id]?.titular },
    }));
  };

  // ── Crear partido + iniciar ─────────────────────────────
  const crearEIniciar = async () => {
    try {
      setCreando(true);

      const nominaPayload = Object.entries(nomina)
        .filter(([, v]) => v.seleccionado)
        .map(([jugadorId, v]) => ({ jugador: jugadorId, titular: v.titular }));

      // 1. Crear partido
      const resPartido = await partidosService.crear({
        ...datosPartido,
        fecha:   datosPartido.fecha.toISOString(),
        nomina:  nominaPayload,
      });

      const partidoId = resPartido.data._id;

      // 2. Iniciar partido (crea Set 1)
      await partidosService.iniciar(partidoId);

      message.success('¡Partido iniciado! Redirigiendo al live...');
      navigate(`/partidos/${partidoId}/live`);
    } catch (err) {
      message.error(err.message);
    } finally {
      setCreando(false);
    }
  };

  // ── Jugadores seleccionados (para resumen) ──────────────
  const jugadoresSeleccionados = jugadores.filter((j) => nomina[j._id]?.seleccionado);
  const titulares  = jugadoresSeleccionados.filter((j) => nomina[j._id]?.titular);
  const suplentes  = jugadoresSeleccionados.filter((j) => !nomina[j._id]?.titular);

  // ── Agrupar jugadores por posición ─────────────────────
  const jugadoresPorPosicion = jugadores.reduce((acc, j) => {
    if (!acc[j.posicion]) acc[j.posicion] = [];
    acc[j.posicion].push(j);
    return acc;
  }, {});

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Button
          icon={<ArrowLeftOutlined />} type="text"
          onClick={() => navigate('/partidos')}
        />
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#1f2937' }}>
            Nuevo Partido
          </h1>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>
            Atlético Coventry
          </p>
        </div>
      </div>

      {/* Steps */}
      <Steps
        current={step}
        items={STEPS}
        size="small"
      />

      {/* ── PASO 0: Datos del partido ── */}
      {step === 0 && (
        <Card title="Datos del partido">
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="rival" label="Rival"
                  rules={[{ required: true, message: 'Ingresa el nombre del rival' }]}>
                  <Input placeholder="Ej: Club Deportivo Norte" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="fecha" label="Fecha"
                  rules={[{ required: true, message: 'Selecciona la fecha' }]}>
                  <DatePicker
                    style={{ width: '100%' }} size="large"
                    format="DD/MM/YYYY"
                    placeholder="Seleccionar fecha"
                    defaultValue={dayjs()}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="categoria" label="Categoría"
                  rules={[{ required: true, message: 'Selecciona la categoría' }]}>
                  <Select
                    size="large" placeholder="Seleccionar..."
                    options={CATEGORIAS.map((c) => ({ value: c, label: c }))}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="tipo" label="Tipo" initialValue="Oficial">
                  <Select size="large" options={[
                    { value: 'Oficial',   label: 'Oficial'   },
                    { value: 'Amistoso',  label: 'Amistoso'  },
                  ]} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="torneo" label="Torneo / Liga">
                  <Input placeholder="Ej: Liga Regional 2026" size="large" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="cancha" label="Cancha / Sede">
                  <Input placeholder="Ej: Gimnasio Municipal" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="mejorDe" label="Formato" initialValue={5}>
              <Select size="large" style={{ width: 220 }} options={[
                { value: 3, label: 'Mejor de 3 sets (gana 2)' },
                { value: 5, label: 'Mejor de 5 sets (gana 3)' },
              ]} />
            </Form.Item>
          </Form>
        </Card>
      )}

      {/* ── PASO 1: Nómina ── */}
      {step === 1 && (
        <Card
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Seleccionar Nómina</span>
              <Tag color="blue">
                {Object.values(nomina).filter((v) => v.seleccionado).length} seleccionados
              </Tag>
            </div>
          }
        >
          {loadingJug ? (
            <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
          ) : jugadores.length === 0 ? (
            <Empty description="No hay jugadores registrados">
              <Button type="primary" onClick={() => navigate('/jugadores')}>
                Ir a Jugadores
              </Button>
            </Empty>
          ) : (
            <>
              <Alert
                type="info" showIcon style={{ marginBottom: 16 }}
                message="Selecciona los jugadores presentes y marca los titulares del partido"
              />

              {Object.entries(jugadoresPorPosicion).map(([posicion, jugs]) => (
                <div key={posicion} style={{ marginBottom: 20 }}>
                  <div style={{ marginBottom: 8 }}>
                    <Tag color={POSICION_COLOR[posicion]} style={{ fontSize: 13, padding: '2px 10px' }}>
                      {posicion}
                    </Tag>
                  </div>
                  <Row gutter={[10, 10]}>
                    {jugs.map((j) => {
                      const seleccionado = !!nomina[j._id]?.seleccionado;
                      const titular      = !!nomina[j._id]?.titular;
                      return (
                        <Col key={j._id} xs={24} sm={12} md={8}>
                          <div
                            onClick={() => toggleJugador(j._id)}
                            style={{
                              border: `2px solid ${seleccionado ? '#1a3a5c' : '#e5e7eb'}`,
                              borderRadius: 10,
                              padding: '10px 14px',
                              cursor: 'pointer',
                              background: seleccionado ? '#eff6ff' : '#fff',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <Avatar
                                size={36}
                                icon={<UserOutlined />}
                                style={{
                                  background: seleccionado ? '#1a3a5c' : '#e5e7eb',
                                  color: seleccionado ? '#fff' : '#6b7280',
                                  flexShrink: 0,
                                }}
                              >
                                {j.numeroCamiseta}
                              </Avatar>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 13, color: '#1f2937' }}>
                                  {j.nombre} {j.apellido}
                                </div>
                                <div style={{ fontSize: 11, color: '#6b7280' }}>
                                  #{j.numeroCamiseta}
                                </div>
                              </div>
                            </div>

                            {seleccionado && (
                              <div
                                onClick={(e) => { e.stopPropagation(); toggleTitular(j._id); }}
                              >
                                <Tag
                                  color={titular ? 'gold' : 'default'}
                                  style={{ cursor: 'pointer', userSelect: 'none', margin: 0 }}
                                >
                                  {titular ? '⭐ Titular' : 'Suplente'}
                                </Tag>
                              </div>
                            )}
                          </div>
                        </Col>
                      );
                    })}
                  </Row>
                </div>
              ))}
            </>
          )}
        </Card>
      )}

      {/* ── PASO 2: Confirmación ── */}
      {step === 2 && datosPartido && (
        <Card title="Confirmar partido">
          {/* Datos del partido */}
          <div style={{
            background: '#f8fafc', borderRadius: 10,
            padding: 16, marginBottom: 20,
          }}>
            <Row gutter={[16, 8]}>
              <Col span={12}>
                <div style={{ color: '#6b7280', fontSize: 12 }}>Rival</div>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#1a3a5c' }}>
                  vs {datosPartido.rival}
                </div>
              </Col>
              <Col span={12}>
                <div style={{ color: '#6b7280', fontSize: 12 }}>Fecha</div>
                <div style={{ fontWeight: 600, color: '#1f2937' }}>
                  {dayjs(datosPartido.fecha).format('DD [de] MMMM [de] YYYY')}
                </div>
              </Col>
              <Col span={12}>
                <div style={{ color: '#6b7280', fontSize: 12 }}>Categoría</div>
                <Tag color="blue">{datosPartido.categoria}</Tag>
              </Col>
              <Col span={12}>
                <div style={{ color: '#6b7280', fontSize: 12 }}>Formato</div>
                <div style={{ color: '#1f2937' }}>Mejor de {datosPartido.mejorDe}</div>
              </Col>
              {datosPartido.torneo && (
                <Col span={12}>
                  <div style={{ color: '#6b7280', fontSize: 12 }}>Torneo</div>
                  <div style={{ color: '#1f2937' }}>{datosPartido.torneo}</div>
                </Col>
              )}
              {datosPartido.cancha && (
                <Col span={12}>
                  <div style={{ color: '#6b7280', fontSize: 12 }}>Cancha</div>
                  <div style={{ color: '#1f2937' }}>{datosPartido.cancha}</div>
                </Col>
              )}
            </Row>
          </div>

          <Divider orientation="left">
            <TeamOutlined /> Nómina ({jugadoresSeleccionados.length} jugadores)
          </Divider>

          {/* Titulares */}
          {titulares.length > 0 && (
            <>
              <div style={{ marginBottom: 8, fontWeight: 600, color: '#92400e' }}>
                ⭐ Titulares ({titulares.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {titulares.map((j) => (
                  <Tag key={j._id} color="gold" style={{ padding: '4px 10px', fontSize: 13 }}>
                    #{j.numeroCamiseta} {j.nombre} {j.apellido}
                    <span style={{ marginLeft: 6, opacity: 0.7 }}>
                      <Tag color={POSICION_COLOR[j.posicion]} style={{ margin: 0, fontSize: 11 }}>
                        {j.posicion}
                      </Tag>
                    </span>
                  </Tag>
                ))}
              </div>
            </>
          )}

          {/* Suplentes */}
          {suplentes.length > 0 && (
            <>
              <div style={{ marginBottom: 8, fontWeight: 600, color: '#6b7280' }}>
                Suplentes ({suplentes.length})
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {suplentes.map((j) => (
                  <Tag key={j._id} style={{ padding: '4px 10px', fontSize: 13 }}>
                    #{j.numeroCamiseta} {j.nombre} {j.apellido}
                  </Tag>
                ))}
              </div>
            </>
          )}

          <Alert
            type="success" showIcon style={{ marginTop: 20 }}
            message="Al confirmar se creará el partido y comenzará el Set 1 automáticamente"
          />
        </Card>
      )}

      {/* ── Botones de navegación ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={step === 0 ? () => navigate('/partidos') : pasoAnterior}
          disabled={creando}
        >
          {step === 0 ? 'Cancelar' : 'Anterior'}
        </Button>

        {step < 2 ? (
          <Button type="primary" icon={<ArrowRightOutlined />}
            iconPosition="end" onClick={siguientePaso}>
            Siguiente
          </Button>
        ) : (
          <Button
            type="primary" size="large"
            icon={<PlayCircleOutlined />}
            onClick={crearEIniciar}
            loading={creando}
            style={{ background: '#16a34a', borderColor: '#16a34a' }}
          >
            ¡Iniciar Partido!
          </Button>
        )}
      </div>
    </div>
  );
}
