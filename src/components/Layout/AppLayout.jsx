import React, { useState } from 'react';
import { Layout, Menu, Typography, Drawer, Grid } from 'antd';
import {
  PlusCircleOutlined, HistoryOutlined, TeamOutlined,
  BarChartOutlined, MenuOutlined, TrophyOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Sider, Content, Header } = Layout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const menuItems = [
  { key: '/partidos/nuevo', icon: <PlusCircleOutlined />, label: 'Nuevo Partido' },
  { key: '/partidos',       icon: <HistoryOutlined />,    label: 'Partidos'      },
  { key: '/jugadores',      icon: <TeamOutlined />,       label: 'Jugadores'     },
  { key: '/estadisticas',   icon: <BarChartOutlined />,   label: 'Estadísticas'  },
];

// ── Logo reutilizable ──────────────────────────────────────────
function Logo({ collapsed }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '20px 16px',
      borderBottom: '1px solid rgba(255,79,180,0.2)',
      justifyContent: collapsed ? 'center' : 'flex-start',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: '#ff4fb4', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <TrophyOutlined style={{ color: '#fff', fontSize: 16 }} />
      </div>
      {!collapsed && (
        <div style={{ lineHeight: 1.3 }}>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>Atlético</div>
          <div style={{ color: '#ff4fb4', fontWeight: 700, fontSize: 13 }}>Coventry</div>
        </div>
      )}
    </div>
  );
}

// ── Menú reutilizable ──────────────────────────────────────────
function NavMenu({ selectedKey, onNavigate }) {
  return (
    <Menu
      mode="inline"
      theme="dark"
      selectedKeys={[selectedKey]}
      onClick={({ key }) => onNavigate(key)}
      items={menuItems}
      style={{ background: 'transparent', border: 'none', marginTop: 8 }}
    />
  );
}

export default function AppLayout() {
  const [collapsed,    setCollapsed]    = useState(false);
  const [drawerOpen,   setDrawerOpen]   = useState(false);
  const navigate  = useNavigate();
  const location  = useLocation();
  const screens   = useBreakpoint();

  const isMobile = !screens.md; // < 768px

  const selectedKey =
    menuItems
      .map((i) => i.key)
      .filter((k) => location.pathname.startsWith(k))
      .sort((a, b) => b.length - a.length)[0] || '/partidos';

  const handleNavigate = (key) => {
    navigate(key);
    setDrawerOpen(false); // cerrar drawer al navegar en móvil
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>

      {/* ── DESKTOP: Sidebar fijo ── */}
      {!isMobile && (
        <Sider
          collapsible
          collapsed={collapsed}
          trigger={null}
          width={220}
          style={{ background: '#000101' }}
        >
          <Logo collapsed={collapsed} />
          <NavMenu selectedKey={selectedKey} onNavigate={handleNavigate} />
        </Sider>
      )}

      {/* ── MÓVIL: Drawer desde la izquierda ── */}
      {isMobile && (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={240}
          styles={{
            body:   { padding: 0, background: '#000101' },
            header: { display: 'none' },
          }}
        >
          <Logo collapsed={false} />
          <NavMenu selectedKey={selectedKey} onNavigate={handleNavigate} />
        </Drawer>
      )}

      {/* ── Área principal ── */}
      <Layout>

        {/* Header */}
        <Header style={{
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          height: 56,
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          {/* Botón hamburguesa — desktop colapsa sidebar, móvil abre drawer */}
          <button
            onClick={() => isMobile ? setDrawerOpen(true) : setCollapsed(!collapsed)}
            style={{
              background: 'none', border: 'none',
              cursor: 'pointer', fontSize: 18, color: '#6b7280',
              display: 'flex', alignItems: 'center', padding: 4,
            }}
          >
            <MenuOutlined />
          </button>

          {/* Logo centrado en móvil */}
          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: '#ff4fb4', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <TrophyOutlined style={{ color: '#fff', fontSize: 13 }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#1f2937' }}>
                Atlético Coventry
              </span>
            </div>
          )}

          {/* Fecha — solo desktop */}
          {!isMobile && (
            <Text style={{ color: '#9ca3af', fontSize: 13 }}>
              {new Date().toLocaleDateString('es-CL', {
                weekday: 'long', year: 'numeric',
                month: 'long', day: 'numeric',
              })}
            </Text>
          )}

          {/* Espacio derecho para balancear en móvil */}
          {isMobile && <div style={{ width: 32 }} />}
        </Header>

        {/* Contenido */}
        <Content style={{
          padding: isMobile ? '16px 12px' : 24,
          // En móvil dejamos espacio para el bottom nav
          paddingBottom: isMobile ? 80 : 24,
          minHeight: 'calc(100vh - 56px)',
          background: '#f9fafb',
        }}>
          <Outlet />
        </Content>
      </Layout>

      {/* ── MÓVIL: Bottom Navigation ── */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 0, left: 0, right: 0,
          height: 64,
          background: '#fff',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          zIndex: 200,
          // safe area para iPhones con notch
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          {menuItems.map((item) => {
            const activo = selectedKey === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleNavigate(item.key)}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  padding: '8px 4px',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{
                  fontSize: 20,
                  color: activo ? '#ff4fb4' : '#9ca3af',
                  transition: 'all 0.15s',
                  // Pill activo detrás del ícono
                  background: activo ? 'rgba(255,79,180,0.1)' : 'transparent',
                  borderRadius: 12,
                  width: 40, height: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {item.icon}
                </span>
                <span style={{
                  fontSize: 10,
                  fontWeight: activo ? 700 : 400,
                  color: activo ? '#ff4fb4' : '#9ca3af',
                  lineHeight: 1,
                }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
