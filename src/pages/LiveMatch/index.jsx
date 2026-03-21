import React, { useEffect, useState, useCallback } from 'react';
import {
  App, Spin, Button, Modal, Alert,
} from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { partidosService } from '../../services/partidos.service';
import { setsService } from '../../services/sets.service';
import { statsService } from '../../services/stats.service';
import Marcador from './components/Marcador';
import PanelStats from './components/PanelStats';
import ModalRegistrarPunto from './components/ModalRegistrarPunto';
import HistorialRallies from './components/HistorialRallies';
import './LiveMatch.css'; // Archivo CSS responsive

export default function LiveMatch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { message, modal } = App.useApp();

  const [partido, setPartido] = useState(null);
  const [setActivo, setSetActivo] = useState(null);
  const [rallies, setRallies] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal registro de punto
  const [modalPunto, setModalPunto] = useState(false);
  const [equipoGanador, setEquipoGanador] = useState(null); // 'local' | 'rival'
  const [guardando, setGuardando] = useState(false);

  // ── Carga inicial ────────────────────────────────────────
  const cargarPartido = useCallback(async () => {
    try {
      const res = await partidosService.obtener(id);
      setPartido(res.data);
      setSetActivo(res.data.setActivo);
    } catch (err) {
      message.error(err.message);
    }
  }, [id]);

  const cargarRallies = useCallback(async (setId) => {
    if (!setId) return;
    try {
      const res = await setsService.listarRallies(setId);
      setRallies(res.data);
    } catch (err) {
      message.error(err.message);
    }
  }, []);

  const cargarStats = useCallback(async () => {
    try {
      const res = await statsService.partido(id);
      setStats(res.data);
    } catch (err) { /* silencioso */ }
  }, [id]);

  const cargarTodo = useCallback(async () => {
    setLoading(true);
    await cargarPartido();
    setLoading(false);
  }, [cargarPartido]);

  useEffect(() => { cargarTodo(); }, [cargarTodo]);

  useEffect(() => {
    if (setActivo?._id) {
      cargarRallies(setActivo._id);
      cargarStats();
    }
  }, [setActivo?._id]);

  // ── Abrir modal punto ────────────────────────────────────
  const abrirModalPunto = (equipo) => {
    setEquipoGanador(equipo);
    setModalPunto(true);
  };

  // ── Registrar punto ──────────────────────────────────────
  const registrarPunto = async (formData) => {
    if (!setActivo?._id) return;
    try {
      setGuardando(true);
      const marcadorLocal = setActivo.puntosLocal + (equipoGanador === 'local' ? 1 : 0);
      const marcadorRival = setActivo.puntosRival + (equipoGanador === 'rival' ? 1 : 0);

      const res = await setsService.registrarRally(setActivo._id, {
        ...formData,
        equipoGanador,
        marcadorLocal,
        marcadorRival,
      });

      // Actualizar set activo con nuevo marcador
      setSetActivo(res.data.set);
      setModalPunto(false);
      await cargarRallies(setActivo._id);
      await cargarStats();
    } catch (err) {
      message.error(err.message);
    } finally {
      setGuardando(false);
    }
  };

  // ── Deshacer último punto ────────────────────────────────
  const deshacerUltimoPunto = async () => {
    if (rallies.length === 0) return;
    const ultimo = rallies[rallies.length - 1];
    try {
      const res = await setsService.deshacerRally(setActivo._id, ultimo._id);
      setSetActivo(res.data);
      await cargarRallies(setActivo._id);
      await cargarStats();
      message.success('Último punto deshecho');
    } catch (err) {
      message.error(err.message);
    }
  };

  // ── Cerrar set ───────────────────────────────────────────
  const cerrarSet = () => {
    if (!setActivo) return;
    const { puntosLocal, puntosRival } = setActivo;
    const ganador = puntosLocal > puntosRival ? 'local' : 'rival';

    modal.confirm({
      title: `¿Cerrar Set ${setActivo.numero}?`,
      content: (
        <div>
          <p>Marcador final: <strong>{puntosLocal} – {puntosRival}</strong></p>
          <p>Ganador del set: <strong>{ganador === 'local' ? 'Atlético Coventry' : partido?.rival}</strong></p>
        </div>
      ),
      okText: 'Cerrar set',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          const res = await partidosService.siguienteSet(id, { ganador });
          if (res.data.partidoFinalizado) {
            message.success('¡Partido finalizado!');
            navigate(`/partidos/${id}/resumen`);
          } else {
            setSetActivo(res.data.nuevoSet);
            setRallies([]);
            await cargarPartido();
            message.success(`Set ${setActivo.numero} cerrado. Iniciando Set ${res.data.nuevoSet.numero}`);
          }
        } catch (err) {
          message.error(err.message);
        }
      },
    });
  };

  // ── Finalizar partido manualmente ────────────────────────
  const finalizarPartido = () => {
    modal.confirm({
      title: '¿Finalizar el partido ahora?',
      content: 'El partido quedará marcado como finalizado con los sets actuales.',
      okText: 'Finalizar',
      okButtonProps: { danger: true },
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          const ganador = setActivo.puntosLocal >= setActivo.puntosRival ? 'local' : 'rival';
          await partidosService.siguienteSet(id, { ganador });
          navigate(`/partidos/${id}/resumen`);
        } catch (err) {
          message.error(err.message);
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="loading-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!partido || !setActivo) {
    return (
      <Alert 
        type="error" 
        message="No se pudo cargar el partido" 
        showIcon
        action={<Button onClick={() => navigate('/partidos')}>Volver</Button>}
        className="error-alert"
      />
    );
  }

  return (
    <div className="live-match-container">
      {/* ── Marcador principal ── */}
      <section className="score-section">
        <Marcador
          partido={partido}
          setActivo={setActivo}
          onPuntoLocal={() => abrirModalPunto('local')}
          onPuntoRival={() => abrirModalPunto('rival')}
          onDeshacerPunto={deshacerUltimoPunto}
          onCerrarSet={cerrarSet}
          onFinalizarPartido={finalizarPartido}
          puedeDeshacer={rallies.length > 0}
        />
      </section>

      {/* ── Cuerpo: stats + historial ── */}
      <div className="content-grid">
        {/* Stats en vivo */}
        <section className="stats-panel">
          <PanelStats stats={stats} partido={partido} />
        </section>

        {/* Historial del set */}
        <section className="history-panel">
          <HistorialRallies
            rallies={rallies}
            setNumero={setActivo.numero}
          />
        </section>
      </div>

      {/* ── Modal registrar punto ── */}
      <ModalRegistrarPunto
        open={modalPunto}
        equipoGanador={equipoGanador}
        partido={partido}
        onConfirm={registrarPunto}
        onCancel={() => setModalPunto(false)}
        confirmLoading={guardando}
      />
    </div>
  );
}
