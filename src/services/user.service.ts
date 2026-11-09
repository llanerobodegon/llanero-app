import type { UpdateUserData, User } from '@/models/user.model';

// TODO: reemplazar el mock por Supabase cuando exista la sesión:
//   const { data: { user } } = await supabase.auth.getUser();
//   supabase.from('users').select('*').eq('id', user.id).single()
// La firma no debe cambiar.

let mockUser: User = {
  id: 'mock-user-1',
  roleId: 1,
  firstName: 'María',
  lastName: 'González',
  email: 'mariagonzalez@gmail.com',
  phoneCode: '0414',
  phone: '1234567',
  idType: 'V',
  idNumber: '12345678',
  isActive: true,
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
};

export const userService = {
  /** Perfil del usuario con sesión iniciada. */
  async getCurrent(): Promise<User> {
    return mockUser;
  },

  /**
   * Actualiza el perfil del usuario y devuelve el resultado.
   * TODO: en Supabase, `users.update({ first_name, last_name, phone_code, phone, id_type,
   * id_number }).eq('id', userId).select().single()`.
   */
  async update(data: UpdateUserData): Promise<User> {
    mockUser = { ...mockUser, ...data, updatedAt: new Date().toISOString() };
    return mockUser;
  },
};
