# Carrito en drawer con estilo ticket — Diseño

Fecha: 2026-11-09 · App: Llanero (Expo SDK 58, Expo Router, HeroUI Native + Uniwind, MVVM)

## Intención

El cliente arma su pedido desde el Inicio tocando el "+" de cada producto y revisa lo que lleva en
un carrito que se siente como un **ticket de compra**. El carrito vive en un **drawer lateral** que
entra por la derecha y **empuja toda la app hacia la izquierda**, para que se sienta parte de la
app y no una pantalla aparte. Lo que arma no se pierde si cierra la app.

## Objetivos

1. Agregar productos al carrito desde cualquier `ProductCard` sin salir del Inicio.
2. Ver y editar el carrito en un drawer con estilo ticket (opción **B · Ticket con muescas**).
3. Que el carrito y la tienda elegida sobrevivan a cerrar y abrir la app.
4. Que el carrito siempre pertenezca a una sola tienda; cambiar de tienda lo vacía previa confirmación.

## No-objetivos (por ahora)

- Pantalla de pago / checkout: el botón **Pagar** queda con un TODO.
- Guardar el carrito en Supabase o sincronizarlo entre dispositivos (no hay sesión todavía).
- Refrescar precios guardados contra Supabase (los productos aún son mocks). Ver "Después".
- Cupones, notas por producto, costo de delivery en el ticket.

## Anti-objetivos (sería un fracaso aunque funcione)

- Que el "+" abra el drawer o saque al cliente del Inicio.
- Que el carrito mezcle productos de dos tiendas.
- Que el cliente pierda su carrito al cerrar la app.
- Que cambiar de tienda vacíe el carrito **sin avisar**.
- Que el ticket se vea genérico: debe leerse claramente como un ticket con perforación y muescas.

## Decisiones del usuario

### Drawer

- Librería: **`react-native-drawer-layout`** (componente `Drawer`), instalada con `npx expo install`.
  Es compatible con las versiones del proyecto (peer deps: gesture-handler ≥ 2, reanimated ≥ 2;
  el proyecto tiene `react-native-gesture-handler ~3.3.0` y `react-native-reanimated 4.7.1`).
- `drawerPosition="right"`, `drawerType="slide"`: el drawer entra por la derecha y la app entera
  (Inicio **y** la barra de pestañas `NativeTabs`) se desplaza a la izquierda.
- Se abre con el botón del carrito de la barra superior del Inicio (`HomeTopBar`).

### Contenido del drawer — "B · Ticket con muescas"

Referencia visual: `.superpowers/brainstorm/20279-1794251214/content/ticket-styles.html`, opción B.

- Fondo del drawer: gris sutil del tema (`bg-background`), igual que el Inicio.
- Encabezado: "Tu carrito" y a la derecha el conteo ("4 productos", suma de cantidades).
- **Ticket**: tarjeta blanca (`bg-surface`) con esquinas redondeadas.
  - **Parte superior (líneas):** por producto: miniatura cuadrada redondeada (imagen o placeholder),
    nombre (1 línea), debajo presentación · precio unitario final en gris
    (p. ej. "1 kg · $1.28"), y a la derecha el control **− cantidad +**.
  - **Perforación:** línea punteada horizontal con una **muesca semicircular a cada lado**
    (círculos del color del fondo del drawer que "muerden" el borde de la tarjeta).
  - **Parte inferior:** "Productos (N)" con su monto en gris y **Subtotal** en negrita.
- **Botón Pagar** fuera del ticket, abajo, naranja de marca (acento), ancho completo.
- **Empty state** (carrito vacío): el mismo ticket; arriba un ícono de carrito en círculo gris,
  "Tu carrito está vacío" y "Toca el + en cualquier producto para agregarlo."; abajo Subtotal $0.00;
  Pagar desactivado.

### Agregar productos

- El "+" de `ProductCard` agrega 1 unidad **sin abrir el drawer**.
- Da **haptic** al agregar.
- El ícono del carrito en `HomeTopBar` muestra un **badge** con la cantidad total de unidades.
  HeroUI Native no tiene componente Badge: se hace con una vista propia usando colores del tema.

### Cambiar de tienda con productos en el carrito

- Si el carrito tiene productos y el cliente elige **otra** tienda en el selector, se muestra un
  **Dialog de HeroUI Native** de confirmación. Texto propuesto (puede ajustarse):
  - Título: "¿Cambiar a {nueva tienda}?"
  - Descripción: "Tu carrito tiene productos de {tienda actual} y se vaciará, porque los precios y la
    disponibilidad cambian según la tienda."
  - Botones: "Cancelar" y "Cambiar y vaciar".
- Confirmar: se cambia la tienda, se vacía el carrito, se recargan las secciones del Inicio.
- Cancelar: se mantiene la tienda y el carrito.
- Carrito vacío o misma tienda: se cambia directo, sin diálogo (comportamiento actual).

### Persistencia

- El carrito se guarda **en el dispositivo** y se restaura al abrir la app.
- La **tienda seleccionada también se guarda** y se restaura; si ya no existe o no está activa, se
  usa la regla actual (primera abierta). Si la tienda restaurada no coincide con la del carrito
  guardado, el carrito se descarta.

## Decisiones mías (revisables)

- **Almacenamiento:** `expo-sqlite/kv-store` (API tipo AsyncStorage, módulo de Expo, funciona en
  Expo Go). Se instala `expo-sqlite` con `npx expo install`.
- **Qué guarda cada línea del carrito:** una "foto" del producto suficiente para pintar el ticket
  sin consultar: `productId`, `name`, `description` (presentación), `imageUrl`, `unitPrice`
  (precio final: `discountPrice` si está en descuento, si no `price`) y `quantity`. El carrito guarda
  además el `warehouseId` al que pertenece.
- **Bajar de 1** con "−" elimina la línea del carrito.
- **Muchos productos:** la parte superior del ticket hace scroll; perforación, subtotal y Pagar
  quedan fijos abajo.
- **Haptics:** agregar con "+" usa impacto ligero; los "−/+" del ticket usan `selectionAsync`;
  confirmar el cambio de tienda usa `Success` (como hoy al elegir tienda).
- **Dialog:** se muestra después de que se cierra la hoja de tiendas, para no apilar dos modales.
  El botón de confirmar usa la variante de peligro.
- **Arquitectura** (sigue `docs/architecture.md`):
  - `src/models/cart.model.ts`: `CartItem`, `Cart`.
  - `src/services/cart.service.ts`: leer/guardar/borrar el carrito y la tienda elegida en kv-store
    (es la capa de acceso a datos; no toca Supabase).
  - `src/contexts/cart-context.tsx`: `CartProvider` / `useCartContext()` con ítems, totales,
    `addItem`, `increment`, `decrement`, `clear`, y estado de apertura del drawer (`isOpen`,
    `open`, `close`). Persiste en cada cambio.
  - `src/viewmodels/useCartViewModel.ts` + `src/views/CartView.tsx`: contenido del drawer.
  - Componentes nuevos en `src/components/cart/` (ticket, línea, perforación, empty state, badge).
  - El `Drawer` se monta en `src/app/_layout.tsx` envolviendo `AppTabs`, dentro de
    `WarehouseProvider` y `CartProvider`.
  - La lógica de "¿hay que confirmar el cambio de tienda?" vive en el ViewModel del Inicio
    (`useHomeViewModel`), que es quien hoy recibe `selectWarehouse`; el `Dialog` lo pinta la View.

### Respuestas a la revisión del constructor (decisiones mías)

- **Tienda del carrito no disponible al restaurar:** "no disponible" = ya no aparece en
  `warehouseService.getActive()`. Una tienda **cerrada** (`isOpen = false`) sigue disponible y el
  carrito se conserva. Si la tienda desaparece, el carrito se vacía **con aviso** (Toast de HeroUI),
  nunca en silencio. Si las tiendas no cargan (sin conexión / error), se conservan carrito y tienda
  guardados.
- **Web:** fuera de alcance de este trabajo (la app es móvil); no se configura almacenamiento web.

### Pendiente del usuario

- **Si la barra de pestañas nativa (`NativeTabs`) no acompaña el empuje del drawer**, falta elegir
  alternativa: ocultar la barra con el drawer abierto, drawer encima (`front`), pestañas JS, o
  animación propia. Se decide al probarlo en el teléfono.

### Fases

1. **Frente (hecho primero):** drawer, ticket B con estado vacío, "+" con haptic y badge, Dialog al
   cambiar de tienda. El carrito vive en memoria.
2. **Persistencia (siguiente):** `expo-sqlite/kv-store` para carrito y tienda elegida, con las reglas
   de restauración de arriba.

## Restricciones

- Expo SDK 58: leer la documentación versionada antes de usar APIs de Expo; instalar con
  `npx expo install`. `android/` e `ios/` no se tocan a mano.
- MVVM del proyecto: las Views no importan services; los componentes solo reciben props.
- Colores del tema (Uniwind/HeroUI) y formato del proyecto (Prettier: comillas simples, ancho 100,
  `bracketSameLine`, `trailingComma: all`).
- Lint (`npx expo lint`) y typecheck (`npx tsc --noEmit`) deben pasar.
- Trabajo directo en `develop`; commits separados por tema.

## Lo que queda al criterio del constructor

- Medidas exactas (ancho del drawer, tamaño de miniaturas, muescas), siempre fieles a la opción B.
- Animaciones extra (p. ej. "rebote" del badge al agregar), si no estorban.
- Cómo dibujar las muescas y la perforación (vistas, SVG, etc.).
- Accesibilidad de los controles (etiquetas en español), sin que cambie el diseño.

## Después (fuera de este trabajo)

- Pantalla de pago y creación de la orden en Supabase (`orders`, `order_items`).
- Al conectar Supabase: refrescar precios y disponibilidad de los ítems guardados al abrir el carrito.
- Carrito ligado a la cuenta del cliente cuando exista inicio de sesión.
