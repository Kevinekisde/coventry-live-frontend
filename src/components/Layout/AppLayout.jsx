import React, { useState } from 'react';
import { Layout, Menu, Typography } from 'antd';
import {
  PlusCircleOutlined, HistoryOutlined, TeamOutlined,
  BarChartOutlined, MenuFoldOutlined, MenuUnfoldOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Sider, Content, Header } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: '/partidos/nuevo', icon: <PlusCircleOutlined />, label: 'Nuevo Partido' },
  { key: '/partidos',       icon: <HistoryOutlined />,    label: 'Partidos'      },
  { key: '/jugadores',      icon: <TeamOutlined />,       label: 'Jugadores'     },
  { key: '/estadisticas',   icon: <BarChartOutlined />,   label: 'Estadísticas'  },
];

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey =
    menuItems
      .map((i) => i.key)
      .filter((k) => location.pathname.startsWith(k))
      .sort((a, b) => b.length - a.length)[0] || '/partidos';

  return (
    <Layout className="min-h-screen">
      {/* ── Sidebar ── */}
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={220}
        style={{ background: 'black' }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: collapsed ? '20px 16px' : '20px 16px',
            borderBottom: '1px solid #1e4976',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#ff4fb4', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <TrophyOutlined style={{ color: '#ffff', fontSize: 16 }} />
          </div>
          {!collapsed && (
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>Atlético</div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>Coventry</div>
            </div>
          )}
        </div>

        {/* Menú */}
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => navigate(key)}
          items={menuItems}
          style={{ background: 'transparent', border: 'none', marginTop: 8 }}
        />
      </Sider>

      {/* ── Área principal ── */}
      <Layout>
        <Header style={{
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          height: 56,
          lineHeight: '56px',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'none', border: 'none',
              cursor: 'pointer', fontSize: 18, color: '#6b7280',
            }}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
          <Text style={{ color: '#9ca3af', fontSize: 13 }}>
            {new Date().toLocaleDateString('es-CL', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </Text>
        </Header>

        <Content style={{ padding: 24, minHeight: 'calc(100vh - 56px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
