// Edge Function: elimina la cuenta del usuario que la llama (botón "Eliminar cuenta" de la app).
//
// Borrar un usuario de Auth requiere la service role, por eso no se hace desde la app.
// - Sin pedidos: borra el usuario de Auth; la base borra en cascada `users`, `addresses`,
//   `notification_reads` y `warehouse_users`.
// - Con pedidos: `orders.user_id` y `orders.address_id` no tienen cascada (el historial de
//   pedidos se conserva), así que la cuenta se anonimiza: sin datos personales, sin token de
//   notificaciones, sin las direcciones que no estén en pedidos y con el acceso bloqueado.
//
// Desplegar: npx supabase functions deploy delete-account --project-ref uejjlbxgtlpqukuhusmt
// (SUPABASE_URL, SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY los inyecta Supabase).

import { createClient } from 'npm:@supabase/supabase-js@2';

const CUSTOMER_ROLE = 'customer';
const BAN_FOREVER = '876000h'; // ~100 años

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'Falta la sesión' }, 401);

  const url = Deno.env.get('SUPABASE_URL')!;
  // Cliente con el JWT del usuario: solo para saber quién llama.
  const userClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) return json({ error: 'Sesión no válida' }, 401);
  const userId = userData.user.id;

  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Solo clientes: las cuentas del equipo (admin, manager, delivery) se gestionan desde la web.
  const { data: profile } = await admin
    .from('users')
    .select('id, roles(name)')
    .eq('id', userId)
    .maybeSingle();
  const roleName = (profile?.roles as { name?: string } | null)?.name ?? CUSTOMER_ROLE;
  if (roleName !== CUSTOMER_ROLE) {
    return json({ error: 'Las cuentas del equipo se gestionan desde el panel de Llanero' }, 403);
  }

  const { count: orderCount, error: countError } = await admin
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (countError) return json({ error: 'No pudimos revisar tus pedidos' }, 500);

  // Sin pedidos: borrado completo.
  if (!orderCount) {
    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) return json({ error: 'No pudimos eliminar tu cuenta' }, 500);
    return json({ result: 'deleted' });
  }

  // Con pedidos: anonimizar y bloquear.
  const placeholderEmail = `eliminado+${userId}@llanero.invalid`;

  // Direcciones que no están en ningún pedido.
  const { data: usedAddresses } = await admin
    .from('orders')
    .select('address_id')
    .eq('user_id', userId)
    .not('address_id', 'is', null);
  const usedIds = (usedAddresses ?? []).map((row) => row.address_id as string);
  let deleteAddresses = admin.from('addresses').delete().eq('user_id', userId);
  if (usedIds.length > 0) {
    deleteAddresses = deleteAddresses.not('id', 'in', `(${usedIds.join(',')})`);
  }
  const { error: addressesError } = await deleteAddresses;
  if (addressesError) return json({ error: 'No pudimos eliminar tus direcciones' }, 500);

  const { error: profileError } = await admin
    .from('users')
    .update({
      first_name: 'Cuenta',
      last_name: 'eliminada',
      email: placeholderEmail,
      phone_code: null,
      phone: null,
      id_type: null,
      id_number: null,
      push_token: null,
      app_notification: false,
      is_active: false,
    })
    .eq('id', userId);
  if (profileError) return json({ error: 'No pudimos eliminar tus datos' }, 500);

  const { error: authError } = await admin.auth.admin.updateUserById(userId, {
    email: placeholderEmail,
    email_confirm: true,
    password: crypto.randomUUID() + crypto.randomUUID(),
    user_metadata: {},
    ban_duration: BAN_FOREVER,
  });
  if (authError) return json({ error: 'No pudimos cerrar el acceso a tu cuenta' }, 500);

  // Cierra todas las sesiones abiertas de esa cuenta.
  await admin.auth.admin.signOut(authHeader.replace('Bearer ', ''), 'global');

  return json({ result: 'anonymized' });
});
