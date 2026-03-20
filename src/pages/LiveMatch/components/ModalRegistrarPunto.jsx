// ── ModalRegistrarPunto.jsx ────────────────────────────────────
import React, { useEffect } from 'react';
import {
  Modal, Form, Select, Avatar, Tag,
  Input, Divider, Row, Col, Checkbox, Tooltip, Grid,
} from 'antd';
import { UserOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { useBreakpoint } = Grid;

const TIPOS_FINALIZACION = [
  { value: 'ataque',      label: '⚡ Ataque'          },
  { value: 'ace',         label: '🚀 Ace (saque)'     },
  { value: 'bloqueo',     label: '🛡 Bloqueo'         },
  { value: 'error_rival', label: '✅ Error del rival'  },
  { value: 'error_local', label: '❌ Error propio'     },
  { value: 'otro',        label: '• Otro'              },
];

const TIPOS_ATAQUE = [
  { value: 'primer_tiempo',  label: '⚡ 1er tiempo' },
  { value: 'segundo_tiempo', label: '📐 2do tiempo' },
  { value: 'pipe',           label: '🔁 Pipe'       },
  { value: 'finta',          label: '🤏 Finta'      },
  { value: 'otro',           label: '• Otro'         },
];

const POSICION_COLOR = {
  Armador: 'blue', Opuesto: 'purple', Punta: 'green',
  Central: 'orange', Líbero: 'cyan', Auxiliar: 'default',
};

const ZONAS = [
  { zona: 4, label: 'Z4', desc: 'Punta izq. frente'  },
  { zona: 3, label: 'Z3', desc: 'Centro frente'       },
  { zona: 2, label: 'Z2', desc: 'Punta der. frente'   },
  { zona: 5, label: 'Z5', desc: 'Punta izq. fondo'    },
  { zona: 6, label: 'Z6', desc: 'Centro fondo'        },
  { zona: 1, label: 'Z1', desc: 'Punta der. fondo'    },
];

function SelectorZona({ value, onChange, isMobile }) {
  return (
    <div>
      <div style={{
        textAlign: 'center', fontSize: 10, color: '#9ca3af',
        marginBottom: 5, letterSpacing: 2, fontWeight: 600,
      }}>
        ── RED ──
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: isMobile ? 5 : 6,
        maxWidth: isMobile ? '100%' : 260,
        margin: '0 auto',
      }}>
        {ZONAS.map(({ zona, label, desc }) => {
          const seleccionada = value === zona;
          return (
            <Tooltip key={zona} title={desc}>
              <button
                type="button"
                onClick={() => onChange(seleccionada ? null : zona)}
                style={{
                  height: isMobile ? 48 : 56,
                  borderRadius: 8,
                  border: `2px solid ${seleccionada ? '#ff4fb4' : '#e5e7eb'}`,
                  background: seleccionada ? '#ff4fb4' : '#f9fafb',
                  color: seleccionada ? '#fff' : '#6b7280',
                  fontWeight: 700,
                  fontSize: isMobile ? 13 : 15,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  width: '100%',
                }}
              >
                <span>{label}</span>
                {/* Desc solo en desktop — muy pequeño en móvil */}
                {!isMobile && (
                  <span style={{ fontSize: 9, fontWeight: 400, opacity: 0.7, lineHeight: 1.2 }}>
                    {desc}
                  </span>
                )}
              </button>
            </Tooltip>
          );
        })}
      </div>
      <div style={{
        textAlign: 'center', fontSize: 10, color: '#9ca3af',
        marginTop: 5, letterSpacing: 2, fontWeight: 600,
      }}>
        ── FONDO ──
      </div>
    </div>
  );
}

function ZonaInput({ value, onChange, isMobile }) {
  return <SelectorZona value={value} onChange={onChange} isMobile={isMobile} />;
}

export default function ModalRegistrarPunto({
  open, equipoGanador, partido,
  onConfirm, onCancel, confirmLoading, isMobile,
}) {
  const [form] = Form.useForm();
  const screens = useBreakpoint();
  const mobile  = isMobile ?? !screens.md;

  const esLocal     = equipoGanador === 'local';
  const nominaLocal = partido?.nomina || [];

  const tipoFinalizacion = Form.useWatch('tipoFinalizacion', form);
  const esAtaqueOBloqueo = ['ataque', 'bloqueo'].includes(tipoFinalizacion);

  const opcionesJugadores = nominaLocal.map((n) => ({
    value: n.jugador._id,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Avatar size={20} icon={<UserOutlined />}
          style={{ background: '#000101', fontSize: 10, flexShrink: 0 }}>
          {n.jugador.numeroCamiseta}
        </Avatar>
        <span style={{ fontSize: mobile ? 12 : 13 }}>
          #{n.jugador.numeroCamiseta} {n.jugador.nombre} {n.jugador.apellido}
        </span>
        {!mobile && (
          <Tag color={POSICION_COLOR[n.jugador.posicion]} style={{ margin: 0, fontSize: 10 }}>
            {n.jugador.posicion}
          </Tag>
        )}
      </div>
    ),
  }));

  useEffect(() => {
    if (open) form.resetFields();
  }, [open]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onConfirm(values);
    } catch (_) {}
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={confirmLoading}
      okText="Registrar"
      cancelText="Cancelar"
      // En móvil ocupa casi toda la pantalla desde arriba
      width={mobile ? '100%' : 560}
      style={mobile ? { top: 10, margin: 0, padding: 0, maxWidth: '100vw' } : {}}
      styles={{
        body: {
          maxHeight: mobile ? '80vh' : '75vh',
          overflowY: 'auto',
          padding: mobile ? '8px 12px' : '12px 16px',
        },
      }}
      destroyOnClose
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%',
            background: esLocal ? '#ff4fb4' : '#ef4444', flexShrink: 0,
          }} />
          <span style={{ fontSize: mobile ? 14 : 16 }}>
            Punto para{' '}
            <strong style={{ color: esLocal ? '#ff4fb4' : '#991b1b' }}>
              {esLocal ? (mobile ? 'Coventry' : 'Atlético Coventry') : partido?.rival}
            </strong>
          </span>
        </div>
      }
    >
      <Form form={form} layout="vertical" style={{ marginTop: 12 }}>

        {/* 1. Tipo de finalización */}
        <Form.Item
          name="tipoFinalizacion"
          label="¿Cómo se ganó el punto?"
          rules={[{ required: true, message: 'Selecciona cómo se ganó el punto' }]}
        >
          <Select
            size={mobile ? 'middle' : 'large'}
            placeholder="Seleccionar..."
            options={TIPOS_FINALIZACION}
          />
        </Form.Item>

        {/* 2. Jugador que anotó */}
        {esLocal && (
          <Form.Item name="jugadorPunto" label="Jugador que anotó">
            <Select
              size={mobile ? 'middle' : 'large'}
              placeholder="Opcional"
              allowClear options={opcionesJugadores}
              optionLabelProp="label" showSearch={false}
            />
          </Form.Item>
        )}

        {/* 3. Jugador que erró */}
        <Form.Item
          name="jugadorError"
          label={esLocal ? 'Jugador que erró (si aplica)' : 'Jugador de Coventry que erró'}
        >
          <Select
            size={mobile ? 'middle' : 'large'}
            placeholder="Solo si fue por error"
            allowClear options={opcionesJugadores}
            optionLabelProp="label" showSearch={false}
          />
        </Form.Item>

        {/* 4. Zona y tipo de ataque */}
        {esAtaqueOBloqueo && (
          <>
            <Divider style={{ margin: '6px 0 12px' }}>
              <span style={{ fontSize: 11, color: '#6b7280' }}>Datos del ataque</span>
            </Divider>

            <Form.Item
              name="zonaAtaque"
              label={
                <span>
                  Zona del ataque{' '}
                  <Tooltip title="Zona desde donde vino el ataque">
                    <InfoCircleOutlined style={{ color: '#ff4fb4' }} />
                  </Tooltip>
                </span>
              }
            >
              {/* Pasamos isMobile al ZonaInput mediante render prop trick */}
              <Form.Item name="zonaAtaque" noStyle>
                {({ value, onChange }) => (
                  <ZonaInput value={value} onChange={onChange} isMobile={mobile} />
                )}
              </Form.Item>
            </Form.Item>

            <Form.Item name="tipoAtaque" label="Tipo de ataque" style={{ marginTop: 6 }}>
              <Select
                placeholder="Seleccionar tipo..."
                allowClear
                // En móvil labels cortos
                options={mobile
                  ? TIPOS_ATAQUE.map((t) => ({ ...t, label: t.label.split('(')[0].trim() }))
                  : TIPOS_ATAQUE
                }
              />
            </Form.Item>
          </>
        )}

        {/* 5. Contexto del rally */}
        <Divider style={{ margin: '6px 0 10px' }}>
          <span style={{ fontSize: 11, color: '#6b7280' }}>Contexto</span>
        </Divider>

        <Row gutter={[8, 0]}>
          <Col span={12}>
            <Form.Item name="pelotaLibre" valuePropName="checked" initialValue={false}>
              <Checkbox>
                <span style={{ fontWeight: 500, fontSize: mobile ? 12 : 14 }}>
                  🏐 Pelota libre
                </span>
                {!mobile && (
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
                    El rival mandó pelota fácil
                  </div>
                )}
              </Checkbox>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="doblePositiva" valuePropName="checked" initialValue={false}>
              <Checkbox>
                <span style={{ fontWeight: 500, fontSize: mobile ? 12 : 14 }}>
                  ⭐ Doble positiva
                </span>
                {!mobile && (
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
                    Recepción perfecta → punto
                  </div>
                )}
              </Checkbox>
            </Form.Item>
          </Col>
        </Row>

        {/* 6. Rotación + Notas */}
        <Divider style={{ margin: '4px 0 10px' }} />
        <Row gutter={[8, 0]}>
          <Col span={12}>
            <Form.Item name="rotacionLocal" label="Rotación">
              <Select
                placeholder="1 – 6" allowClear
                options={[1,2,3,4,5,6].map((n) => ({
                  value: n,
                  label: mobile ? `Rot. ${n}` : `Rotación ${n}`,
                }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="notas" label="Notas">
              <Input placeholder="Observación..." />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
