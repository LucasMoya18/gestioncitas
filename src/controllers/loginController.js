import axios from "axios";
const API = axios.create({ baseURL: "http://10.60.49.17:8000/api", headers: { "Content-Type": "application/json" } });

export async function loginUsuario(rut, password) {
  // intenta login paciente (/login/) y si no existe prueba /login-medico-admin/
  try {
    const resp = await API.post("/login/", { rut, password });
    // /login/ devuelve { mensaje, user, token, refresh_token }
    if (resp.data?.user) {
      return { user: resp.data.user, token: resp.data.token || resp.data.access || null };
    }
    return { user: resp.data, token: resp.data.token || null };
  } catch (err) {
    // si fue 404/401, intenta endpoint medico/admin
    if (err.response?.status === 404 || err.response?.status === 401) {
      try {
        const resp2 = await API.post("/login-medico-admin/", { rut, password });
        if (resp2.data?.user) {
          return { user: resp2.data.user, token: resp2.data.token || null };
        }
        return { user: resp2.data, token: resp2.data.token || null };
      } catch (err2) {
        const message = err2.response?.data?.error || err2.response?.data || err2.message || "Error al iniciar sesión";
        throw message;
      }
    }
    const message = err.response?.data?.error || err.response?.data || err.message || "Error al iniciar sesión";
    throw message;
  }
}