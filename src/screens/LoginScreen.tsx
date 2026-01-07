import React, { useState } from 'react';
import { User } from '../types/models';
import { UserRole, UserStatus } from '../types/enums';
import { UserPlus, Lock, X, AlertCircle } from 'lucide-react';
import { congregaciones } from '../data/congregaciones';
import { CongregationCombobox } from '../components/CongregationCombobox';
import { useUser } from '../contexts/UserContext';
// import { UserService, MockUserRepository } from '../services/userService'; // Ya no se necesita instanciar aquí


interface LoginScreenProps {
  onLogin: (user: User) => void;
}

type ViewState = 'split' | 'signup' | 'login';

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const { userService } = useUser();
  const [viewState, setViewState] = useState<ViewState>('split');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.Voluntario);

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    nombre: '',
    email: '',
    telefono: '',
    role: UserRole.Voluntario,
    congregacion: '' // Nueva propiedad para congregación
  });

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que TODOS los roles (incluido Ultra Admin) deben seleccionar congregación
    if ((signupForm.role === UserRole.Capitan || signupForm.role === UserRole.AdminLocal || signupForm.role === UserRole.AdminGlobal) && !signupForm.congregacion) {
      alert('Por favor seleccione su congregación');
      return;
    }

    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      nombre: signupForm.nombre,
      email: signupForm.email,
      telefono: signupForm.telefono,
      role: signupForm.role,
      status: signupForm.role === UserRole.Capitan ? UserStatus.Pendiente : UserStatus.Aprobado,
      congregacion: signupForm.congregacion || 'cong-001' // Todos tienen congregación de origen
    };

    onLogin(user);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const user = await userService.login(loginForm.email, loginForm.password);

      if (user) {
        onLogin(user);
      } else {
        alert('Usuario no encontrado o credenciales incorrectas');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Error al iniciar sesión');
    }
  };

  const resetToSplit = () => {
    setViewState('split');
    setSignupForm({ nombre: '', email: '', telefono: '', role: UserRole.Voluntario, congregacion: '' });
    setLoginForm({ email: '', password: '' });
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#F7F7F7]">
      <div className="w-full max-w-[428px] mx-auto h-full relative">

        {/* SPLIT VIEW */}
        {viewState === 'split' && (
          <>
            {/* Top Half - Crear Cuenta */}
            <button
              onClick={() => setViewState('signup')}
              className="absolute top-0 left-0 w-full h-1/2 bg-[#594396] flex flex-col items-center justify-center transition-all duration-600 ease-in-out"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 flex items-center justify-center">
                  <UserPlus
                    className="w-16 h-16 text-white"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="text-center">
                  <h2 className="text-white text-2xl font-light tracking-wide">
                    Crear Cuenta
                  </h2>
                  <p className="text-white/70 text-sm mt-2 font-light">
                    Registrarse en Sistema PPAM
                  </p>
                </div>
              </div>
            </button>

            {/* Bottom Half - Iniciar Sesión */}
            <button
              onClick={() => setViewState('login')}
              className="absolute bottom-0 left-0 w-full h-1/2 bg-white flex flex-col items-center justify-center transition-all duration-600 ease-in-out"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 flex items-center justify-center">
                  <Lock
                    className="w-16 h-16 text-[#333333]"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="text-center">
                  <h2 className="text-[#333333] text-2xl font-light tracking-wide">
                    Iniciar Sesión
                  </h2>
                  <p className="text-[#666666] text-sm mt-2 font-light">
                    Acceder a mi cuenta
                  </p>
                </div>
              </div>
            </button>

            {/* Center Badge - JW ID */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="bg-white border-2 border-[#594396] px-6 py-2 rounded-full shadow-lg">
                <span className="text-[#594396] font-semibold text-sm tracking-widest">
                  JW ID
                </span>
              </div>
            </div>
          </>
        )}

        {/* SIGNUP VIEW */}
        {viewState === 'signup' && (
          <div
            className="absolute inset-0 bg-[#594396] flex flex-col transition-all duration-600 ease-in-out"
            style={{ animation: 'fadeIn 600ms ease-in-out' }}
          >
            {/* Close Button */}
            <button
              onClick={resetToSplit}
              className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors z-10"
              style={{ touchAction: 'manipulation', minWidth: '44px', minHeight: '44px' }}
            >
              <X className="w-6 h-6" strokeWidth={2} />
            </button>

            {/* Form Container */}
            <div className="flex-1 flex flex-col px-6 pt-16 pb-8 overflow-y-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <UserPlus className="w-12 h-12 text-white mx-auto mb-4" strokeWidth={1.5} />
                <h1 className="text-white text-3xl font-light mb-2">Crear Cuenta</h1>
                <p className="text-white/80 text-sm font-light">
                  Complete el formulario para registrarse
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSignupSubmit} className="space-y-6">
                {/* Nombre Completo */}
                <div>
                  <label className="block text-white/90 text-sm font-light mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={signupForm.nombre}
                    onChange={(e) => setSignupForm({ ...signupForm, nombre: e.target.value })}
                    className="w-full bg-white/10 border-b-2 border-white/30 text-white px-4 py-3 outline-none focus:border-white transition-colors placeholder-white/50"
                    placeholder="Juan Pérez García"
                    style={{ minHeight: '44px' }}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-white/90 text-sm font-light mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                    className="w-full bg-white/10 border-b-2 border-white/30 text-white px-4 py-3 outline-none focus:border-white transition-colors placeholder-white/50"
                    placeholder="correo@ejemplo.com"
                    style={{ minHeight: '44px' }}
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-white/90 text-sm font-light mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    required
                    value={signupForm.telefono}
                    onChange={(e) => setSignupForm({ ...signupForm, telefono: e.target.value })}
                    className="w-full bg-white/10 border-b-2 border-white/30 text-white px-4 py-3 outline-none focus:border-white transition-colors placeholder-white/50"
                    placeholder="+52 555 000 0000"
                    style={{ minHeight: '44px' }}
                  />
                </div>

                {/* Rol */}
                <div>
                  <label className="block text-white/90 text-sm font-light mb-3">
                    Seleccione su rol
                  </label>
                  <div className="space-y-3">
                    {([UserRole.Voluntario, UserRole.Capitan, UserRole.AdminLocal, UserRole.AdminGlobal] as UserRole[]).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setSignupForm({ ...signupForm, role })}
                        className={`w-full px-5 py-3 rounded-lg border-2 transition-all text-left ${signupForm.role === role
                          ? 'bg-white text-[#594396] border-white'
                          : 'bg-white/10 text-white border-white/30 hover:border-white/50'
                          }`}
                        style={{ minHeight: '44px' }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="capitalize font-light">
                            {role === UserRole.AdminLocal ? 'Administrador' :
                              role === UserRole.Capitan ? 'Capitán' :
                                role === UserRole.AdminGlobal ? 'Ultra Administrador' :
                                  'Voluntario'}
                          </span>
                          {role === UserRole.AdminGlobal && (
                            <span className="text-xs bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full">
                              Acceso Total
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Congregación (TODOS los roles excepto Voluntario) */}
                {(signupForm.role === UserRole.Capitan || signupForm.role === UserRole.AdminLocal || signupForm.role === UserRole.AdminGlobal) && (
                  <CongregationCombobox
                    congregaciones={congregaciones}
                    value={signupForm.congregacion}
                    onChange={(value) => setSignupForm({ ...signupForm, congregacion: value })}
                    required
                    placeholder={signupForm.role === UserRole.AdminGlobal ? "Seleccione congregación de origen" : "Seleccione su congregación"}
                    className="animate-in fade-in slide-in-from-top-4 duration-300"
                    helperText={
                      signupForm.role === UserRole.Capitan
                        ? 'Su solicitud será enviada a los ancianos de esta congregación'
                        : signupForm.role === UserRole.AdminGlobal
                          ? 'Tendrá acceso global a todas las congregaciones, pero esta será su congregación de origen'
                          : 'Solo verá solicitudes y hermanos de esta congregación'
                    }
                  />
                )}

                {/* Aviso para Ultra Admin */}
                {signupForm.role === UserRole.AdminGlobal && (
                  <div
                    className="animate-in fade-in slide-in-from-top-4 duration-300 bg-red-500/10 border-2 border-red-500/30 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                      <div>
                        <p className="text-white/90 text-sm font-medium mb-1">
                          Ultra Administrador - Acceso Global
                        </p>
                        <p className="text-white/70 text-xs">
                          Tendrá acceso completo a TODAS las congregaciones del sistema. Podrá aprobar/rechazar cualquier solicitud y ver todos los hermanos, independientemente de su congregación de origen.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-white text-[#594396] py-4 rounded-lg font-medium hover:bg-white/90 transition-colors mt-8"
                  style={{ minHeight: '44px' }}
                >
                  Crear Cuenta
                </button>

                {/* Footer Text */}
                <p className="text-white/60 text-xs text-center italic mt-6">
                  "Hagan todas las cosas para la gloria de Dios" - 1 Cor. 10:31
                </p>
              </form>
            </div>
          </div>
        )}

        {/* LOGIN VIEW */}
        {viewState === 'login' && (
          <div
            className="absolute inset-0 bg-white flex flex-col transition-all duration-600 ease-in-out"
            style={{ animation: 'fadeIn 600ms ease-in-out' }}
          >
            {/* Close Button */}
            <button
              onClick={resetToSplit}
              className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center text-[#333333] hover:bg-[#F7F7F7] rounded-full transition-colors z-10"
              style={{ touchAction: 'manipulation', minWidth: '44px', minHeight: '44px' }}
            >
              <X className="w-6 h-6" strokeWidth={2} />
            </button>

            {/* Form Container */}
            <div className="flex-1 flex flex-col px-6 pt-16 pb-8 overflow-y-auto">
              {/* Header */}
              <div className="text-center mb-12">
                <Lock className="w-12 h-12 text-[#594396] mx-auto mb-4" strokeWidth={1.5} />
                <h1 className="text-[#333333] text-3xl font-light mb-2">Iniciar Sesión</h1>
                <p className="text-[#666666] text-sm font-light">
                  Acceda a su cuenta Sistema PPAM
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-8">
                {/* Email */}
                <div>
                  <label className="block text-[#333333] text-sm font-light mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    className="w-full bg-[#F7F7F7] border-b-2 border-[#E0E0E0] text-[#333333] px-4 py-3 outline-none focus:border-[#594396] transition-colors placeholder-[#999999]"
                    placeholder="correo@ejemplo.com"
                    style={{ minHeight: '44px' }}
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-[#333333] text-sm font-light mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    className="w-full bg-[#F7F7F7] border-b-2 border-[#E0E0E0] text-[#333333] px-4 py-3 outline-none focus:border-[#594396] transition-colors placeholder-[#999999]"
                    placeholder="••••••••"
                    style={{ minHeight: '44px' }}
                  />
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <button
                    type="button"
                    className="text-[#594396] text-sm font-light hover:underline"
                  >
                    ¿Olvidó su contraseña?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-[#594396] text-white py-4 rounded-lg font-medium hover:bg-[#6d51b8] transition-colors mt-8"
                  style={{ minHeight: '44px' }}
                >
                  Iniciar Sesión
                </button>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E0E0E0]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-[#666666] font-light">
                      o
                    </span>
                  </div>
                </div>

                {/* Create Account Link */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setViewState('signup')}
                    className="text-[#594396] text-sm font-light hover:underline"
                  >
                    ¿No tiene cuenta? Crear una cuenta
                  </button>
                </div>

                {/* Footer Text */}
                <p className="text-[#999999] text-xs text-center italic mt-12">
                  "Hagan todas las cosas para la gloria de Dios" - 1 Cor. 10:31
                </p>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}