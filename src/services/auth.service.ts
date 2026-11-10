// TODO: reemplazar el mock por Supabase Auth cuando se conecte el cliente:
//   signIn:  supabase.auth.signInWithPassword({ email, password })
//   signOut: supabase.auth.signOut()
//   deleteAccount: una Edge Function (borrar usuarios requiere la service role key).
//   changePassword: Supabase no pide la contraseña actual, así que primero se comprueba con
//     signInWithPassword({ email, password: currentPassword }) y luego updateUser({ password }).
// Las firmas no deben cambiar.

/** Contraseña del usuario de prueba (para probar los errores de contraseña). */
const MOCK_PASSWORD = 'Llanero123';

export const authService = {
  /** Inicia sesión con correo y contraseña; falla si no coinciden. */
  async signIn(email: string, password: string): Promise<void> {
    void email;
    if (password !== MOCK_PASSWORD) {
      throw new Error('Correo o contraseña incorrectos');
    }
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
