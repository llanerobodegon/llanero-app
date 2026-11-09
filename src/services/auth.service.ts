// TODO: reemplazar el mock por Supabase Auth cuando exista la sesión. Supabase no pide la
// contraseña actual para cambiarla, así que primero hay que comprobarla:
//   await supabase.auth.signInWithPassword({ email, password: currentPassword })
//   await supabase.auth.updateUser({ password: newPassword })
// La firma no debe cambiar.

/** Contraseña del usuario de prueba, para poder probar el error de "contraseña actual". */
const MOCK_CURRENT_PASSWORD = 'Llanero123';

export const authService = {
  /** Cambia la contraseña; falla si la actual no es correcta. */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (currentPassword !== MOCK_CURRENT_PASSWORD) {
      throw new Error('La contraseña actual no es correcta');
    }
    void newPassword;
  },
};
