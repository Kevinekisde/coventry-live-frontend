import React, { useEffect } from 'react';
import {
  Modal, Form, Select, Avatar, Tag,
  Input, Divider, Row, Col, Checkbox, Tooltip,
} from 'antd';
import { UserOutlined, InfoCircleOutlined } from '@ant-design/icons';

const TIPOS_FINALIZACION = [
  { value: 'ataque',      label: '⚡ Ataque'            },
  { value: 'ace',         label: '🚀 Ace (saque)'       },
  { value: 'bloqueo',     label: '🛡 Bloqueo'           },
  { value: 'error_rival', label: '✅ Error del rival'    },
  { value: 'error_local', label: '❌ Error propio'       },
  { value: 'otro',        label: '• Otro'                },
];

const TIPOS_ATAQUE = [
  { value: 'primer_tiempo',  label: '⚡ 1er tiempo (bola rápida al central)' },
  { value: 'segundo_tiempo', label: '📐 2do tiempo (punta / opuesto)'        },
  { value: 'pipe',           label: '🔁 Pipe (ataque desde el fondo)'        },
  { value: 'finta',          label: '🤏 Finta / toque'                       },
  { value: 'otro',           label: '• Otro'                                 },
];

const POSICION_COLOR = {
  Armador: 'blue', Opuesto: 'purple', Punta: 'green',
  Central: 'orange', Líbero: 'cyan', Auxiliar: 'default',
};

// Zonas: fila 0 = frente (red), fila 1 = fondo
const ZONAS = [
  { zona: 4, label: 'Z4', desc: 'Punta izq. frente'  },
  { zona: 3, label: 'Z3', desc: 'Centro frente'       },
  { zona: 2, label: 'Z2', desc: 'Punta der. frente'   },
  { zona: 5, label: 'Z5', desc: 'Punta izq. fondo'    },
  { zona: 6, label: 'Z6', desc: 'Centro fondo'        },
  { zona: 1, label: 'Z1', desc: 'Punta der. fondo'    },
];

function SelectorZona({ value, onChange }) {
  return (
    <div>
      <div style={{
        textAlign: 'center', fontSize: 11, color: '#9ca3af',
        marginBottom: 6, letterSpacing: 2, fontWeight: 600,
      }}>
        ── RED ──
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 6,
        maxWidth: 260,
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
                  height: 56,
                  borderRadius: 8,
                  border: `2px solid ${seleccionada ? '#ff4fb4' : '#e5e7eb'}`,
                  background: seleccionada ? '#ff4fb4' : '#f9fafb',
                  color: seleccionada ? '#fff' : '#6b7280',
                  fontWeight: 700,
                  fontSize: 15,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  width: '100%',
                }}
              >
                <span>{label}</span>
                <span style={{ fontSize: 9, fontWeight: 400, opacity: 0.7, lineHeight: 1.2 }}>
                  {desc}
                </span>
              </button>
            </Tooltip>
          );
        })}
      </div>
      <div style={{
        textAlign: 'center', fontSize: 11, color: '#9ca3af',
        marginTop: 6, letterSpacing: 2, fontWeight: 600,
      }}>
        ── FONDO ──
      </div>
    </div>
  );
}

// ← Este wrapper es la clave: Form.Item le pasa value y onChange automáticamente
function ZonaInput({ value, onChange }) {
  return <SelectorZona value={value} onChange={onChange} />;
}

export default function ModalRegistrarPunto({
  open, equipoGanador, partido,
  onConfirm, onCancel, confirmLoading,
}) {
  const [form] = Form.useForm();

  const esLocal     = equipoGanador === 'local';
  const nominaLocal = partido?.nomina || [];

  const tipoFinalizacion = Form.useWatch('tipoFinalizacion', form);
  const esAtaqueOBloqueo = ['ataque', 'bloqueo'].includes(tipoFinalizacion);

  const opcionesJugadores = nominaLocal.map((n) => ({
    value: n.jugador._id,
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar size={22} icon={<UserOutlined />}
          style={{ background: '#1a3a5c', fontSize: 10, flexShrink: 0 }}>
          {n.jugador.numeroCamiseta}
        </Avatar>
        <span style={{ fontSize: 13 }}>
          #{n.jugador.numeroCamiseta} {n.jugador.nombre} {n.jugador.apellido}
        </span>
        <Tag color={POSICION_COLOR[n.jugador.posicion]}
          style={{ margin: 0, fontSize: 10 }}>
          {n.jugador.posicion}
        </Tag>
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
      okText="Registrar punto"
      cancelText="Cancelar"
      width={560}
      destroyOnClose
      styles={{ body: { maxHeight: '75vh', overflowY: 'auto', paddingRight: 4 } }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 12, height: 12, borderRadius: '50%',
            background: esLocal ? '#ff4fb4' : '#ef4444',
          }} />
          <span>
            Punto para{' '}
            <strong style={{ color: esLocal ? '#ff4fb4' : '#991b1b' }}>
              {esLocal ? 'Atlético Coventry' : partido?.rival}
            </strong>
          </span>
        </div>
      }
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>

        {/* 1. Tipo de finalización */}
        <Form.Item
          name="tipoFinalizacion"
          label="¿Cómo se ganó el punto?"
          rules={[{ required: true, message: 'Selecciona cómo se ganó el punto' }]}
        >
          <Select size="large" placeholder="Seleccionar..." options={TIPOS_FINALIZACION} />
        </Form.Item>

        {/* 2. Jugador que anotó */}
        {esLocal && (
          <Form.Item name="jugadorPunto" label="Jugador que anotó">
            <Select
              size="large" placeholder="Seleccionar jugador (opcional)"
              allowClear options={opcionesJugadores}
              optionLabelProp="label" showSearch={false}
            />
          </Form.Item>
        )}

        {/* 3. Jugador que erró */}
        <Form.Item
          name="jugadorError"
          label={esLocal
            ? 'Jugador que cometió error (si aplica)'
            : 'Jugador de Coventry que cometió el error'
          }
        >
          <Select
            size="large" placeholder="Solo si el punto fue por error"
            allowClear options={opcionesJugadores}
            optionLabelProp="label" showSearch={false}
          />
        </Form.Item>

        {/* 4. Zona y tipo de ataque */}
        {esAtaqueOBloqueo && (
          <>
            <Divider style={{ margin: '8px 0 16px' }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Datos del ataque</span>
            </Divider>

            <Form.Item
              name="zonaAtaque"
              label={
                <span>
                  Zona del ataque{' '}
                  <Tooltip title="Selecciona la zona de la cancha desde donde vino el ataque">
                    <InfoCircleOutlined style={{ color: '#ff4fb4' }} />
                  </Tooltip>
                </span>
              }
            >
              {/* ZonaInput recibe value y onChange inyectados por Form.Item */}
              <ZonaInput />
            </Form.Item>

            <Form.Item
              name="tipoAtaque"
              label="Tipo de ataque"
              style={{ marginTop: 8 }}
            >
              <Select placeholder="Seleccionar tipo..." allowClear options={TIPOS_ATAQUE} />
            </Form.Item>
          </>
        )}

        {/* 5. Contexto del rally */}
        <Divider style={{ margin: '8px 0 12px' }}>
          <span style={{ fontSize: 12, color: '#6b7280' }}>Contexto del rally</span>
        </Divider>

        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="pelotaLibre" valuePropName="checked" initialValue={false}>
              <Checkbox>
                <span style={{ fontWeight: 500 }}>🏐 Pelota libre</span>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                  El rival mandó pelota fácil
                </div>
              </Checkbox>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="doblePositiva" valuePropName="checked" initialValue={false}>
              <Checkbox>
                <span style={{ fontWeight: 500 }}>⭐ Doble positiva</span>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                  Recepción perfecta → ataque punto
                </div>
              </Checkbox>
            </Form.Item>
          </Col>
        </Row>

        {/* 6. Rotación + Notas */}
        <Divider style={{ margin: '8px 0 12px' }} />
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name="rotacionLocal" label="Rotación Coventry">
              <Select
                placeholder="1 – 6" allowClear
                options={[1,2,3,4,5,6].map((n) => ({ value: n, label: `Rotación ${n}` }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="notas" label="Notas">
              <Input placeholder="Observación corta..." />
            </Form.Item>
          </Col>
        </Row>

      </Form>
    </Modal>
  );
}
