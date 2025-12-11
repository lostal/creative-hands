import axios from "axios";

// Configurar baseURL según el entorno
const baseURL = import.meta.env.VITE_API_URL || "/api";

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL,
  withCredentials: true,
});

export default api;
