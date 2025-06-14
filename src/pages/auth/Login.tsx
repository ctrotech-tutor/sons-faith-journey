import React from 'react'
import { useAuth } from '@/lib/hooks/useAuth';
import { assets } from '@/assets/assets';
import { Mail, Lock } from 'lucide-react';
const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  return (
    <div>
      Login
    </div>
  )
}

export default Login
