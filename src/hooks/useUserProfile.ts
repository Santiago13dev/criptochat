/**
 * Hook personalizado para manejar el estado del perfil de usuario
 */

import { useState, useEffect } from 'react'

interface UserProfile {
  avatar: string | null
  status: string
  name: string
}

const PROFILE_STORAGE_KEY = 'criptochat_user_profile'

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>({
    avatar: null,
    status: '',
    name: ''
  })

  // Cargar perfil al inicializar
  useEffect(() => {
    const savedProfile = localStorage.getItem(PROFILE_STORAGE_KEY)
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile)
        setProfile(parsedProfile)
      } catch (error) {
        console.error('Error loading profile:', error)
      }
    }
  }, [])

  // Guardar perfil
  const saveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile)
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile))
  }

  // Limpiar perfil
  const clearProfile = () => {
    const emptyProfile = { avatar: null, status: '', name: '' }
    setProfile(emptyProfile)
    localStorage.removeItem(PROFILE_STORAGE_KEY)
  }

  return {
    profile,
    saveProfile,
    clearProfile
  }
}