import type { User } from '@/models/user.model';

// TODO: reemplazar el mock por Supabase cuando exista la sesión:
//   const { data: { user } } = await supabase.auth.getUser();
//   supabase.from('users').select('*').eq('id', user.id).single()
// La firma no debe cambiar.

const MOCK_USER: User = {
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
    return MOCK_USER;
  },
};
