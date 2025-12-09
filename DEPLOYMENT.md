# 🚀 Guía de Despliegue (Vercel)

Sigue estos pasos para publicar tu aplicación en internet y conectar el Login correctamente.

## Parte 1: Publicar en Vercel

1.  Crea una cuenta en [Vercel.com](https://vercel.com/) e inicia sesión con GitHub.
2.  En el Dashboard de Vercel, pulsa **"Add New..."** > **"Project"**.
3.  Selecciona tu repositorio: `inventarioCasa` y pulsa **"Import"**.
4.  **Configuración del Proyecto**:
    - **Framework Preset**: Debería detectar "Next.js" automáticamente.
    - **Root Directory**: `./` (Déjalo como está).
    - **Environment Variables** (¡IMPORTANTE!):
      Despliega esta sección y añade las variables de tu archivo `.env.local`:
      - `NEXT_PUBLIC_SUPABASE_URL`: (Copia el valor de tu Supabase)
      - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Copia el valor de tu Supabase)
5.  Pulsa **"Deploy"**.

⏳ Espera a que termine. Cuando veas los confetis 🎉, haz clic en la imagen para ir a tu nueva web (tendrá una URL tipo `inventario-casa.vercel.app`). Copia esa URL.

---

## Parte 2: Conectar el Login (Supabase)

Una vez publicada, el Login fallará si no le avisas a Supabase cuál es tu nueva URL.

1.  Ve a tu proyecto en [Supabase.com](https://supabase.com/).
2.  En el menú lateral, ve a **Authentication** > **URL Configuration**.
3.  **Site URL**:
    - Borra `http://localhost:3000` y pon tu nueva URL de Vercel (ej. `https://inventario-casa.vercel.app`).
    - **¡OJO!**: No pongas barra `/` al final.
4.  **Redirect URLs**:
    - Añade `https://inventario-casa.vercel.app/**` (con los asteriscos al final para asegurar que funcione cualquier subruta).
5.  Dale a **"Save"**.

---

## Parte 3: Verificación

1.  Abre tu nueva web en una ventana de incógnito.
2.  Intenta iniciar sesión.
3.  Si entras al Dashboard sin errores, ¡Felicidades! 🚀
