import axios from 'axios';

const api = axios.create({
  baseURL: 'https://tonyveiculos.com.br',
});

export default api;
