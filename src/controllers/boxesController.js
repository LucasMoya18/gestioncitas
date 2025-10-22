import axios from "axios";
import Cookies from 'js-cookie';

const API_URL = "http://127.0.0.1:8000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || Cookies.get('token');
  
  if (!token) {
    console.error('❌ No se encontró token de autenticación en localStorage ni cookies');
    console.log('localStorage.token:', localStorage.getItem('token'));
    console.log('Cookies.token:', Cookies.get('token'));
    return {};
  }
  
  console.log('✅ Token encontrado:', token.substring(0, 20) + '...');
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const boxesController = {
  async list(medicoId) {
    console.log('📋 Listando boxes para médico:', medicoId);
    const headers = getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('No hay sesión activa. Por favor inicie sesión nuevamente.');
    }
    
    const res = await fetch(`${API_URL}/boxes/?medico=${medicoId}`, {
      headers,
      credentials: 'include'
    });
    
    if (res.status === 401) {
      console.error('❌ 401 Unauthorized - Token inválido o expirado');
      throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
    }
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error('❌ Error en list:', errorData);
      throw new Error(errorData.detail || 'Error obteniendo boxes');
    }
    
    const data = await res.json();
    console.log('✅ Boxes obtenidos:', data.length);
    return data;
  },
  
  async create({ medico, nombre, activo = true }) {
    const headers = getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('No hay sesión activa. Por favor inicie sesión nuevamente.');
    }
    
    const res = await fetch(`${API_URL}/boxes/`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({ medico, nombre, activo })
    });
    
    if (res.status === 401) {
      throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
    }
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error creando box');
    }
    
    return res.json();
  },
  
  async update(id, payload) {
    const headers = getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('No hay sesión activa. Por favor inicie sesión nuevamente.');
    }
    
    // Obtener el box completo
    const getRes = await fetch(`${API_URL}/boxes/${id}/`, {
      headers,
      credentials: 'include'
    });
    
    if (getRes.status === 401) {
      throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
    }
    
    if (!getRes.ok) throw new Error('Error obteniendo box');
    
    const currentBox = await getRes.json();
    
    // Combinar datos
    const updateData = {
      ...currentBox,
      ...payload
    };
    
    const res = await fetch(`${API_URL}/boxes/${id}/`, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify(updateData)
    });
    
    if (res.status === 401) {
      throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
    }
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.medico?.[0] || 'Error actualizando box');
    }
    
    return res.json();
  },
  
  async remove(id) {
    const headers = getAuthHeaders();
    
    if (!headers.Authorization) {
      throw new Error('No hay sesión activa. Por favor inicie sesión nuevamente.');
    }
    
    const res = await fetch(`${API_URL}/boxes/${id}/`, {
      method: 'DELETE',
      headers,
      credentials: 'include'
    });
    
    if (res.status === 401) {
      throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
    }
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error eliminando box');
    }
    
    return true;
  }
};