import React from 'react';
import { Button, Tag, Tooltip, Badge } from 'antd';
import { UndoOutlined, StopOutlined, MinusCircleOutlined } from '@ant-design/icons';

const PINK  = '#ff4fb4';
const BLACK = '#000101';

export default function Marcador({
  partido, setActivo,
  onPuntoLocal, onPuntoRival,
  onDeshacerPunto, onCerrarSet, onFinalizarPartido,
  puedeDeshacer, isMobile,
}) {
  const { puntosLocal, puntosRival, numero } = setActivo;
  const setsLocal = partido.setsGanados;
  const setsRival = partido.setsPerdidos;

  return (
    <div style={{
      background: `linear-gradient(135deg, #0d0d0d 0%, ${BLACK} 100%)`,
      borderRadius: isMobile ? 12 : 16,
      padding: isMobile ? '16px 16px 20px' : '24px 32px',
      color: '#fff',
      border: `1px solid rgba(255, 79, 180, 0.15)`,
      width: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden',
    }}>

      {/* ── Fila superior ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isMobile ? 14 : 20,
        flexWrap: 'wrap',
        gap: 6,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Badge status="processing" color={PINK} />
          <span style={{ color: PINK, fontWeight: 600, fontSize: 12, letterSpacing: 1 }}>
            SET {numero} EN JUEGO
          </span>
        </div>
        {!isMobile && (
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
        )}
      </div>

      {/* ── Marcador principal ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: isMobile ? 8 : 16,
        marginBottom: isMobile ? 20 : 28,
      }}>

        {/* Coventry */}
        <div style={{ textAlign: 'center', minWidth: 0 }}>
          <div style={{
            color: PINK,
            fontSize: isMobile ? 9 : 11,
            fontWeight: 700,
            marginBottom: 4,
            letterSpacing: isMobile ? 1 : 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {isMobile ? 'COVENTRY' : 'ATLÉTICO COVENTRY'}
          </div>
          <div style={{
            fontSize: isMobile ? 72 : 88,
            fontWeight: 900,
            lineHeight: 1,
            color: PINK,
            textShadow: `0 0 40px ${PINK}55`,
          }}>
            {puntosLocal}
          </div>
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 4 }}>
            {Array.from({ length: partido.mejorDe }).map((_, i) => (
              <div key={i} style={{
                width: isMobile ? 8 : 10,
                height: isMobile ? 8 : 10,
                borderRadius: '50%',
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
            fontSize: isMobile ? 20 : 30,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.25)',
            lineHeight: 1,
            marginBottom: 4,
          }}>
            {setsLocal} – {setsRival}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, letterSpacing: 2 }}>
            SETS
          </div>
        </div>

        {/* Rival */}
        <div style={{ textAlign: 'center', minWidth: 0 }}>
          <div style={{
            color: 'rgba(255,255,255,0.5)',
            fontSize: isMobile ? 9 : 11,
            fontWeight: 700,
            marginBottom: 4,
            letterSpacing: isMobile ? 1 : 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {partido.rival.toUpperCase()}
          </div>
          <div style={{
            fontSize: isMobile ? 72 : 88,
            fontWeight: 900,
            lineHeight: 1,
            color: '#ffffff',
            textShadow: '0 0 40px rgba(255,255,255,0.2)',
          }}>
            {puntosRival}
          </div>
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 4 }}>
            {Array.from({ length: partido.mejorDe }).map((_, i) => (
              <div key={i} style={{
                width: isMobile ? 8 : 10,
                height: isMobile ? 8 : 10,
                borderRadius: '50%',
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
        marginBottom: isMobile ? 16 : 20,
      }} />

      {/* ── Botones de punto ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: isMobile ? 8 : 12,
        marginBottom: isMobile ? 12 : 16,
      }}>
        <Button
          size="large"
          onClick={onPuntoLocal}
          style={{
            width: '100%',
            height: isMobile ? 56 : 68,
            fontSize: isMobile ? 15 : 18,
            fontWeight: 700,
            background: PINK,
            border: 'none',
            color: '#fff',
            borderRadius: 10,
            boxShadow: `0 4px 20px ${PINK}55`,
          }}
        >
          {isMobile ? '+ Coventry' : '+ Punto Coventry'}
        </Button>
        <Button
          size="large"
          onClick={onPuntoRival}
          style={{
            width: '100%',
            height: isMobile ? 56 : 68,
            fontSize: isMobile ? 15 : 18,
            fontWeight: 700,
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            borderRadius: 10,
          }}
        >
          {isMobile
            ? `+ ${partido.rival.split(' ')[0]}`
            : `+ Punto ${partido.rival}`
          }
        </Button>
      </div>

      {/* ── Acciones secundarias ── */}
      {isMobile ? (
        // Móvil: grid sin Tooltip para evitar desalineación
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 44px',
          gap: 8,
          width: '100%',
          boxSizing: 'border-box',
        }}>
          <Button
            icon={<UndoOutlined />}
            disabled={!puedeDeshacer}
            onClick={onDeshacerPunto}
            style={{
              width: '100%',
              height: 40,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: puedeDeshacer ? '#fff' : '#475569',
              fontSize: 13,
            }}
          >
            Deshacer
          </Button>

          <Button
            icon={<StopOutlined />}
            onClick={onCerrarSet}
            style={{
              width: '100%',
              height: 40,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              fontSize: 13,
            }}
          >
            Cerrar Set
          </Button>

          <Tooltip title="Finalizar Partido" placement="topRight">
            <Button
              icon={<MinusCircleOutlined />}
              onClick={onFinalizarPartido}
              style={{
                display: 'block',
                width: '100%',
                height: 40,
                background: 'transparent',
                border: '1px solid rgba(239,68,68,0.4)',
                color: '#ef4444',
                padding: 0,
              }}
            />
          </Tooltip>
        </div>
      ) : (
        // Desktop: fila con texto completo
        <div style={{
          display: 'flex',
          gap: 8,
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
        }}>
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
      )}
    </div>
  );
}
