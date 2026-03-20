import api from './api';

export const statsService = {
  partido:   (id) => api.get(`/stats/partido/${id}`),
  jugador:   (id) => api.get(`/stats/jugador/${id}`),
  temporada: ()   => api.get('/stats/temporada'),
};
