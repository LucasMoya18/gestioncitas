"use client"

import { createContext, useContext, useState, useEffect } from "react"
import Cookies from "js-cookie"

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Función helper para obtener datos del usuario
  const getUserData = () => {
    if (!user) return null;
    
    // Si es estructura anidada (usuario.nombre)
    if (user.usuario && typeof user.usuario === 'object') {
      return {
        nombre: user.usuario.nombre || 'Usuario',
        correo: user.usuario.correo || '',
        rut: user.usuario.rut || '',
        telefono: user.usuario.telefono || '',
        rol: user.usuario.rol || user.rol || 'Usuario'
      };
    }

    // Si es estructura plana (nombre directamente en user)
    return {
      nombre: user.nombre || 'Usuario',
      correo: user.correo || '',
      rut: user.rut || '',
      telefono: user.telefono || '',
      rol: user.rol || 'Usuario'
    };
  };

  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = Cookies.get("user")
        const token = Cookies.get("token")

        if (savedUser && savedUser !== "undefined") {
          const parsedUser = JSON.parse(savedUser)
          setUser(parsedUser)
        }
      } catch (error) {
        console.error("Error parsing user data:", error)
        Cookies.remove("user")
        Cookies.remove("token")
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = (userData, token) => {
    try {
      setUser(userData)
      Cookies.set("user", JSON.stringify(userData), { expires: 7 })
      if (token) Cookies.set("token", token, { expires: 7 })
    } catch (error) {
      console.error("Error saving auth data:", error)
    }
  }

  const logout = () => {
    setUser(null)
    Cookies.remove("user")
    Cookies.remove("token")
  }

  // Role helpers usando getUserData
  const userData = getUserData()
  const role = userData?.rol || null
  const isAdmin = role === "Administrador" || role === "Admin"
  const isMedico = role === "Medico"
  const isPaciente = role === "Paciente"

  const value = {
    user,
    login,
    logout,
    loading,
    getUserData,  // Exponemos la función
    role,
    isAdmin,
    isMedico,
    isPaciente
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
