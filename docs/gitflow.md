# Flujo de ramas — Gitflow

El proyecto usa [git-flow](https://github.com/nvie/gitflow) con su configuración estándar.

| Rama | Para qué | Sale de | Se une a |
|---|---|---|---|
| `main` | Lo que está en producción (tiendas). Cada merge lleva un tag `vX.Y.Z` | — | — |
| `develop` | Integración: lo que irá en la próxima versión | `main` | — |
| `feature/<nombre>` | Una funcionalidad o cambio | `develop` | `develop` |
| `release/<X.Y.Z>` | Preparar una versión: subir versión, últimos arreglos | `develop` | `main` y `develop` |
| `hotfix/<X.Y.Z>` | Arreglo urgente en producción | `main` | `main` y `develop` |

Nunca se hace commit directo en `main` ni en `develop`.

## Comandos

```bash
# Funcionalidad nueva
git flow feature start carrito
# ...commits...
git flow feature finish carrito          # merge a develop y borra la rama
git push origin develop

# Versión
git flow release start 1.0.0
# subir "version" en app.json y package.json, último ajuste
git flow release finish 1.0.0            # merge a main y develop, tag v1.0.0
git push origin main develop --tags

# Arreglo urgente en producción
git flow hotfix start 1.0.1
git flow hotfix finish 1.0.1
git push origin main develop --tags
```

Para trabajar una feature en equipo o abrir un PR: `git flow feature publish <nombre>`.

## Nombres

- Features en kebab-case y en lo posible en inglés: `feature/cart`, `feature/order-tracking`.
- Versiones con semver: `1.2.0` (sin la `v`; git-flow agrega el prefijo al tag).
- Mensajes de commit en imperativo, en una línea corta: `Add cart view model`.

## Versiones y EAS

- `release/*` es el momento de subir `version` en `app.json` antes de construir con EAS.
- Los builds de tienda salen de `main`; los builds de prueba (preview) pueden salir de `develop`.
