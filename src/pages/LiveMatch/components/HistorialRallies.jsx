// ── HistorialRallies.jsx ───────────────────────────────────────
import React from 'react';
import { Card, Tag, Empty, Timeline } from 'antd';
import { TrophyOutlined, CloseCircleOutlined } from '@ant-design/icons';

const TIPO_LABEL = {
  ataque:      '⚡ Ataque',     ace:         '🚀 Ace',
  bloqueo:     '🛡 Bloqueo',    error_rival: '✅ Error rival',
  error_local: '❌ Error local', otro:        '• Otro',
};

export default function HistorialRallies({ rallies, setNumero, isMobile }) {
  const items = [...rallies].reverse().slice(0, 20).map((r) => ({
    key: r._id,
    color: r.equipoGanador === 'local' ? '#f59e0b' : '#ef4444',
    dot: r.equipoGanador === 'local'
      ? <TrophyOutlined style={{ color: '#f59e0b' }} />
      : <CloseCircleOutlined style={{ color: '#ef4444' }} />,
    children: (
      <div style={{ paddingBottom: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontWeight: 600, fontSize: 13,
            color: r.equipoGanador === 'local' ? '#92400e' : '#991b1b',
          }}>
            {r.marcadorLocal} – {r.marcadorRival}
          </span>
          <Tag style={{ fontSize: 10, margin: 0, flexShrink: 0 }}>
            {TIPO_LABEL[r.tipoFinalizacion]}
          </Tag>
        </div>
        {r.jugadorPunto && (
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
            #{r.jugadorPunto.numeroCamiseta} {r.jugadorPunto.nombre}{' '}
            {!isMobile && r.jugadorPunto.apellido}
          </div>
        )}
        {r.jugadorError && (
          <div style={{ fontSize: 12, color: '#ef4444', marginTop: 2 }}>
            Error: #{r.jugadorError.numeroCamiseta} {r.jugadorError.nombre}
          </div>
        )}
        {r.notas && !isMobile && (
          <div style={{ fontSize: 11, color: '#9ca3af', fontStyle: 'italic', marginTop: 2 }}>
            {r.notas}
          </div>
        )}
      </div>
    ),
  }));

  return (
    <Card
      title={`Historial Set ${setNumero}`}
      size="small"
      style={{ maxHeight: isMobile ? 'none' : 600, overflowY: isMobile ? 'visible' : 'auto' }}
      bodyStyle={{ padding: isMobile ? '8px 10px' : '12px 16px' }}
      extra={<span style={{ color: '#9ca3af', fontSize: 12 }}>{rallies.length} pts</span>}
    >
      {rallies.length === 0 ? (
        <Empty description="Sin puntos registrados" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Timeline items={items} style={{ marginTop: 8 }} />
      )}
    </Card>
  );
}
