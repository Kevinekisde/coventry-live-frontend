import api from './api';

export const setsService = {
  listarRallies:  (setId)          => api.get(`/sets/${setId}/rallies`),
  registrarRally: (setId, data)    => api.post(`/sets/${setId}/rallies`, data),
  deshacerRally:  (setId, rallyId) => api.delete(`/sets/${setId}/rallies/${rallyId}`),
};
