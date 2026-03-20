import React, { useEffect, useState } from 'react';
import {
  Card, Form, Input, Select, DatePicker, Button,
  Steps, Avatar, Tag, Alert, App,
  Row, Col, Divider, Empty, Spin, Grid,
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

const { useBreakpoint } = Grid;

const CATEGORIAS = [
  'Adulto Masculino', 'Adulto Femenino',
  'Sub-18 M', 'Sub-18 F', 'Sub-15 M', 'Sub-15 F',
];

const POSICION_COLOR = {
  Armador: 'blue', Opuesto: 'purple', Punta: 'green',
  Central: 'orange', Líbero: 'cyan', Auxiliar: 'default',
};

const STEPS = [
  { title: 'Datos',    icon: <CalendarOutlined /> },
  { title: 'Nómina',   icon: <TeamOutlined />     },
  { title: 'Confirmar',icon: <TrophyOutlined />   },
];

export default function NuevoPartido() {
  const { message } = App.useApp();
  const navigate    = useNavigate();
  const screens     = useBreakpoint();
  const isMobile    = !screens.md;

  const [step, setStep]                 = useState(0);
  const [form]                          = Form.useForm();
  const [jugadores, setJugadores]       = useState([]);
  const [loadingJug, setLoadingJug]     = useState(false);
  const [nomina, setNomina]             = useState({});
  const [creando, setCreando]           = useState(false);
  const [datosPartido, setDatosPartido] = useState(null);

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

  const crearEIniciar = async () => {
    try {
      setCreando(true);
      const nominaPayload = Object.entries(nomina)
        .filter(([, v]) => v.seleccionado)
        .map(([jugadorId, v]) => ({ jugador: jugadorId, titular: v.titular }));

      const resPartido = await partidosService.crear({
        ...datosPartido,
        fecha:  datosPartido.fecha.toISOString(),
        nomina: nominaPayload,
      });
      await partidosService.iniciar(resPartido.data._id);
      message.success('¡Partido iniciado!');
      navigate(`/partidos/${resPartido.data._id}/live`);
    } catch (err) {
      message.error(err.message);
    } finally {
      setCreando(false);
    }
  };

  const jugadoresSeleccionados = jugadores.filter((j) => nomina[j._id]?.seleccionado);
  const titulares  = jugadoresSeleccionados.filter((j) =>  nomina[j._id]?.titular);
  const suplentes  = jugadoresSeleccionados.filter((j) => !nomina[j._id]?.titular);
  const jugadoresPorPosicion = jugadores.reduce((acc, j) => {
    if (!acc[j.posicion]) acc[j.posicion] = [];
    acc[j.posicion].push(j);
    return acc;
  }, {});

  // ── Paso 0: Datos ───────────────────────────────────────
  const paso0 = (
    <Card title="Datos del partido" size={isMobile ? 'small' : 'default'}>
      <Form form={form} layout="vertical">
        {/* Rival + Fecha — en móvil van apilados */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="rival" label="Rival"
              rules={[{ required: true, message: 'Ingresa el nombre del rival' }]}>
              <Input placeholder="Club Deportivo Norte" size="large" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="fecha" label="Fecha"
              rules={[{ required: true, message: 'Selecciona la fecha' }]}>
              <DatePicker
                style={{ width: '100%' }} size="large"
                format="DD/MM/YYYY" placeholder="Seleccionar fecha"
                defaultValue={dayjs()}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="categoria" label="Categoría"
              rules={[{ required: true, message: 'Selecciona la categoría' }]}>
              <Select size="large" placeholder="Seleccionar..."
                options={CATEGORIAS.map((c) => ({ value: c, label: c }))} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="tipo" label="Tipo" initialValue="Oficial">
              <Select size="large" options={[
                { value: 'Oficial',  label: 'Oficial'  },
                { value: 'Amistoso', label: 'Amistoso' },
              ]} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="torneo" label="Torneo / Liga">
              <Input placeholder="Liga Regional 2026" size="large" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="cancha" label="Cancha / Sede">
              <Input placeholder="Gimnasio Municipal" size="large" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="mejorDe" label="Formato" initialValue={5}>
          <Select size="large" style={{ width: isMobile ? '100%' : 260 }} options={[
            { value: 3, label: 'Mejor de 3 sets (gana 2)' },
            { value: 5, label: 'Mejor de 5 sets (gana 3)' },
          ]} />
        </Form.Item>
      </Form>
    </Card>
  );

  // ── Paso 1: Nómina ──────────────────────────────────────
  const totalSeleccionados = Object.values(nomina).filter((v) => v.seleccionado).length;

  const paso1 = (
    <Card
      size={isMobile ? 'small' : 'default'}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Seleccionar Nómina</span>
          <Tag color={totalSeleccionados >= 6 ? 'green' : 'blue'}>
            {totalSeleccionados} / mín. 6
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
            message={
              isMobile
                ? 'Toca para seleccionar · toca ⭐/Suplente para cambiar rol'
                : 'Selecciona los jugadores presentes y marca los titulares del partido'
            }
          />

          {Object.entries(jugadoresPorPosicion).map(([posicion, jugs]) => (
            <div key={posicion} style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>
                <Tag color={POSICION_COLOR[posicion]}
                  style={{ fontSize: 12, padding: '2px 10px' }}>
                  {posicion}
                </Tag>
              </div>

              <Row gutter={[8, 8]}>
                {jugs.map((j) => {
                  const seleccionado = !!nomina[j._id]?.seleccionado;
                  const titular      = !!nomina[j._id]?.titular;

                  return (
                    <Col key={j._id} xs={24} sm={12} md={8}>
                      <div
                        onClick={() => toggleJugador(j._id)}
                        style={{
                          border: `2px solid ${seleccionado ? '#ff4fb4' : '#e5e7eb'}`,
                          borderRadius: 10,
                          padding: isMobile ? '8px 10px' : '10px 14px',
                          cursor: 'pointer',
                          background: seleccionado ? '#fff0f8' : '#fff',
                          transition: 'all 0.15s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Avatar
                            size={isMobile ? 30 : 36}
                            icon={<UserOutlined />}
                            style={{
                              background: seleccionado ? '#ff4fb4' : '#e5e7eb',
                              color: seleccionado ? '#fff' : '#6b7280',
                              fontSize: 12, flexShrink: 0,
                            }}
                          >
                            {j.numeroCamiseta}
                          </Avatar>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: isMobile ? 12 : 13, color: '#1f2937' }}>
                              {j.nombre} {j.apellido}
                            </div>
                            <div style={{ fontSize: 11, color: '#9ca3af' }}>
                              #{j.numeroCamiseta}
                            </div>
                          </div>
                        </div>

                        {seleccionado && (
                          <div onClick={(e) => { e.stopPropagation(); toggleTitular(j._id); }}>
                            <Tag
                              color={titular ? 'gold' : 'default'}
                              style={{ cursor: 'pointer', userSelect: 'none', margin: 0, fontSize: 11 }}
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
  );

  // ── Paso 2: Confirmación ────────────────────────────────
  const paso2 = datosPartido && (
    <Card title="Confirmar partido" size={isMobile ? 'small' : 'default'}>

      {/* Datos del partido */}
      <div style={{
        background: '#f8fafc', borderRadius: 10,
        padding: isMobile ? 12 : 16, marginBottom: 20,
      }}>
        <Row gutter={[12, 10]}>
          <Col xs={12}>
            <div style={{ color: '#6b7280', fontSize: 11 }}>Rival</div>
            <div style={{ fontWeight: 700, fontSize: isMobile ? 15 : 16, color: '#ff4fb4' }}>
              vs {datosPartido.rival}
            </div>
          </Col>
          <Col xs={12}>
            <div style={{ color: '#6b7280', fontSize: 11 }}>Fecha</div>
            <div style={{ fontWeight: 600, color: '#1f2937', fontSize: isMobile ? 12 : 14 }}>
              {dayjs(datosPartido.fecha).format(isMobile ? 'DD/MM/YYYY' : 'DD [de] MMMM [de] YYYY')}
            </div>
          </Col>
          <Col xs={12}>
            <div style={{ color: '#6b7280', fontSize: 11 }}>Categoría</div>
            <Tag color="blue" style={{ fontSize: isMobile ? 10 : 12 }}>
              {datosPartido.categoria}
            </Tag>
          </Col>
          <Col xs={12}>
            <div style={{ color: '#6b7280', fontSize: 11 }}>Formato</div>
            <div style={{ color: '#1f2937', fontSize: isMobile ? 12 : 14 }}>
              Mejor de {datosPartido.mejorDe}
            </div>
          </Col>
          {datosPartido.torneo && (
            <Col xs={12}>
              <div style={{ color: '#6b7280', fontSize: 11 }}>Torneo</div>
              <div style={{ color: '#1f2937', fontSize: 12 }}>{datosPartido.torneo}</div>
            </Col>
          )}
          {datosPartido.cancha && (
            <Col xs={12}>
              <div style={{ color: '#6b7280', fontSize: 11 }}>Cancha</div>
              <div style={{ color: '#1f2937', fontSize: 12 }}>{datosPartido.cancha}</div>
            </Col>
          )}
        </Row>
      </div>

      <Divider orientation="left" style={{ fontSize: 13 }}>
        <TeamOutlined /> Nómina ({jugadoresSeleccionados.length})
      </Divider>

      {/* Titulares */}
      {titulares.length > 0 && (
        <>
          <div style={{ marginBottom: 8, fontWeight: 600, color: '#92400e', fontSize: 13 }}>
            ⭐ Titulares ({titulares.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
            {titulares.map((j) => (
              <Tag key={j._id} color="gold"
                style={{ padding: isMobile ? '3px 8px' : '4px 10px', fontSize: isMobile ? 11 : 13 }}>
                #{j.numeroCamiseta} {j.nombre} {j.apellido}
              </Tag>
            ))}
          </div>
        </>
      )}

      {/* Suplentes */}
      {suplentes.length > 0 && (
        <>
          <div style={{ marginBottom: 8, fontWeight: 600, color: '#6b7280', fontSize: 13 }}>
            Suplentes ({suplentes.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {suplentes.map((j) => (
              <Tag key={j._id}
                style={{ padding: isMobile ? '3px 8px' : '4px 10px', fontSize: isMobile ? 11 : 13 }}>
                #{j.numeroCamiseta} {j.nombre} {j.apellido}
              </Tag>
            ))}
          </div>
        </>
      )}

      <Alert
        type="success" showIcon style={{ marginTop: 16 }}
        message="Al confirmar se creará el partido y comenzará el Set 1 automáticamente"
      />
    </Card>
  );

  return (
    <div style={{
      maxWidth: 780, margin: '0 auto',
      display: 'flex', flexDirection: 'column',
      gap: isMobile ? 14 : 24,
    }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Button
          icon={<ArrowLeftOutlined />} type="text"
          onClick={() => navigate('/partidos')}
        />
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 700, color: '#1f2937' }}>
            Nuevo Partido
          </h1>
          {!isMobile && (
            <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>Atlético Coventry</p>
          )}
        </div>
      </div>

      {/* Steps — en móvil sin títulos largos */}
      <Steps
        current={step}
        items={isMobile
          ? STEPS.map((s) => ({ icon: s.icon, title: s.title }))
          : STEPS
        }
        size="small"
        labelPlacement={isMobile ? 'vertical' : 'horizontal'}
      />

      {/* Contenido del paso */}
      {step === 0 && paso0}
      {step === 1 && paso1}
      {step === 2 && paso2}

      {/* Botones de navegación */}
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={step === 0 ? () => navigate('/partidos') : pasoAnterior}
          disabled={creando}
          size={isMobile ? 'middle' : 'middle'}
        >
          {step === 0 ? 'Cancelar' : 'Anterior'}
        </Button>

        {step < 2 ? (
          <Button
            type="primary"
            icon={<ArrowRightOutlined />}
            iconPosition="end"
            onClick={siguientePaso}
          >
            Siguiente
          </Button>
        ) : (
          <Button
            type="primary"
            size={isMobile ? 'middle' : 'large'}
            icon={<PlayCircleOutlined />}
            onClick={crearEIniciar}
            loading={creando}
            style={{ background: '#16a34a', borderColor: '#16a34a' }}
          >
            {isMobile ? '¡Iniciar!' : '¡Iniciar Partido!'}
          </Button>
        )}
      </div>
    </div>
  );
}
