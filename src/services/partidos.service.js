import api from './api';

export const partidosService = {
  listar:          (params)   => api.get('/partidos', { params }),
  obtener:         (id)       => api.get(`/partidos/${id}`),
  crear:           (data)     => api.post('/partidos', data),
  editar:          (id, data) => api.put(`/partidos/${id}`, data),
  iniciar:         (id)       => api.post(`/partidos/${id}/iniciar`),
  siguienteSet:    (id, data) => api.post(`/partidos/${id}/siguiente-set`, data),
  ralliesPartido:  (id)       => api.get(`/partidos/${id}/rallies`),  // ← nuevo
};
