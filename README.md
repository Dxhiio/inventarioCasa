# 🏠 Mi Casa - Inventario Inteligente (PWA)

![Status](https://img.shields.io/badge/Status-v1.0.0-green) ![Next.js](https://img.shields.io/badge/Next.js-16-black) ![Supabase](https://img.shields.io/badge/Supabase-Database-green) ![AI](https://img.shields.io/badge/AI-OnDevice-purple)

Una **Aplicación Web Progresiva (PWA)** moderna para gestionar el inventario de tu hogar. Diseñada con un enfoque "Local-First" e Inteligencia Artificial que respeta tu privacidad.

![Demo](https://via.placeholder.com/1200x600?text=Hero+Image+Placeholder)
_(Aquí iría una captura de pantalla del Dashboard)_

## ✨ Características Principales

- **📱 Diseño Móvil Primero**: Funciona como una app nativa en tu teléfono.
- **🌙 Modo Oscuro/Claro**: Adaptable a tu preferencia y hora del día.
- **🧠 Búsqueda Inteligente (AI)**: Encuentra "cosas para limpiar" y te mostrará el detergente, gracias a la IA local (sin enviar datos a la nube).
- **📸 Gestión de Fotos**: Sube fotos de tus productos (comprimidas automáticamente para ahorrar datos).
- **🚦 Semáforo de Stock**: Indicadores visuales de stock bajo y productos vencidos.
- **🔒 Privacidad Total**: Marca items como "Privados" para que solo tú los veas.
- **⚡ Rendimiento Extremo**: Carga instantánea, scroll infinito y animaciones fluidas.

## 🛠️ Tecnologías

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router + Turbopack/Webpack)
- **Base de Datos**: [Supabase](https://supabase.com/) (PostgreSQL + pgvector)
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/) + Shadcn UI
- **IA Local**: [Transformers.js](https://huggingface.co/docs/transformers.js) (Embeddings en el navegador)
- **Estado**: Zustand
- **Animaciones**: Framer Motion

## 🚀 Comenzar

### Requisitos Previos

- Node.js 20+
- Cuenta en Supabase

### Instalación

1.  **Clonar el repositorio**:

    ```bash
    git clone https://github.com/tu-usuario/mi-casa-inventory.git
    cd mi-casa-inventory
    ```

2.  **Instalar dependencias**:

    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**:
    Crea un archivo `.env.local` y añade tus claves de Supabase:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
    ```

4.  **Configurar Base de Datos**:
    Ejecuta los scripts SQL de la carpeta `/sql` en el editor SQL de Supabase para crear las tablas y políticas de seguridad.

5.  **Correr en Desarrollo**:
    ```bash
    npm run dev
    ```

## 📖 Documentación

- [Manual de Usuario](./MANUAL.md): Guía paso a paso para usar la app.
- [Lista de Funcionalidades](./FEATURES.md): Detalle técnico de todas las características.

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor lee nuestras guías de contribución antes de empezar.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.
