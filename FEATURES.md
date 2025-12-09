# 🌟 Características y Funcionalidades (Features)

Este documento detalla todas las capacidades de la aplicación **Mi Casa**.

## 1. Gestión de Inventario

- **CRUD Completo**: Crear, Leer, Actualizar y Eliminar items.
- **Fotos Reales**: Subida de imágenes con **compresión automática** (WebP, max 0.5MB) para ahorrar espacio y datos.
- **Categorías y Ubicaciones Dinámicas**:
  - Sistema "Get-or-Create": Si escribes una categoría nueva, se crea automáticamente.
  - Evita duplicados inteligentemente.
- **Fechas de Vencimiento**:
  - Selección de fecha para productos perecederos.
  - **Alertas Visuales**: Los productos vencidos se marcan en rojo.

## 2. Dashboard Inteligente

- **Métricas en Tiempo Real**:
  - Total de Productos.
  - Productos con **Stock Bajo**.
  - Productos **Vencidos**.
- **Filtros Rápidos**: Al hacer click en una tarjeta de estadística (ej. "Vencidos"), el inventario se filtra automáticamente.
- **Scroll Infinito**: Carga eficiente de cientos de productos sin trabar el navegador.

## 3. Búsqueda Semántica (AI Local) 🧠

- **Híbrida**: Combina búsqueda por texto exacto + búsqueda por significado (vectores).
- **Privada**: El modelo de IA (`all-MiniLM-L6-v2`) corre **en tu navegador**. Tus búsquedas no salen de tu dispositivo.
- **Ejemplo**:
  - Buscas: _"algo para el dolor de cabeza"_
  - Encuentra: _"Paracetamol"_ (aunque la descripción no diga "dolor de cabeza" explícitamente).

## 4. Privacidad y Seguridad 🛡️

- **Row Level Security (RLS)**: Cada usuario solo ve sus propios datos.
- **Items Privados**:
  - Opción para marcar items como "Privados" (candado).
  - Útil para ocultar ciertos objetos de la vista general si compartes la pantalla.
- **Políticas de Storage**: Solo tú puedes subir, editar o borrar tus fotos.

## 5. Experiencia de Usuario (UX/UI) 🎨

- **Modo Oscuro / Claro**: Toggle inmedia en la cabecera.
- **Diseño Responsivo**:
  - Móvil: Tarjetas compactas, navegación inferior.
  - Desktop: Grid expandido, imágenes grandes, fuentes escaladas.
- **Accesibilidad**: Etiquetas ARIA, contrastes cuidados y navegación por teclado.
- **Feedback**:
  - Spinners de carga.
  - Notificaciones (Toasts/Alertas) para errores o éxito.
  - Modales con backdrop desenfocado (Glassmorphism).

## 6. Arquitectura Técnica ⚙️

- **Next.js 16**: Aprovechando React Server Components y Server Actions.
- **Supabase**: Backend-as-a-Service para Auth, DB y Storage.
- **Optimistic UI**: La interfaz se actualiza instantáneamente antes de confirmar con el servidor (en ciertas acciones).
