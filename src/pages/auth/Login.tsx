import React from 'react'
import { useAuth } from '@/lib/hooks/useAuth';

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  return (
    <div>
      Login
    </div>
  )
}

export default Login
