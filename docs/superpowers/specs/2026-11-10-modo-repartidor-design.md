# Modo repartidor — diseño

Fecha: 2026-11-10 · Estado: aprobado

## Para qué

Los repartidores de Llanero Bodegón necesitan, dentro de la misma app Llanero, ver los pedidos
que les asignaron, retirarlos en el bodegón, contactar al cliente y confirmar la entrega. Hoy la
app nueva (2.0.0) solo tiene la experiencia del cliente; sin este modo no se puede publicar,
porque los repartidores se quedarían sin herramienta.

## Cómo funciona (decidido con el dueño del producto)

1. El repartidor **no se registra** en la app: lo crea un admin desde la web (`llanero-web`), con
   rol `delivery`.
2. Al iniciar sesión, la app **detecta sola** que es repartidor y muestra el modo repartidor en
   lugar de la tienda.
3. El **admin o gerente asigna** el pedido desde la web. El repartidor nunca toma pedidos por su
   cuenta ni ve pedidos sin asignar.
4. Al asignarle un pedido recibe una **notificación**; al tocarla se abre esa entrega.
5. Ve lo necesario para **retirar en el bodegón** y **entregar al cliente**, incluidos los datos
   de contacto del cliente.
6. El **repartidor marca "Retiré el pedido"** desde la app; el pedido pasa a *En camino*.
7. El pedido se marca **entregado solo al escribir el código de 4 dígitos** del pedido. El
   repartidor **no puede ver el código**: se lo muestra o dicta el cliente.
8. Tiene un **resumen de sus pedidos entregados**.
9. Si no puede entregar (el cliente no está, no contesta o no tiene el código), **contacta al
   bodegón y el admin lo resuelve desde la web**. La app no tiene un flujo propio para eso.
10. Debe mantener el **lenguaje de diseño actual** de la app.

## Objetivos

- Un repartidor puede hacer todo su trabajo (ver asignados → retirar → contactar → entregar con
  código → ver historial) sin salir de la app.
- El código de entrega y los datos que no necesita nunca llegan al teléfono del repartidor.
- El cliente ve los cambios de estado en tiempo real, como hoy.
- Cero cambios obligatorios en `llanero-web`: la web sigue asignando y resolviendo como ahora.

## Fuera de alcance

- Ubicación en vivo, rutas o mapa dentro de la app.
- Chat dentro de la app.
- Que el repartidor tome pedidos sin asignar.
- Reportar "no pude entregar" desde la app (lo resuelve el admin en la web).
- Cobro: todos los pagos son electrónicos y los verifica el admin.
- Pedidos para retirar en tienda (`pickup`): nunca aparecen al repartidor.
- Ganancias o pagos al repartidor.

## Lo que haría fallar esto aunque "funcione"

- Que el repartidor pueda obtener el código sin el cliente (leyéndolo de la respuesta del
  servidor o adivinándolo con reintentos ilimitados).
- Que un repartidor vea pedidos, clientes o direcciones de entregas que no son suyas.
- Que una cuenta de repartidor vea la tienda, o una de cliente vea el modo repartidor.
- Que se vea como una app distinta pegada a Llanero.

## Experiencia

Decisiones de diseño propuestas por Claude y aceptadas en la conversación, salvo donde dice
"decisión de Claude".

### Navegación

Misma barra de pestañas nativa (`NativeTabs`) y mismos colores, con tres pestañas:

| Pestaña | Contenido |
|---|---|
| **Entregas** (inicial) | Interruptor de disponibilidad y lista de entregas pendientes |
| **Historial** | Resumen y lista de pedidos entregados |
| **Cuenta** | La cuenta actual, sin direcciones ni métodos de pago |

El modo repartidor reemplaza a la tienda por completo: sin catálogo, carrito, favoritos ni
búsqueda.

### Entregas

- Arriba, **disponibilidad**: Disponible / No disponible. La web solo permite asignar pedidos a
  repartidores en *Disponible*, así que este interruptor decide si le pueden asignar. No se puede
  cambiar a *No disponible* mientras tenga un pedido en camino (decisión de Claude).
- Lista de pedidos asignados y sin terminar (estados *confirmado* y *en camino*), el más antiguo
  primero. Cada tarjeta, con el estilo de la tarjeta de pedido actual: número de pedido, bodegón,
  nombre del cliente, ciudad/dirección y estado.
- Estado vacío: "No tienes entregas pendientes".
- Se actualiza al entrar a la pantalla, al deslizar hacia abajo y cuando llega una notificación
  con la app abierta (decisión de Claude: sin suscripción en tiempo real para el repartidor, ver
  "Servidor").

### Detalle de una entrega

Misma presentación que el detalle de pedido del cliente (hoja modal, mismas secciones y
componentes), con este contenido:

- **Retirar en**: nombre y dirección del bodegón, y la lista de productos con cantidades para
  verificar al recoger. Sin precios (decisión de Claude: el repartidor no cobra).
- **Entregar a**: nombre del cliente, dirección completa, botón para abrir la dirección en la app
  de mapas (búsqueda por texto: las direcciones no tienen coordenadas), y botones de **llamar** y
  **WhatsApp** al cliente. Notas del cliente si las dejó.
- **¿Problemas con la entrega?**: contacto del bodegón (WhatsApp y llamada al teléfono del
  bodegón, `warehouses.phone`), igual que el contacto de tienda que ya ve el cliente.
- **Acción principal fija abajo**, según el estado:
  - *Confirmado* → **"Retiré el pedido"**, con confirmación. Pasa a *En camino*.
  - *En camino* → **"Entregar"**: abre un campo de 4 dígitos (teclado numérico). Si el código es
    correcto: confirmación de éxito, el pedido queda *Completado* y sale de Entregas. Si es
    incorrecto: mensaje de error con los intentos que quedan.
  - *Completado* o *Cancelado* → sin acción; solo lectura.
- Si el admin reasigna o cancela el pedido mientras está abierto, al refrescar se muestra que ya
  no está disponible y se vuelve a la lista.

### Historial

- Resumen arriba: entregas de hoy y de los últimos 7 días (decisión de Claude).
- Lista de pedidos completados por este repartidor, del más reciente al más antiguo, con fecha y
  hora de entrega. Paginada.
- Al tocar uno se abre el mismo detalle en solo lectura. Los datos de contacto del cliente dejan
  de mostrarse en pedidos entregados hace más de 24 horas (decisión de Claude, por privacidad).

### Cuenta

La vista de cuenta actual mostrando solo: información personal, cambiar contraseña,
notificaciones y cerrar sesión.

### Notificación

`notify-delivery` ya envía "Nuevo pedido asignado" con `data: { order_id, order_number }`. Para un
repartidor, tocarla abre el detalle de la entrega (no el detalle de pedido del cliente).

## Estados

- **Pedido**: el admin lo deja *confirmado* y asignado → el repartidor lo pasa a *en camino* →
  el código correcto lo pasa a *completado* (con `delivered_at`). La web conserva el poder de
  cambiar cualquier estado a mano.
- **Repartidor** (`users.delivery_status`), automático (decisión de Claude): pasa a `on_delivery`
  cuando marca un pedido como retirado y vuelve a `available` cuando ya no le queda ninguno en
  camino. El interruptor solo alterna entre `available` y `unavailable`.
- Puede tener varios pedidos asignados a la vez.
- Un pedido asignado que todavía está *pendiente* (pago sin verificar) se muestra en la lista,
  pero no se puede retirar hasta que esté *confirmado* (decisión de Claude).

## Servidor (Supabase)

Estado actual relevante, leído de las migraciones de `llanero-web`:

- La regla de `orders` para repartidores es `FOR ALL` sobre pedidos asignados a él **o sin
  asignar**: puede leer la fila completa (incluido `delivery_code`), editar cualquier columna y
  borrar.
- Las reglas de `users` y `addresses` solo dejan leer lo propio, así que el repartidor **no puede
  leer** el nombre, teléfono ni dirección del cliente con consultas directas.

Diseño: el modo repartidor **no consulta tablas directamente**. Todo pasa por funciones
`security definer`, igual que `create_order` y `get_order_delivery_person`, que verifican que
quien llama tiene rol `delivery`, está activo y es el `delivery_person_id` del pedido:

| Función | Qué hace |
|---|---|
| Listar entregas | Pedidos `delivery` asignados a quien llama, activos o historial (paginado), con los campos de la tarjeta |
| Detalle de entrega | Un pedido asignado a quien llama: bodegón, productos y cantidades, cliente (nombre, teléfono), dirección, notas, estado y fechas. **Nunca** `delivery_code`, montos, datos de pago ni notas internas |
| Resumen | Conteo de entregas de hoy y de los últimos 7 días |
| Marcar retirado | *confirmado* → *en camino*; pone al repartidor en `on_delivery` |
| Confirmar entrega | Recibe el código; si coincide: *completado*, `delivered_at = now()`, y libera al repartidor si no le quedan pedidos en camino. Si no coincide: cuenta el intento y devuelve los que quedan |
| Cambiar disponibilidad | Alterna `available` / `unavailable` con la regla de arriba |

**Intentos del código** (decisión de Claude): máximo 5 intentos fallidos por pedido. Al
agotarlos, el pedido queda bloqueado para confirmar desde la app y solo el admin lo completa
desde la web. Requiere guardar el contador de intentos (columna nueva en `orders` o tabla aparte:
lo decide quien construye). Sin límite, 10.000 combinaciones se prueban en minutos.

**Rol en la app**: la app necesita saber el rol al iniciar sesión. `users.role_id` ya se lee del
perfil propio; falta resolverlo al nombre (`roles` es legible por usuarios autenticados).

**Tiempo real**: el cliente sigue recibiendo los cambios como hoy. El repartidor no se suscribe
(la suscripción depende de poder leer `orders` directo, que es justo lo que se va a cerrar).

**Reglas a cerrar (en este trabajo)**: la app publicada 1.2.5 está en pausa y nadie depende de
ella (confirmado por el dueño), así que no hay que mantener compatibilidad. Se elimina la regla
`FOR ALL` de repartidores sobre `orders` (todo pasa por funciones) y se ajusta la lectura de
`order_items` para que el repartidor tampoco lea líneas con consultas directas. Va en una
migración propia, que se aplica cuando las funciones ya están en producción.

**Migraciones**: se escriben en `supabase/migrations/` de esta app, con el mismo estilo que las
existentes (comentario inicial con el porqué, cambio aditivo). El dueño las aplica a producción
desde su terminal; después se copian a `llanero-web` con su numeración (`031_…`).

**Liberar al repartidor cuando el admin resuelve desde la web** (decisión de Claude): un trigger
en `orders` recalcula `delivery_status` cuando un pedido sale de *en camino* o cambia de
repartidor, sea desde la app o desde la web. Solo mueve entre `on_delivery` y `available`: si al
repartidor no le queda ningún pedido en camino y estaba `on_delivery`, vuelve a `available`.
Nunca toca `unavailable`. Así el caso "no se pudo entregar, lo resuelve el admin" no deja al
repartidor bloqueado sin poder recibir asignaciones.

**Notificación al reasignar** (decisión de Claude): hoy el trigger de `014` solo avisa cuando el
repartidor pasa de vacío a un valor. Se amplía para avisar también al nuevo repartidor cuando el
pedido se reasigna de uno a otro (`create or replace` de la función existente, mismo aviso).

## Aplicación

Sigue `docs/architecture.md` (MVVM): ruta → View → ViewModel → Service → Supabase.

- **Sesión con rol**: el contexto de sesión expone el rol. Mientras se resuelve, se mantiene el
  splash (como ya ocurre mientras se lee la sesión).
- **Rutas**: un grupo de rutas propio del repartidor con sus pestañas y su detalle de entrega,
  protegido por rol en el layout raíz (`Stack.Protected`), igual que hoy se separa con y sin
  sesión. Un repartidor no puede llegar a rutas de cliente y viceversa.
- **Roles `admin` y `manager`** que entren a la app: se tratan como cliente, como hoy (decisión de
  Claude).
- **Repartidor inactivo** (`is_active = false`): se cierra la sesión con un mensaje. Solo aplica
  a repartidores; para clientes no cambia nada de lo que ocurre hoy (decisión de Claude).
- **Proveedores de la tienda** (bodega, carrito, favoritos): no deben cargar datos para un
  repartidor.
- **Notificaciones**: el destino al tocar un aviso depende del rol.
- **Reutilización**: tarjeta de pedido, secciones del detalle, contacto, chip de estado, estados
  vacíos y encabezados existentes. Componentes nuevos solo donde no exista equivalente (campo de
  código, interruptor de disponibilidad, resumen del historial).
- **Textos** en español, mensajes de error en español, modo claro y oscuro.

## Queda a criterio de quien construye

- Nombres de funciones SQL, rutas, vistas, viewmodels y componentes (siguiendo las convenciones
  del repo).
- Forma exacta de las respuestas de las funciones y de los modelos.
- Dónde se guarda el contador de intentos.
- Tamaño de página del historial.
- Detalle visual de los componentes nuevos, dentro del lenguaje actual (HeroUI Native + Uniwind).

## Verificación

- Typecheck y lint.
- Prueba manual en un build de desarrollo con una cuenta de repartidor y una de cliente:
  asignar desde la web → notificación → retirar → código incorrecto → código correcto →
  historial; y que el cliente vea los cambios de estado.
- Comprobar con la sesión del repartidor que ninguna respuesta contiene `delivery_code`.

## Riesgos de seguridad encontrados al investigar

Leídos de las migraciones; no se pudieron verificar contra la base en producción. El modo
repartidor confía en el rol, así que importan aquí:

1. **Cualquier usuario puede editar su propio rol.** La regla "Users can update own profile"
   (`001`) no restringe columnas: incluye `role_id` (un cliente podría hacerse admin),
   `delivery_status` e `is_active`.
2. **El rol se puede elegir al registrarse.** `handle_new_user` (`001`) toma el rol de los datos
   que envía quien se registra (`raw_user_meta_data->>'role'`). La web crea repartidores por su
   propia ruta de servidor (`/api/delivery`); hay que confirmar que no depende de ese dato antes
   de quitarlo.
3. **El repartidor puede leer el código** mientras siga la regla `FOR ALL` sobre `orders` (ver
   "Reglas a cerrar").

**Decisión:** los tres se cierran dentro de este trabajo y bloquean el lanzamiento. El dueño
confirmó que la 1.2.5 no impone compatibilidad; incluir 1 y 2 es recomendación de Claude, que el
dueño puede retirar al revisar este documento.

- Para 1: los usuarios solo pueden cambiar sus datos personales (nombre, teléfono, documento,
  preferencias de notificación y token); `role_id`, `is_active` y `delivery_status` solo los
  cambian admin/gerente o las funciones del servidor.
- Para 2: el registro desde la app siempre crea clientes; los demás roles solo los asigna la web.
