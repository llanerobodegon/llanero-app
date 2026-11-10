// TODO: reemplazar el mock por Supabase Auth cuando se conecte el cliente:
//   signIn:  supabase.auth.signInWithPassword({ email, password })
//   signUp:  supabase.auth.signUp({ email, password, options: { data: { first_name, last_name } } })
//            (con "Confirm email" activo y la plantilla con {{ .Token }}, envía el código de 6
//            dígitos por correo); verifySignUpCode: supabase.auth.verifyOtp({ email, token,
//            type: 'signup' }); resendSignUpCode: supabase.auth.resend({ type: 'signup', email })
//   signOut: supabase.auth.signOut()
//   deleteAccount: una Edge Function (borrar usuarios requiere la service role key).
//   changePassword: Supabase no pide la contraseña actual, así que primero se comprueba con
//     signInWithPassword({ email, password: currentPassword }) y luego updateUser({ password }).
// Las firmas no deben cambiar.

/** Contraseña del usuario de prueba (para probar los errores de contraseña). */
const MOCK_PASSWORD = 'Llanero123';
/** Código de verificación de prueba que "llega" por correo. */
const MOCK_SIGN_UP_CODE = '123456';
/** Correo de prueba que ya tiene cuenta, para probar ese error. */
const MOCK_TAKEN_EMAIL = 'existe@llanero.com';

/** Datos del registro. */
export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export const authService = {
  /** Inicia sesión con correo y contraseña; falla si no coinciden. */
  async signIn(email: string, password: string): Promise<void> {
    void email;
    if (password !== MOCK_PASSWORD) {
      throw new Error('Correo o contraseña incorrectos');
    }
  },

  /** Crea la cuenta y envía un código de verificación al correo. */
  async signUp(data: SignUpData): Promise<void> {
    if (data.email === MOCK_TAKEN_EMAIL) {
      throw new Error('Ya existe una cuenta con este correo');
    }
  },

  /** Verifica el código que llegó al correo; con eso la cuenta queda activa y con sesión. */
  async verifySignUpCode(email: string, code: string): Promise<void> {
    void email;
    if (code !== MOCK_SIGN_UP_CODE) {
      throw new Error('El código no es correcto');
    }
  },

  /** Vuelve a enviar el código de verificación. */
  async resendSignUpCode(email: string): Promise<void> {
    void email;
  },

  /** Cierra la sesión en este dispositivo. */
  async signOut(): Promise<void> {},

  /** Elimina la cuenta del usuario y cierra la sesión. */
  async deleteAccount(): Promise<void> {},

  /** Cambia la contraseña; falla si la actual no es correcta. */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (currentPassword !== MOCK_PASSWORD) {
      throw new Error('La contraseña actual no es correcta');
    }
    void newPassword;
  },
};
