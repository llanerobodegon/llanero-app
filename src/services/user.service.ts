import { supabase } from '@/lib/supabase';
import type {
  IdType,
  PhoneCode,
  RoleName,
  UpdateUserData,
  User,
  UserAccess,
} from '@/models/user.model';

/** Fila de `users` (snake_case) → modelo. */
function transformUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    roleId: Number(row.role_id),
    firstName: (row.first_name as string) ?? '',
    lastName: (row.last_name as string) ?? '',
    email: row.email as string,
    phoneCode: (row.phone_code as PhoneCode | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    idType: (row.id_type as IdType | null) ?? null,
    idNumber: (row.id_number as string | null) ?? null,
    isActive: (row.is_active as boolean) ?? true,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/** Id del usuario con sesión, o error si la sesión expiró. */
async function currentUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const id = data.session?.user.id;
  if (!id) throw new Error('Tu sesión expiró; vuelve a iniciar sesión');
  return id;
}

const ROLE_NAMES: RoleName[] = ['customer', 'admin', 'manager', 'delivery'];

/** Rol guardado en el teléfono, por usuario: evita esperar a la red en cada apertura. */
const roleKeyFor = (userId: string) => `llanero.role.${userId}`;

function isRoleName(value: unknown): value is RoleName {
  return ROLE_NAMES.includes(value as RoleName);
}

export const userService = {
  /**
   * Rol del usuario con sesión y si su cuenta está activa. Decide qué modo muestra la app
   * (tienda o repartidor); los permisos reales los aplica siempre el servidor.
   */
  async getAccess(): Promise<UserAccess> {
    const id = await currentUserId();
    const { data, error } = await supabase
      .from('users')
      .select('is_active, roles (name)')
      .eq('id', id)
      .single();
    if (error) throw new Error('No pudimos cargar tu perfil');
    const roleName = (data.roles as { name: string } | null)?.name;
    const role: RoleName = isRoleName(roleName) ? roleName : 'customer';
    try {
      localStorage.setItem(roleKeyFor(id), role);
    } catch {
      // Sin almacenamiento: se vuelve a consultar en la próxima apertura.
    }
    return { role, isActive: data.is_active ?? true };
  },

  /** Último rol conocido de un usuario en este teléfono, o `null` si nunca se consultó. */
  getCachedRole(userId: string): RoleName | null {
    try {
      const value = localStorage.getItem(roleKeyFor(userId));
      return isRoleName(value) ? value : null;
    } catch {
      return null;
    }
  },

  /** Perfil del usuario con sesión (fila de `users`; RLS: cada uno ve solo el suyo). */
  async getCurrent(): Promise<User> {
    const id = await currentUserId();
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error) throw new Error('No pudimos cargar tu perfil');
    return transformUser(data);
  },

  /** Actualiza el perfil del usuario con sesión y devuelve el resultado. */
  async update(data: UpdateUserData): Promise<User> {
    const id = await currentUserId();
    const { data: row, error } = await supabase
      .from('users')
      .update({
        first_name: data.firstName,
        last_name: data.lastName,
        phone_code: data.phoneCode,
        phone: data.phone,
        id_type: data.idType,
        id_number: data.idNumber,
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new Error('No pudimos guardar tus datos');
    return transformUser(row);
  },
};
