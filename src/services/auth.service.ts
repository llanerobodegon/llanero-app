import { AuthError, type Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

/** Datos del registro. Nombre y apellido van en la metadata: el trigger `handle_new_user`
 * de la base (llanero-web, migración 001) crea con ellos la fila en `users`. */
export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/** Errores de Supabase Auth en español, por código (y por mensaje si no trae código). */
function toError(error: unknown, fallback: string): Error {
  if (error instanceof AuthError) {
    switch (error.code) {
      case 'invalid_credentials':
        return new Error('Correo o contraseña incorrectos');
      case 'email_not_confirmed':
        return new Error('Confirma tu correo con el código que te enviamos antes de entrar');
      case 'user_already_exists':
      case 'email_exists':
        return new Error('Ya existe una cuenta con este correo');
      case 'otp_expired':
        return new Error('El código no es correcto o ya venció');
      case 'over_email_send_rate_limit':
      case 'over_request_rate_limit':
        return new Error('Espera un momento antes de volver a intentarlo');
      case 'same_password':
        return new Error('La contraseña nueva debe ser distinta a la actual');
      case 'weak_password':
        return new Error('La contraseña es muy débil; prueba con una más segura');
      case 'email_address_invalid':
        return new Error('Revisa el formato del correo');
    }
    if (error.message.toLowerCase().includes('network')) {
      return new Error('No pudimos conectarnos. Revisa tu conexión a internet');
    }
  }
  if (error instanceof TypeError) {
    // fetch falla con TypeError cuando no hay conexión.
    return new Error('No pudimos conectarnos. Revisa tu conexión a internet');
  }
  return new Error(fallback);
}

export const authService = {
  /** Sesión guardada en el dispositivo (o `null`). */
  async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /** Avisa cada vez que la sesión cambia (entrar, salir, renovar). Devuelve cómo dejar de escuchar. */
  onSessionChange(callback: (session: Session | null) => void): () => void {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
    return () => data.subscription.unsubscribe();
  },

  /** Inicia sesión con correo y contraseña. */
  async signIn(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw toError(error, 'No pudimos iniciar tu sesión');
  },

  /**
   * Crea la cuenta; Supabase envía el código de 6 dígitos al correo (plantilla "Confirm signup"
   * con {{ .Token }}). La sesión empieza al verificar el código.
   */
  async signUp(data: SignUpData): Promise<void> {
    const { data: result, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { first_name: data.firstName, last_name: data.lastName } },
    });
    if (error) throw toError(error, 'No pudimos crear tu cuenta');
    // Con la confirmación de correo activa, si el correo ya existe Supabase no da error (para no
    // revelar qué correos están registrados) pero devuelve el usuario sin identidades.
    if (result.user && result.user.identities?.length === 0) {
      throw new Error('Ya existe una cuenta con este correo');
    }
  },

  /** Verifica el código del registro; con eso la cuenta queda activa y con sesión. */
  async verifySignUpCode(email: string, code: string): Promise<void> {
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'signup' });
    if (error) throw toError(error, 'No pudimos verificar el código');
  },

  /** Vuelve a enviar el código del registro. */
  async resendSignUpCode(email: string): Promise<void> {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw toError(error, 'No pudimos reenviar el código');
  },

  /**
   * Envía un código para restablecer la contraseña (plantilla "Reset password" con
   * {{ .Token }}). Por seguridad Supabase no dice si el correo tiene cuenta.
   */
  async requestPasswordReset(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw toError(error, 'No pudimos enviar el código');
  },

  /** Verifica el código de recuperación; deja una sesión para poder cambiar la contraseña. */
  async verifyPasswordResetCode(email: string, code: string): Promise<void> {
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'recovery' });
    if (error) throw toError(error, 'No pudimos verificar el código');
  },

  /** Guarda la contraseña nueva (después de verificar el código de recuperación). */
  async resetPassword(newPassword: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw toError(error, 'No pudimos guardar tu contraseña');
  },

  /**
   * Cambia la contraseña desde la cuenta. Supabase no pide la actual, así que primero se
   * comprueba volviendo a iniciar sesión con ella.
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const { data } = await supabase.auth.getUser();
    const email = data.user?.email;
    if (!email) throw new Error('Tu sesión expiró; vuelve a iniciar sesión');

    const { error: checkError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword,
    });
    if (checkError) {
      throw checkError instanceof AuthError && checkError.code === 'invalid_credentials'
        ? new Error('La contraseña actual no es correcta')
        : toError(checkError, 'No pudimos cambiar tu contraseña');
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw toError(error, 'No pudimos cambiar tu contraseña');
  },

  /** Cierra la sesión en este dispositivo. */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw toError(error, 'No pudimos cerrar tu sesión');
  },

  /**
   * Elimina la cuenta.
   * TODO: borrar un usuario de Auth requiere la service role, así que hace falta una Edge
   * Function (p. ej. `delete-account`) que valide el JWT y llame a auth.admin.deleteUser.
   * Hasta entonces avisa en lugar de fingir que se borró.
   */
  async deleteAccount(): Promise<void> {
    throw new Error(
      'Todavía no se puede eliminar la cuenta desde la app. Escríbenos y la eliminamos por ti.',
    );
  },
};
