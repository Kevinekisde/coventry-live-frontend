import React from 'react';
import { Button, Tag, Tooltip, Badge } from 'antd';
import {
  UndoOutlined, StopOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';

const PINK  = '#ff4fb4';
const BLACK = '#000101';

export default function Marcador({
  partido, setActivo,
  onPuntoLocal, onPuntoRival,
  onDeshacerPunto, onCerrarSet, onFinalizarPartido,
  puedeDeshacer,
}) {
  const { puntosLocal, puntosRival, numero } = setActivo;
  const setsLocal = partido.setsGanados;
  const setsRival = partido.setsPerdidos;

  return (
    <div style={{
      background: `linear-gradient(135deg, #0d0d0d 0%, ${BLACK} 100%)`,
      borderRadius: 16,
      padding: '24px 32px',
      color: '#fff',
      border: `1px solid rgba(255, 79, 180, 0.15)`,
    }}>

      {/* ── Fila superior ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Badge status="processing" color={PINK} />
          <span style={{ color: PINK, fontWeight: 600, fontSize: 13, letterSpacing: 1 }}>
            SET {numero} EN JUEGO
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {partido.torneo && (
            <Tag style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#cbd5e1',
            }}>
              {partido.torneo}
            </Tag>
          )}
          <Tag style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#cbd5e1',
          }}>
            {partido.categoria}
          </Tag>
        </div>
      </div>

      {/* ── Marcador principal ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: 16,
        marginBottom: 28,
      }}>
        {/* Coventry */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            color: PINK, fontSize: 11, fontWeight: 700,
            marginBottom: 6, letterSpacing: 2,
          }}>
            ATLÉTICO COVENTRY
          </div>
          <div style={{
            fontSize: 88, fontWeight: 900, lineHeight: 1,
            color: PINK,
            textShadow: `0 0 40px ${PINK}55`,
          }}>
            {puntosLocal}
          </div>
          {/* Indicadores de sets */}
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 5 }}>
            {Array.from({ length: partido.mejorDe }).map((_, i) => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: '50%',
                background: i < setsLocal ? PINK : 'rgba(255,255,255,0.15)',
                boxShadow: i < setsLocal ? `0 0 8px ${PINK}` : 'none',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
        </div>

        {/* Sets */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: 30, fontWeight: 700,
            color: 'rgba(255,255,255,0.25)',
            lineHeight: 1, marginBottom: 6,
          }}>
            {setsLocal} – {setsRival}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, letterSpacing: 2 }}>
            SETS
          </div>
        </div>

        {/* Rival */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700,
            marginBottom: 6, letterSpacing: 2,
          }}>
            {partido.rival.toUpperCase()}
          </div>
          <div style={{
            fontSize: 88, fontWeight: 900, lineHeight: 1,
            color: '#ffffff',
            textShadow: '0 0 40px rgba(255,255,255,0.2)',
          }}>
            {puntosRival}
          </div>
          {/* Indicadores de sets */}
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 5 }}>
            {Array.from({ length: partido.mejorDe }).map((_, i) => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: '50%',
                background: i < setsRival ? '#ffffff' : 'rgba(255,255,255,0.15)',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Separador ── */}
      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(255,79,180,0.3), transparent)',
        marginBottom: 20,
      }} />

      {/* ── Botones de punto ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 12, marginBottom: 16,
      }}>
        <Button
          size="large"
          onClick={onPuntoLocal}
          style={{
            height: 68, fontSize: 18, fontWeight: 700,
            background: PINK,
            border: 'none',
            color: '#fff',
            borderRadius: 10,
            boxShadow: `0 4px 20px ${PINK}55`,
            letterSpacing: 0.5,
          }}
        >
          + Punto Coventry
        </Button>
        <Button
          size="large"
          onClick={onPuntoRival}
          style={{
            height: 68, fontSize: 18, fontWeight: 700,
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            borderRadius: 10,
          }}
        >
          + Punto {partido.rival}
        </Button>
      </div>

      {/* ── Acciones secundarias ── */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Tooltip title="Deshacer último punto">
          <Button
            icon={<UndoOutlined />}
            disabled={!puedeDeshacer}
            onClick={onDeshacerPunto}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: puedeDeshacer ? '#fff' : '#475569',
            }}
          >
            Deshacer
          </Button>
        </Tooltip>
        <Button
          icon={<StopOutlined />}
          onClick={onCerrarSet}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#fff',
          }}
        >
          Cerrar Set {numero}
        </Button>
        <Button
          icon={<MinusCircleOutlined />}
          onClick={onFinalizarPartido}
          style={{
            background: 'transparent',
            border: '1px solid rgba(239,68,68,0.4)',
            color: '#ef4444',
          }}
        >
          Finalizar Partido
        </Button>
      </div>
    </div>
  );
}
