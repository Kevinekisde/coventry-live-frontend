import api from './api';

export const jugadoresService = {
  listar:     (params)   => api.get('/jugadores', { params }),
  obtener:    (id)       => api.get(`/jugadores/${id}`),
  crear:      (data)     => api.post('/jugadores', data),
  editar:     (id, data) => api.put(`/jugadores/${id}`, data),
  desactivar: (id)       => api.delete(`/jugadores/${id}`),
};
