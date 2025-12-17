# 📁 Organización de Imágenes

Esta carpeta contiene todas las imágenes utilizadas en la aplicación E-Comerce.

## 📂 Estructura de Carpetas

```
public/images/
├── home/              # Imágenes para la página de inicio
│   └── hero-background.jpg/png
└── products/          # Imágenes de productos
    ├── producto-1/
    │   ├── principal.jpg
    │   ├── vista-1.jpg
    │   ├── vista-2.jpg
    │   └── detalle.jpg
    └── producto-2/
        └── ...
```

## 🏠 Imágenes del Home

Coloca las imágenes de la página de inicio en `public/images/home/`:

- **Hero Background**: Imagen de fondo para la sección hero
  - Nombre sugerido: `hero-background.jpg` o `hero-background.png`
  - Tamaño recomendado: 1920x1080px o superior
  - Formato: JPG (mejor compresión) o PNG (si necesitas transparencia)

### Uso en el código:
La imagen del hero se referencia en `app/page.tsx` línea 15:
```tsx
bg-[url('/images/home/hero-background.jpg')]
```

## 🛍️ Imágenes de Productos

Coloca las imágenes de cada producto en `public/images/products/`:

### Estructura recomendada:

**Opción 1: Por nombre de producto (recomendado)**
```
products/
├── jean-clasico-azul/
│   ├── principal.jpg
│   ├── vista-lateral.jpg
│   ├── vista-detalle.jpg
│   └── modelo.jpg
└── conjunto-deportivo-mint/
    ├── principal.jpg
    └── conjunto-completo.jpg
```

**Opción 2: Por ID de producto**
```
products/
├── producto-1/
│   ├── 1.jpg
│   ├── 2.jpg
│   └── 3.jpg
└── producto-2/
    └── ...
```

### Convenciones de nombres:

- **Principal**: `principal.jpg` o `main.jpg` - Imagen principal del producto
- **Vistas adicionales**: `vista-1.jpg`, `vista-2.jpg`, `detalle.jpg`, etc.
- **Formato**: JPG (recomendado) o PNG
- **Tamaño recomendado**: 800x1200px (ratio 2:3) para productos de moda

### Uso en el código:

Las imágenes se referencian en:
- `app/page.tsx` - Productos destacados (línea 62)
- `app/productos/page.tsx` - Lista de productos (línea 248)
- `app/productos/[id]/page.tsx` - Detalle del producto (líneas 123, 132)

Ejemplo de ruta en la base de datos:
```sql
image_url: '/images/products/jean-clasico-azul/principal.jpg'
images: ARRAY['/images/products/jean-clasico-azul/principal.jpg', '/images/products/jean-clasico-azul/vista-1.jpg']
```

## 📝 Notas Importantes

1. **Rutas**: Todas las rutas deben comenzar con `/images/` (sin `public/`)
2. **Optimización**: Considera usar Next.js Image component para mejor rendimiento
3. **Formatos**: 
   - JPG: Para fotografías (mejor compresión)
   - PNG: Para imágenes con transparencia o gráficos
   - WebP: Formato moderno con mejor compresión (recomendado si es posible)
4. **Tamaños**: 
   - Hero: 1920x1080px o superior
   - Productos: 800x1200px (ratio 2:3) o 600x900px
5. **Nombres de archivos**: Usa nombres descriptivos en minúsculas con guiones: `jean-clasico-azul.jpg`

## 🔄 Actualizar Imágenes

Cuando agregues nuevas imágenes:

1. Coloca el archivo en la carpeta correspondiente
2. Actualiza la ruta en la base de datos (campo `image_url` y array `images`)
3. Si usas mock-data, actualiza `lib/mock-data.ts` con las nuevas rutas

## 📦 Ejemplo de Producto Completo

```typescript
{
  id: "1",
  name: "Jean Clásico Azul",
  image_url: "/images/products/jean-clasico-azul/principal.jpg",
  images: [
    "/images/products/jean-clasico-azul/principal.jpg",
    "/images/products/jean-clasico-azul/vista-lateral.jpg",
    "/images/products/jean-clasico-azul/vista-detalle.jpg",
    "/images/products/jean-clasico-azul/modelo.jpg"
  ]
}
```

