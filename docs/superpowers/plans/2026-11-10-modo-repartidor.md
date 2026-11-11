# Modo repartidor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que una cuenta con rol `delivery` vea en la app Llanero sus entregas asignadas, las retire, contacte al cliente, las confirme con el código de 4 dígitos y consulte su historial, sin poder leer el código ni datos ajenos.

**Architecture:** El servidor expone el modo repartidor solo mediante funciones `security definer` de Postgres; la app nunca consulta `orders` directo para un repartidor. La app resuelve el rol al iniciar sesión y el layout raíz monta un grupo de rutas propio del repartidor (3 pestañas + detalle modal), siguiendo MVVM: ruta → View → ViewModel → Service → Supabase.

**Tech Stack:** Expo SDK 58, Expo Router (`NativeTabs`, `Stack.Protected`), HeroUI Native + Uniwind, Supabase (Postgres, RLS, RPC), expo-notifications.

**Spec:** `docs/superpowers/specs/2026-11-10-modo-repartidor-design.md`

## Global Constraints

- Seguir `AGENTS.md` y `docs/architecture.md`: solo `src/services/` importa Supabase; una View nunca importa un service; las rutas solo reexportan su View; modelos en camelCase, conversión snake→camel solo en services; todo ViewModel expone `isLoading` y `error`.
- Antes de tocar cualquier API de Expo/Expo Router/expo-notifications, leer la doc versionada `https://docs.expo.dev/versions/v58.0.0/` (regla de `AGENTS.md`). Para componentes HeroUI Native, consultar su documentación (MCP `heroui-native`) antes de usarlos.
- Textos y mensajes de error en español. Comentarios de código en español, como el resto del repo. Mensajes de commit en inglés, en `develop`.
- Modo claro y oscuro; reutilizar componentes y colores existentes (vinotinto/naranja). Nada de librerías nuevas.
- Migraciones en `supabase/migrations/` con nombre `YYYYMMDDHHMMSS_descripcion.sql`, comentario inicial con el porqué, mismo estilo que `20261110010000_create_order_function.sql`. Funciones: `language plpgsql`/`sql`, `security definer`, `set search_path = public`, `revoke all … from public, anon` y `grant execute … to authenticated`.
- **Nadie aplica migraciones a producción salvo el dueño**, desde su terminal. Claude Code tampoco puede leer producción. Las tareas marcadas **[DUEÑO]** se detienen y le piden que ejecute un comando.
- El repo no tiene corredor de pruebas y el diseño fija la verificación como typecheck + lint + prueba manual. No se añade framework de pruebas. Cada tarea de app termina con `npx tsc --noEmit` y `npx expo lint` en verde; la lógica del servidor se verifica con las consultas de la Tarea 5 y el recorrido manual de la Tarea 12.
- El código de entrega (`delivery_code`), montos, datos de pago y `admin_notes` nunca aparecen en una respuesta al repartidor.
- Máximo 5 intentos fallidos de código por pedido. Contacto del cliente oculto 24 h después de `delivered_at`. Zona horaria para "hoy": `America/Caracas`.

## Review Focus

1. **Doble toque en "Retiré el pedido" o "Entregar"** → una sola transición; el segundo toque no muestra error ni gasta un intento. (Tareas 3 y 9)
2. **Pedido reasignado, cancelado o completado por el admin mientras el detalle está abierto** → al refrescar o al accionar, mensaje "Este pedido ya no está asignado a ti" y regreso a la lista; nunca pantalla rota. (Tareas 3 y 9)
3. **Fallo de red al confirmar el código** → no se sabe si se aplicó: la app vuelve a cargar el pedido antes de dejar reintentar, para no gastar intentos ni mostrar un pedido ya entregado como pendiente. (Tarea 9)
4. **Cliente sin teléfono o pedido sin dirección** → los botones de llamar/WhatsApp/mapa no se muestran; el resto del detalle funciona. (Tarea 9)
5. **Cambio de cuenta en el mismo dispositivo** (sale un cliente, entra un repartidor o al revés) → nunca se ve un instante de la interfaz del rol anterior ni datos del usuario anterior. (Tarea 6)

---

### Task 1: [DUEÑO] Foto de las reglas reales de producción

La base en producción tiene reglas y funciones que no están en las migraciones (p. ej. `get_customer_ids_for_delivery`, `get_address_ids_for_delivery` en `src/types/database.ts`). Las migraciones de las Tareas 2–4 deben escribirse contra lo que existe de verdad.

**Files:**
- Create (no se commitea; `supabase/.temp/` está en `.gitignore`): `supabase/.temp/policies.json`, `supabase/.temp/functions.json`, `supabase/.temp/triggers.json`

- [ ] **Step 1: Pedir al dueño que ejecute, en la raíz del repo (solo lectura):**

```bash
supabase db query --linked -o json "select tablename, policyname, cmd, roles::text, qual, with_check from pg_policies where schemaname='public' and tablename in ('orders','order_items','users','addresses','warehouses','warehouse_users') order by 1,2" > supabase/.temp/policies.json
supabase db query --linked -o json "select p.proname, pg_get_functiondef(p.oid) as def from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('handle_new_user','handle_delivery_person_assigned','get_customer_ids_for_delivery','get_address_ids_for_delivery','is_manager_or_admin','is_admin','is_manager','generate_delivery_code')" > supabase/.temp/functions.json
supabase db query --linked -o json "select event_object_table, trigger_name, action_timing, event_manipulation, action_statement from information_schema.triggers where trigger_schema='public' and event_object_table in ('orders','users') order by 1,2" > supabase/.temp/triggers.json
```

- [ ] **Step 2: Leer los tres archivos** y anotar, al inicio de la Tarea 4 de este plan (editando el documento): el nombre exacto de cada regla que da acceso a repartidores sobre `orders`, `order_items`, `users` y `addresses`, y si `orders` ya tiene alguna columna de intentos.

- [ ] **Step 3:** Si `handle_new_user` o las reglas de `users` difieren de lo que describe el diseño en "Riesgos de seguridad", detenerse y avisar al dueño antes de seguir con la Tarea 2.

---

### Task 2: Migración — roles protegidos

**Files:**
- Create: `supabase/migrations/20261111000000_protect_user_roles.sql`

**Interfaces:**
- Produces: trigger `protect_user_privileged_columns` en `users`; `handle_new_user` siempre crea clientes.

- [ ] **Step 1: Escribir la función y el trigger de protección.**

`public.protect_user_privileged_columns()` — `returns trigger`, `language plpgsql`, **sin** `security definer` (necesita ver el rol real de la sesión). `before update on public.users for each row`. Regla exacta:

```sql
if current_user in ('authenticated', 'anon')
   and not public.is_manager_or_admin()
   and (new.role_id is distinct from old.role_id
        or new.is_active is distinct from old.is_active
        or new.delivery_status is distinct from old.delivery_status
        or new.email is distinct from old.email) then
  raise exception 'No puedes modificar estos datos' using errcode = '42501';
end if;
return new;
```

Por qué `current_user`: dentro de una función `security definer` vale el dueño de la función, así que las funciones del servidor (Tarea 3) y la clave de servicio de la web (`/api/delivery`, `/api/team`) siguen pudiendo cambiar esas columnas; una actualización directa desde la app, no.

- [ ] **Step 2: Reemplazar `handle_new_user`** con `create or replace`, partiendo de la definición real en `supabase/.temp/functions.json`: el rol es siempre `customer` (se elimina la lectura de `raw_user_meta_data->>'role'`); el resto igual. La web asigna `role_id` después con la clave de servicio (`llanero-web/app/api/delivery/route.ts:157-172`, `app/api/team/route.ts:154-161`), así que no depende de ese dato.

- [ ] **Step 3: Verificar que la app no rompe:** `grep -rn "delivery_status\|role_id\|is_active" src/services` — ningún service de la app debe escribir esas columnas en `users` (`user.service.ts update` solo escribe datos personales; `notification-settings.service.ts` solo `push_token`/`app_notification`).

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20261111000000_protect_user_roles.sql
git commit -m "Protect role, active flag and delivery status from self-edits"
```

---

### Task 3: Migración — funciones del modo repartidor

**Files:**
- Create: `supabase/migrations/20261111010000_delivery_mode_functions.sql`

**Interfaces:**
- Produces (todas en `public`, llamadas por la Tarea 7):

| Función | Firma | Devuelve |
|---|---|---|
| `get_delivery_orders` | `(p_scope text, p_limit int default 20, p_offset int default 0)` | `table (id uuid, order_number text, status text, warehouse_name text, customer_name text, address_line_1 text, city text, item_count int, created_at timestamptz, delivered_at timestamptz)` |
| `get_delivery_order` | `(p_order_id uuid)` | `jsonb` (forma abajo) o `null` |
| `get_delivery_summary` | `()` | `table (today int, last_7_days int)` |
| `delivery_mark_picked_up` | `(p_order_id uuid)` | `void` |
| `delivery_complete_order` | `(p_order_id uuid, p_code text)` | `jsonb` `{"completed": bool, "attempts_left": int}` |
| `set_delivery_availability` | `(p_available boolean)` | `text` (el `delivery_status` resultante) |

Errores, siempre con `raise exception '<clave>'` (la app los traduce): `not_delivery`, `order_not_found`, `invalid_status`, `code_locked`, `has_active_delivery`.

- [ ] **Step 1: Columna de intentos y guardia común.**

```sql
alter table public.orders
  add column if not exists delivery_code_attempts int not null default 0;
```

`public.assert_active_delivery()` `returns uuid` (interna: `revoke` de `authenticated` también): devuelve `auth.uid()` si el usuario tiene rol `delivery` y `is_active`; si no, `raise exception 'not_delivery'`. Todas las funciones de abajo empiezan llamándola.

"Pedido del repartidor" significa siempre: `delivery_person_id = <uid>` **y** `delivery_type = 'delivery'`.

- [ ] **Step 2: `get_delivery_orders`.** `p_scope = 'active'` → `status in ('pending','confirmed','on_delivery')`, orden `created_at asc`. `p_scope = 'history'` → `status = 'completed'`, orden `delivered_at desc`. Cualquier otro valor → `raise exception 'invalid_status'`. `p_limit` acotado a 1–50. `customer_name` = nombre + apellido; `item_count` = suma de `quantity`.

- [ ] **Step 3: `get_delivery_order`.** `null` si el pedido no es del repartidor. Forma exacta:

```json
{
  "id": "", "order_number": "", "status": "",
  "created_at": "", "confirmed_at": null, "delivered_at": null,
  "customer_notes": null,
  "attempts_left": 5,
  "contact_hidden": false,
  "warehouse": { "name": "", "address": null, "phone": null },
  "customer": { "first_name": "", "last_name": "", "phone_code": null, "phone": null },
  "address": { "label": "", "address_line_1": "", "address_line_2": null, "city": "" },
  "items": [ { "id": "", "product_name": "", "product_image_url": null, "quantity": 1 } ]
}
```

`attempts_left = greatest(0, 5 - delivery_code_attempts)`. `contact_hidden = (status = 'completed' and delivered_at < now() - interval '24 hours')`; cuando es `true`, `customer.phone_code`, `customer.phone` y `address` van en `null` (el nombre se conserva). `address` también es `null` si el pedido no tiene dirección. Nunca incluir `delivery_code`, precios, pago ni `admin_notes`.

- [ ] **Step 4: `get_delivery_summary`.** Cuenta pedidos del repartidor con `status = 'completed'`: `today` = `(delivered_at at time zone 'America/Caracas')::date = (now() at time zone 'America/Caracas')::date`; `last_7_days` = `delivered_at >= now() - interval '7 days'`.

- [ ] **Step 5: `delivery_mark_picked_up`.** Bloquea la fila (`for update`). No es del repartidor → `order_not_found`. `status = 'on_delivery'` → retorna sin hacer nada (idempotente, Review Focus 1). `status <> 'confirmed'` → `invalid_status`. Si no: `status = 'on_delivery'`. No toca `users` (lo hace el trigger del Step 8).

- [ ] **Step 6: `delivery_complete_order`.** Bloquea la fila (`for update`). No es del repartidor → `order_not_found`. `status = 'completed'` → devuelve `{"completed": true, "attempts_left": <restantes>}` sin cambios (idempotente). `status <> 'on_delivery'` → `invalid_status`. `delivery_code_attempts >= 5` → `code_locked`. Código correcto (`p_code = delivery_code`) → `status = 'completed'`, `delivered_at = now()`, devuelve `completed: true`. Incorrecto → `delivery_code_attempts + 1` y devuelve `{"completed": false, "attempts_left": <restantes>}` **sin lanzar excepción** (una excepción desharía el contador).

- [ ] **Step 7: `set_delivery_availability`.** `p_available = false` con algún pedido del repartidor en `on_delivery` → `has_active_delivery`. `false` → `unavailable`. `true` → `available`, salvo que ya esté `on_delivery` (se deja igual). Devuelve el estado final.

- [ ] **Step 8: Trigger que sincroniza el estado del repartidor.** `public.sync_delivery_person_status()` `security definer`, `after update of status, delivery_person_id on public.orders for each row`. Para cada repartidor afectado (`old.delivery_person_id` y `new.delivery_person_id`, sin nulos ni repetidos): si tiene algún pedido en `on_delivery` su estado objetivo es `on_delivery`, si no `available`; se actualiza `users.delivery_status` solo si el actual **no** es `unavailable` y difiere del objetivo.

- [ ] **Step 9: Aviso al reasignar.** `create or replace` de `handle_delivery_person_assigned()` partiendo de la definición real (`supabase/.temp/functions.json`); única diferencia: la condición pasa a `new.delivery_person_id is not null and new.delivery_person_id is distinct from old.delivery_person_id`.

- [ ] **Step 10: Permisos.** `revoke all … from public, anon` y `grant execute … to authenticated` para las seis funciones públicas; las de trigger y `assert_active_delivery` sin `grant`.

- [ ] **Step 11: Releer la migración contra el Review Focus 1 y 2** (idempotencia y pedido que ya no es del repartidor) y contra la lista de campos prohibidos.

- [ ] **Step 12: Commit**

```bash
git add supabase/migrations/20261111010000_delivery_mode_functions.sql
git commit -m "Add server functions for delivery-person mode"
```

---

### Task 4: Migración — cerrar el acceso directo del repartidor

> Reglas reales encontradas en la Tarea 1: _(completar en Task 1, Step 2)_

**Files:**
- Create: `supabase/migrations/20261111020000_close_delivery_direct_access.sql`

- [ ] **Step 1: Eliminar** (`drop policy if exists`) cada regla anotada arriba que dé a repartidores acceso a `orders` (en migraciones: `"Delivery members can view and update assigned orders"`), y las que les den lectura de `users`/`addresses` de clientes (las que usen `get_customer_ids_for_delivery` / `get_address_ids_for_delivery`). No tocar reglas de admin, gerente ni cliente.

- [ ] **Step 2: Rehacer la lectura de `order_items`:** la regla `"Users can view items of their orders"` queda solo con `orders.user_id = auth.uid()` (se quita `or orders.delivery_person_id = auth.uid()`).

- [ ] **Step 3: Comprobar con las reglas reales** que tras esta migración el cliente conserva: leer sus pedidos y líneas, y `get_order_delivery_person`. Si alguna regla eliminada también servía a otro rol, detenerse y avisar.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20261111020000_close_delivery_direct_access.sql
git commit -m "Close direct order access for delivery accounts"
```

---

### Task 5: [DUEÑO] Aplicar migraciones y regenerar tipos

**Files:**
- Modify: `src/types/database.ts` (regenerado)

- [ ] **Step 1: Mostrar al dueño un resumen de las tres migraciones** y pedirle que las aplique: `supabase db push --linked`.

- [ ] **Step 2: Pedirle que regenere los tipos:** `supabase gen types typescript --linked > src/types/database.ts`

- [ ] **Step 3: Verificar** que `src/types/database.ts` contiene las seis funciones de la Tarea 3 y `delivery_code_attempts`; `npx tsc --noEmit` en verde.

- [ ] **Step 4: Pedir al dueño estas comprobaciones de solo lectura** y revisar el resultado:

```bash
supabase db query --linked "select policyname, cmd from pg_policies where schemaname='public' and tablename in ('orders','order_items') order by 1"
supabase db query --linked "select proname, prosecdef from pg_proc where proname like '%delivery%' order by 1"
```

Esperado: ninguna regla de repartidor en `orders`; las seis funciones con `prosecdef = true`.

- [ ] **Step 5: Commit**

```bash
git add src/types/database.ts
git commit -m "Regenerate database types for delivery mode"
```

---

### Task 6: Rol en la sesión y separación de rutas

**Files:**
- Modify: `src/services/user.service.ts`, `src/contexts/auth-context.tsx`, `src/app/_layout.tsx`, `src/contexts/warehouse-context.tsx`, `src/contexts/favorites-context.tsx`, `src/contexts/cart-context.tsx`
- Create: `src/components/delivery-tabs.tsx`, `src/app/(delivery)/_layout.tsx`, `src/app/(delivery)/deliveries.tsx`, `src/app/(delivery)/history.tsx`, `src/app/(delivery)/profile.tsx`, `src/views/DeliveriesView.tsx`, `src/views/DeliveryHistoryView.tsx` (las dos Views, por ahora, con `ScreenPlaceholder` de `src/components/screen-placeholder.tsx`)

**Interfaces:**
- Produces:
  - `userService.getAccess(): Promise<{ role: RoleName; isActive: boolean }>` — lee `is_active` y el nombre del rol (`roles.name`) de la fila propia.
  - `useAuthContext()` añade `role: RoleName | null` e `isDelivery: boolean`. `isLoading` sigue en `true` hasta que, habiendo sesión, el rol esté resuelto.

- [ ] **Step 1: `userService.getAccess()`** en `src/services/user.service.ts`. Error: `'No pudimos cargar tu perfil'`.

- [ ] **Step 2: `AuthProvider`.** Cada vez que cambia `session?.user.id`: poner `role` en `null` y `isLoading` en `true` **antes** de consultar (Review Focus 5), llamar `getAccess()` y guardar el rol. Si `role === 'delivery'` y `isActive === false`: `authService.signOut()` y `Alert.alert('Cuenta desactivada', 'Tu cuenta de repartidor está desactivada. Contacta al bodegón.')`. Si `getAccess()` falla (sin red): tratar como cliente no es aceptable para un repartidor → mantener `isLoading` y reintentar al volver la app a primer plano; tras 3 fallos, cerrar sesión con `Alert.alert('Sin conexión', 'No pudimos verificar tu cuenta. Inténtalo de nuevo.')`. Roles `admin` y `manager` se tratan como cliente (`isDelivery` solo es `true` para `delivery`).

- [ ] **Step 3: Leer la doc de Expo Router v58** sobre `Stack.Protected` y grupos de rutas, y confirmar cómo elige la pantalla inicial cuando cambia el guard. Las pestañas del repartidor usan nombres que no chocan con las del cliente (`deliveries`, `history`, `profile`), a propósito.

- [ ] **Step 4: `src/app/_layout.tsx`.** Tres bloques protegidos en vez de dos:
  - `guard={isSignedIn && !isDelivery}`: `(tabs)`, `product/[id]`, `order/[id]`, `category/[id]`, `subcategory/[id]`, `checkout/*`, `account/addresses/*`, `account/payment-methods/*`, `auth/registered`.
  - `guard={isSignedIn && isDelivery}`: `(delivery)` y `delivery/[id]` (este último lo crea la Tarea 9; añadir aquí la línea `Stack.Screen` con `presentation: 'modal'` en esa tarea).
  - `guard={isSignedIn}` (ambos roles): `account/personal-info`, `account/change-password`, `account/notifications`.
  - `CartDrawerView isEnabled={isSignedIn && !isDelivery}`.

- [ ] **Step 5: `src/components/delivery-tabs.tsx`** — copia de la estructura de `src/components/app-tabs.tsx` (mismos colores y props de `NativeTabs`), con tres pestañas:

| name | Etiqueta | SF Symbol (default / selected) | Material |
|---|---|---|---|
| `deliveries` | Entregas | `shippingbox` / `shippingbox.fill` | `local_shipping` |
| `history` | Historial | `clock` / `clock.fill` | `history` |
| `profile` | Cuenta | `person` / `person.fill` | `person` |

`src/app/(delivery)/_layout.tsx` lo reexporta como hace `src/app/(tabs)/_layout.tsx`. `profile.tsx` reexporta `AccountView`; las otras dos, su View.

- [ ] **Step 6: Proveedores de la tienda.** En `WarehouseProvider`, `FavoritesProvider` y `CartProvider`, no cargar ni persistir nada cuando `isDelivery` es `true` (leer cada uno y cortar en sus efectos de carga; el resto de su API sigue devolviendo valores vacíos).

- [ ] **Step 7: Verificar.** `npx tsc --noEmit` y `npx expo lint` en verde. En el build de desarrollo: una cuenta de cliente ve la tienda igual que antes; una de repartidor ve las tres pestañas con marcadores. Salir de una y entrar con la otra no muestra la interfaz anterior.

- [ ] **Step 8: Commit**

```bash
git add src
git commit -m "Route delivery accounts to their own tabs"
```

---

### Task 7: Modelo y service de entregas

**Files:**
- Create: `src/models/delivery.model.ts`, `src/services/delivery.service.ts`, `src/lib/contact.ts`

**Interfaces:**
- Consumes: las seis funciones de la Tarea 3.
- Produces:

```ts
// src/models/delivery.model.ts
export type DeliveryAvailability = 'available' | 'on_delivery' | 'unavailable';

export interface DeliveryListItem {
  id: string; orderNumber: string; status: OrderStatus;
  warehouseName: string; customerName: string;
  addressLine1: string | null; city: string | null;
  itemCount: number; createdAt: string; deliveredAt: string | null;
}

export interface DeliveryItem { id: string; productName: string; productImageUrl: string | null; quantity: number }

export interface DeliveryOrder {
  id: string; orderNumber: string; status: OrderStatus;
  createdAt: string; confirmedAt: string | null; deliveredAt: string | null;
  customerNotes: string | null;
  attemptsLeft: number; isContactHidden: boolean;
  warehouse: { name: string; address: string | null; phone: string | null };
  customer: { firstName: string; lastName: string; phoneCode: string | null; phone: string | null };
  address: { label: string | null; address1: string; address2: string | null; city: string } | null;
  items: DeliveryItem[];
}

export interface DeliverySummary { today: number; last7Days: number }
export interface CompleteDeliveryResult { isCompleted: boolean; attemptsLeft: number }

// src/services/delivery.service.ts
export const deliveryService = {
  getActive(): Promise<DeliveryListItem[]>,
  getHistory(page: number): Promise<DeliveryListItem[]>,   // HISTORY_PAGE_SIZE = 20, page desde 0
  getById(orderId: string): Promise<DeliveryOrder | null>,
  getSummary(): Promise<DeliverySummary>,
  markPickedUp(orderId: string): Promise<void>,
  complete(orderId: string, code: string): Promise<CompleteDeliveryResult>,
  getAvailability(): Promise<DeliveryAvailability>,          // lee users.delivery_status propio
  setAvailability(isAvailable: boolean): Promise<DeliveryAvailability>,
};
export class DeliveryError extends Error { code: DeliveryErrorCode }
export type DeliveryErrorCode = 'not_delivery' | 'order_not_found' | 'invalid_status' | 'code_locked' | 'has_active_delivery' | 'unknown';

// src/lib/contact.ts
export function telUrl(phoneCode: string | null, phone: string | null): string | null; // "tel:04241234567"
export function mapsSearchUrl(address: string): string; // https://www.google.com/maps/search/?api=1&query=<encoded>
```

- [ ] **Step 1: Modelo** en `src/models/delivery.model.ts` (importa `OrderStatus` de `order.model.ts`).

- [ ] **Step 2: Service.** Nombres de producto y bodegón pasan por `normalizeCase` (`src/lib/text.ts`), como en `order.service.ts`. Los errores del servidor se convierten en `DeliveryError` buscando la clave en `error.message`; mensajes exactos:

| code | message |
|---|---|
| `not_delivery` | `Tu cuenta no tiene acceso al modo repartidor` |
| `order_not_found` | `Este pedido ya no está asignado a ti` |
| `invalid_status` | `El pedido cambió de estado. Actualiza e inténtalo de nuevo` |
| `code_locked` | `Se agotaron los intentos. Contacta al bodegón para completar la entrega` |
| `has_active_delivery` | `Termina tu entrega en curso antes de desconectarte` |
| `unknown` | `Algo salió mal. Revisa tu conexión e inténtalo de nuevo` |

- [ ] **Step 3: `src/lib/contact.ts`.** `telUrl` devuelve `null` si falta código o teléfono.

- [ ] **Step 4:** `npx tsc --noEmit` y `npx expo lint` en verde.

- [ ] **Step 5: Commit**

```bash
git add src/models/delivery.model.ts src/services/delivery.service.ts src/lib/contact.ts
git commit -m "Add delivery model and service"
```

---

### Task 8: Pestaña Entregas

**Files:**
- Create: `src/viewmodels/useDeliveriesViewModel.ts`, `src/components/delivery/delivery-card.tsx`, `src/components/delivery/availability-switch.tsx`, `src/hooks/use-notification-received.ts`
- Modify: `src/views/DeliveriesView.tsx`

**Interfaces:**
- Consumes: `deliveryService.getActive/getAvailability/setAvailability`, `DeliveryListItem`, `DeliveryAvailability`.
- Produces:
  - `useDeliveriesViewModel()` → `{ deliveries, availability, isLoading, isRefreshing, isUpdatingAvailability, error, refresh(), toggleAvailability(), openDelivery(id) }`
  - `useNotificationReceived(onReceived: () => void): void` — llama al callback cuando llega un aviso con la app abierta (`Notifications.addNotificationReceivedListener`; no-op en web).
  - `<DeliveryCard delivery={DeliveryListItem} onPress={() => void} />`
  - `<AvailabilitySwitch availability isUpdating onToggle />`

- [ ] **Step 1: ViewModel**, con el mismo patrón que `src/viewmodels/useOrdersViewModel.ts` (contador `requestId`, `useFocusEffect` para recargar al entrar, `isRefreshing` para deslizar). También recarga con `useNotificationReceived`. `openDelivery` navega a `/delivery/[id]`. `toggleAvailability`: si `availability === 'on_delivery'` no hace nada; en error deja el valor anterior y pone `error` con el mensaje del `DeliveryError`.

- [ ] **Step 2: `DeliveryCard`**, mismo aspecto que `src/components/order/order-card.tsx` (reutiliza `OrderStatusChip`): `Pedido #<orderNumber>`, bodegón, cliente, `addressLine1, city`, y `<itemCount> productos`. Sin precios.

- [ ] **Step 3: `AvailabilitySwitch`.** Fila con título y subtítulo + interruptor:

| availability | Título | Subtítulo | Interruptor |
|---|---|---|---|
| `available` | Disponible | Puedes recibir pedidos | encendido |
| `unavailable` | No disponible | No te asignarán pedidos | apagado |
| `on_delivery` | En entrega | Tienes un pedido en camino | encendido, deshabilitado |

- [ ] **Step 4: `DeliveriesView`**, estructura de `src/views/OrdersView.tsx`: encabezado "Entregas", `AvailabilitySwitch`, lista con deslizar para actualizar, y `EmptyState` (`src/components/empty-state.tsx`) con "No tienes entregas pendientes" / "Cuando el bodegón te asigne un pedido aparecerá aquí.". Estados de carga y error como en `OrdersView`.

- [ ] **Step 5:** `npx tsc --noEmit` y `npx expo lint` en verde; en el build: cambiar la disponibilidad se refleja en la web (sección Delivery) y un pedido asignado desde la web aparece al deslizar.

- [ ] **Step 6: Commit**

```bash
git add src
git commit -m "Add deliveries tab with availability switch"
```

---

### Task 9: Detalle de la entrega, retiro y código

**Files:**
- Create: `src/app/delivery/[id].tsx`, `src/views/DeliveryDetailView.tsx`, `src/viewmodels/useDeliveryDetailViewModel.ts`, `src/components/delivery/delivery-items.tsx`, `src/components/delivery/delivery-code-sheet.tsx`
- Modify: `src/app/_layout.tsx` (añadir `<Stack.Screen name="delivery/[id]" options={{ presentation: 'modal' }} />` en el bloque del repartidor), `src/components/order/order-contact.tsx` (prop opcional `onPressCall`)

**Interfaces:**
- Consumes: `deliveryService.getById/markPickedUp/complete`, `DeliveryError`, `whatsAppUrl` (`src/lib/whatsapp.ts`), `telUrl`, `mapsSearchUrl`.
- Produces: `useDeliveryDetailViewModel(orderId)` → `{ delivery, isLoading, error, isNotFound, isSubmitting, codeError, attemptsLeft, isCodeSheetOpen, refresh(), confirmPickUp(), openCodeSheet(), closeCodeSheet(), submitCode(code), callCustomer?, whatsAppCustomer?, openMap?, callStore?, whatsAppStore? }` (las acciones de contacto son `undefined` cuando no hay dato, como `contactStore` en `useOrderDetailViewModel.ts`).

- [ ] **Step 1: ViewModel.**
  - `isNotFound` cuando `getById` devuelve `null` o cualquier acción lanza `order_not_found`; la View muestra "Este pedido ya no está asignado a ti" con botón "Volver a entregas" (Review Focus 2).
  - `confirmPickUp()`: confirmación con el mismo diálogo que usa la app (`src/components/confirm-dialog.tsx`): título "¿Retiraste el pedido?", texto "El cliente verá que su pedido va en camino.", botón "Sí, lo retiré". Ignora toques mientras `isSubmitting` (Review Focus 1). Tras éxito, `refresh()`.
  - `submitCode(code)`: solo si `code` son exactamente 4 dígitos. Resultado `isCompleted` → háptico de éxito, cerrar la hoja, `refresh()`. No completado → `codeError = 'Código incorrecto'` y actualizar `attemptsLeft`. `code_locked` → cerrar la hoja y mostrar el mensaje del error en la pantalla. **Cualquier otro error (red)** → `refresh()` antes de permitir otro intento; si el pedido ya figura `completed`, tratarlo como éxito (Review Focus 3).
  - Contacto: WhatsApp al cliente con mensaje `Hola, soy tu repartidor de Llanero. Llevo tu pedido <orderNumber>.`; al bodegón con `Hola, soy el repartidor del pedido <orderNumber>. Necesito ayuda con la entrega.` Si `isContactHidden` o falta el teléfono/dirección, la acción es `undefined` (Review Focus 4). `openMap` usa `mapsSearchUrl("<address1>, <city>")`.
  - Recarga con `useFocusEffect` y `useNotificationReceived`.

- [ ] **Step 2: `DeliveryItems`**: lista de productos con imagen, nombre y `x<quantity>`, sin precios (base: `src/components/order/order-lines.tsx`).

- [ ] **Step 3: `OrderContact`**: añadir `onPressCall?: () => void` que muestra un botón de teléfono junto al de WhatsApp, mismo tamaño y forma; sin la prop, el componente queda igual que hoy.

- [ ] **Step 4: `DeliveryCodeSheet`** (`isOpen`, `attemptsLeft`, `error`, `isSubmitting`, `onSubmit(code)`, `onClose`). Consultar la doc de HeroUI Native y usar su campo de código/OTP si existe; si no, un `TextField` numérico de 4 caracteres. Teclado numérico, `maxLength` 4, solo dígitos. Título "Código de entrega", texto "Pídele al cliente el código de 4 dígitos de su pedido.", botón "Confirmar entrega" deshabilitado hasta tener 4 dígitos, y bajo el campo: el error y "Te quedan <n> intentos" cuando `attemptsLeft < 5`.

- [ ] **Step 5: `DeliveryDetailView`**, con la estructura y componentes de `src/views/OrderDetailView.tsx` (`OrderDetailSection`, `OrderStatusChip`, `OrderContact`):
  1. Encabezado: `Pedido #<orderNumber>` + chip de estado.
  2. **Retirar en**: bodegón, dirección, `DeliveryItems`.
  3. **Entregar a**: `OrderContact` del cliente (iniciales, WhatsApp y llamada), dirección completa, botón "Abrir en mapas", notas del cliente si hay. Si `isContactHidden`: solo el nombre y el texto "Los datos de contacto ya no están disponibles."
  4. **¿Problemas con la entrega?**: `OrderContact` del bodegón (WhatsApp y llamada).
  5. Barra fija inferior: `confirmed` → "Retiré el pedido"; `on_delivery` → "Entregar" (abre la hoja), o el mensaje de bloqueo si `attemptsLeft === 0`; `pending` → texto "Esperando la confirmación del pago" sin botón; `completed`/`cancelled` → sin barra (para `completed`, "Entregado el <fecha y hora>").

- [ ] **Step 6: Ruta** `src/app/delivery/[id].tsx` reexporta la View (lee `id` con `useLocalSearchParams` dentro de la View, como `OrderDetailView`).

- [ ] **Step 7:** `npx tsc --noEmit` y `npx expo lint` en verde; en el build: retirar un pedido confirmado y ver al cliente pasar a "En camino"; código incorrecto resta un intento; código correcto completa.

- [ ] **Step 8: Commit**

```bash
git add src
git commit -m "Add delivery detail with pickup and code confirmation"
```

---

### Task 10: Historial

**Files:**
- Create: `src/viewmodels/useDeliveryHistoryViewModel.ts`, `src/components/delivery/delivery-summary.tsx`
- Modify: `src/views/DeliveryHistoryView.tsx`

**Interfaces:**
- Consumes: `deliveryService.getHistory/getSummary`, `DeliveryCard`.
- Produces: `useDeliveryHistoryViewModel()` → `{ deliveries, summary, isLoading, isRefreshing, isLoadingMore, hasMore, error, refresh(), loadMore(), openDelivery(id) }`

- [ ] **Step 1: ViewModel.** Página 0 al entrar y al deslizar; `loadMore()` pide la siguiente y añade; `hasMore` es `false` cuando una página trae menos de 20. Ignora `loadMore` mientras hay una carga en curso.

- [ ] **Step 2: `DeliverySummary`**: dos bloques lado a lado, número grande + etiqueta: "Hoy" y "Últimos 7 días".

- [ ] **Step 3: `DeliveryHistoryView`**: encabezado "Historial", `DeliverySummary`, lista de `DeliveryCard` (mostrando la fecha y hora de entrega con el formateador de `src/lib/format.ts`), carga al llegar al final, y `EmptyState` "Aún no tienes entregas" / "Tus pedidos entregados aparecerán aquí.".

- [ ] **Step 4:** `npx tsc --noEmit` y `npx expo lint` en verde; en el build: el pedido completado en la Tarea 9 aparece primero y suma en "Hoy".

- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "Add delivery history with summary"
```

---

### Task 11: Cuenta y notificaciones del repartidor

**Files:**
- Modify: `src/viewmodels/useAccountViewModel.ts`, `src/views/AccountView.tsx`, `src/hooks/use-push-notifications.ts`, `src/app/_layout.tsx`

**Interfaces:**
- Consumes: `useAuthContext().isDelivery`.
- Produces: `usePushNotifications(isSignedIn: boolean, isDelivery: boolean)`.

- [ ] **Step 1: Cuenta.** `useAccountViewModel` expone `isDelivery`; `AccountView` oculta para el repartidor las entradas de direcciones y métodos de pago, y cualquier otra propia de la tienda (leer la View y decidir entrada por entrada: quedan información personal, cambiar contraseña, notificaciones y cerrar sesión). Para clientes, sin cambios.

- [ ] **Step 2: Notificaciones.** En `openFromResponse`, el destino depende del rol: repartidor → `/delivery/[id]`; cliente → `/order/[id]` como hoy. El layout raíz pasa `isDelivery`. El rol ya está resuelto cuando `isSignedIn` es `true` y `isLoading` es `false`; no abrir nada antes.

- [ ] **Step 3: Verificar que el token de notificaciones se guarda para el repartidor:** `notificationSettingsService.syncPushToken()` solo escribe `push_token` y columnas de notificación, que el trigger de la Tarea 2 permite.

- [ ] **Step 4:** `npx tsc --noEmit` y `npx expo lint` en verde; en el build: asignar un pedido desde la web con la app cerrada, tocar el aviso y llegar al detalle de la entrega.

- [ ] **Step 5: Commit**

```bash
git add src
git commit -m "Adapt account and notifications for delivery accounts"
```

---

### Task 12: Verificación completa y cierre

**Files:**
- Modify: `docs/architecture.md` (un párrafo: modo repartidor, grupo `(delivery)`, y que solo usa funciones del servidor)
- Create en `llanero-web`: `supabase/migrations/031_protect_user_roles.sql`, `032_delivery_mode_functions.sql`, `033_close_delivery_direct_access.sql` (copias sin cambios)

- [ ] **Step 1: Recorrido manual** en el build de desarrollo, con una cuenta de repartidor y una de cliente en dos dispositivos o sesiones. Marcar cada punto:
  - [ ] Cliente crea pedido → admin verifica el pago y asigna → al repartidor le llega el aviso y lo abre.
  - [ ] Pedido pendiente asignado: aparece en la lista, sin botón de retiro.
  - [ ] "Retiré el pedido" → el cliente ve "En camino" sin refrescar; en la web el repartidor figura "En Delivery".
  - [ ] Código incorrecto → mensaje e intentos restantes. Cinco fallos → bloqueado con el mensaje del bodegón.
  - [ ] Código correcto → completado, pasa al historial, suma en "Hoy"; repartidor vuelve a "Disponible" en la web.
  - [ ] Admin cancela o reasigna un pedido en camino desde la web → el repartidor original queda "Disponible"; el nuevo recibe aviso; el detalle abierto del original muestra que ya no es suyo.
  - [ ] No se puede pasar a "No disponible" con un pedido en camino.
  - [ ] Sin teléfono de cliente: sin botones de contacto, sin errores.
  - [ ] Salir y entrar con la otra cuenta: nunca se ve la interfaz del otro rol.
  - [ ] Modo claro y oscuro en las cuatro pantallas nuevas.

- [ ] **Step 2: Comprobar que el código no viaja.** Con la sesión del repartidor, revisar en el inspector de red del build de desarrollo las respuestas de `get_delivery_orders` y `get_delivery_order`: no contienen `delivery_code`. Y que una consulta directa a `orders` desde esa sesión devuelve vacío (temporalmente, desde un `console.log` en el service, que se elimina después).

- [ ] **Step 3: Comprobar los roles.** Con una sesión de cliente, intentar `supabase.from('users').update({ role_id: <id de admin> })` sobre la propia fila (mismo método temporal): debe fallar con "No puedes modificar estos datos". Registrar una cuenta nueva desde la app: queda como `customer`.

- [ ] **Step 4:** `npx tsc --noEmit`, `npx expo lint` y `npx expo-doctor` en verde.

- [ ] **Step 5: Documentar** el párrafo en `docs/architecture.md` y commitear.

- [ ] **Step 6: Copiar las tres migraciones a `llanero-web`** (`~/orca/projects/llanero-web`, rama `chore/delivery-mode-migrations` desde `main`), commitear y **preguntar al dueño antes de pushear y abrir el PR**. El PR aclara que ya están aplicadas en producción.

- [ ] **Step 7: Informar al dueño** del resultado del recorrido, con lo que no se haya podido comprobar dicho explícitamente.
