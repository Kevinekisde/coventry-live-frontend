import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import esES from 'antd/locale/es_ES';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

import AppLayout      from './components/Layout/AppLayout';
import Jugadores      from './pages/Jugadores';
import ListaPartidos  from './pages/Partidos/ListaPartidos';
import NuevoPartido   from './pages/Partidos/NuevoPartido';
import LiveMatch      from './pages/LiveMatch';
import ResumenPartido from './pages/Partidos/ResumenPartido';
import Estadisticas   from './pages/Estadisticas';

dayjs.locale('es');

export default function App() {
  return (
    <ConfigProvider
      locale={esES}
      theme={{
        token: {
          colorPrimary: '#ff4fb4',
          colorLink:    '#ff4fb4',
          borderRadius: 8,
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to="/partidos" replace />} />
              <Route path="/jugadores"            element={<Jugadores />} />
              <Route path="/partidos"             element={<ListaPartidos />} />
              <Route path="/partidos/nuevo"       element={<NuevoPartido />} />
              <Route path="/partidos/:id/live"    element={<LiveMatch />} />
              <Route path="/partidos/:id/resumen" element={<ResumenPartido />} />
              <Route path="/estadisticas"         element={<Estadisticas />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  );
}
