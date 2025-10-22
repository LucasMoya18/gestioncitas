"use client"

import React, { createContext, useState, useContext, useEffect, useMemo } from 'react'
import Cookies from 'js-cookie'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  //  Función para obtener datos del usuario
  const getUserData = () => {
    if (!user) return null
    
    // Caso 1: Usuario tiene propiedad 'usuario' (paciente)
    if (user.usuario) {
      return {
        id: user.usuario.id,
        nombre: user.usuario.nombre,
        correo: user.usuario.correo,
        rut: user.usuario.rut,
        telefono: user.usuario.telefono,
        rol: user.usuario.rol,
        pacienteId: user.id
      }
    }
    
    // Caso 2: Usuario tiene id y rol directamente
    if (user.id && user.rol) {
      return {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rut: user.rut,
        telefono: user.telefono,
        rol: user.rol
      }
    }
    
    // Caso 3: Usuario tiene propiedad 'user'
    if (user.user) {
      return {
        id: user.user.id,
        nombre: user.user.nombre,
        correo: user.user.correo,
        rut: user.user.rut,
        telefono: user.user.telefono,
        rol: user.user.rol,
        pacienteId: user.user.paciente_id,
        medicoId: user.user.medico_id,
        adminId: user.user.admin_id
      }
    }
    
    return null
  }

  //  Calcular userData, isAdmin, isMedico, isPaciente usando useMemo
  const { userData, isAdmin, isMedico, isPaciente } = useMemo(() => {
    const data = getUserData()
    return {
      userData: data,
      isAdmin: data?.rol === 'Administrador' || data?.rol === 'Admin',
      isMedico: data?.rol === 'Medico',
      isPaciente: data?.rol === 'Paciente'
    }
  }, [user])

  useEffect(() => {
    const init = () => {
      const cookieUser = Cookies.get('user')
      const cookieToken = Cookies.get('token')
      const lsUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null
      const lsToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null

      const rawUser = cookieUser || lsUser
      const rawToken = cookieToken || lsToken

      // Verificar que existe token válido
      if (rawToken) {
        console.log(' Token encontrado en init:', rawToken.substring(0, 20) + '...')
      } else {
        console.warn('⚠️ No se encontró token en init')
      }

      // Restaurar user si existe
      if (rawUser) {
        try {
          const parsed = JSON.parse(rawUser)
          setUser(parsed)
        } catch (e) {
          console.error(' Error parseando usuario:', e)
          Cookies.remove('user')
          Cookies.remove('token')
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user')
            localStorage.removeItem('token')
          }
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const login = (userData, token) => {
    let finalUserData = userData
    if (userData?.usuario) finalUserData = userData.usuario
    else if (userData?.user) finalUserData = userData.user

    if (!finalUserData || !finalUserData.id || !finalUserData.rol) {
      throw new Error("Datos de usuario inválidos")
    }

    // Verificar que se recibió token
    if (!token) {
      console.error(' No se recibió token en login')
      throw new Error("Token de autenticación no recibido")
    }

    setUser(finalUserData)

    const cookieOptions = { expires: 7, secure: false, sameSite: 'lax', path: '/' }
    Cookies.set('user', JSON.stringify(finalUserData), cookieOptions)
    Cookies.set('token', token, cookieOptions)

    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(finalUserData))
      localStorage.setItem('token', token)
    }

    console.log(' Login exitoso. Token guardado:', token.substring(0, 20) + '...')
  }

  const logout = () => {
    setUser(null)
    Cookies.remove('user')
    Cookies.remove('token')
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    }
    console.log(' Sesión cerrada')
  }

  //  Exportar getUserData en el contexto
  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      getUserData,      //  Exportar función
      userData,         //  Exportar datos calculados
      isAdmin,
      isMedico,
      isPaciente
    }}>
      {children}
    </AuthContext.Provider>
  )
}
