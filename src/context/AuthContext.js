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

  const getUserData = () => {
    if (!user) return null
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

  useEffect(() => {
    const init = () => {
      const cookieUser = Cookies.get('user')
      const cookieToken = Cookies.get('token')
      const lsUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null
      const lsToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null

      const rawUser = cookieUser || lsUser
      const rawToken = cookieToken || lsToken

      // Restaurar user aunque no exista token
      if (rawUser) {
        try {
          const parsed = JSON.parse(rawUser)
          setUser(parsed)
        } catch (e) {
          Cookies.remove('user'); Cookies.remove('token')
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user'); localStorage.removeItem('token')
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

    setUser(finalUserData)

    const cookieOptions = { expires: 7, secure: false, sameSite: 'lax', path: '/' }
    Cookies.set('user', JSON.stringify(finalUserData), cookieOptions)
    if (token) Cookies.set('token', token, cookieOptions)

    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(finalUserData))
      if (token) localStorage.setItem('token', token)
    }
  }

  const logout = () => {
    setUser(null)
    Cookies.remove('user'); Cookies.remove('token')
    localStorage.removeItem('user'); localStorage.removeItem('token')
  }

  const { userData, isAdmin, isMedico, isPaciente } = useMemo(() => {
    const data = getUserData()
    return {
      userData: data,
      isAdmin: data?.rol === 'Administrador' || data?.rol === 'Admin',
      isMedico: data?.rol === 'Medico',
      isPaciente: data?.rol === 'Paciente'
    }
  }, [user])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      getUserData,
      isAdmin,
      isMedico,
      isPaciente
    }}>
      {children}
    </AuthContext.Provider>
  )
}
