# Zima Peru - Property Showcase

Plataforma inmobiliaria para el mercado peruano desarrollada con React + Supabase.

## Tecnologías

- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (base de datos, autenticación, almacenamiento)
- Vercel (deploy)

## Levantar el proyecto localmente

**Requisitos:** Node.js instalado — [descargar aquí](https://nodejs.org)

```sh
# 1. Instalar dependencias
npm install

# 2. Crear el archivo de variables de entorno
cp .env.example .env

# 3. Completar el .env con las credenciales de Supabase
#    (ver sección de Variables de entorno abajo)

# 4. Iniciar el servidor de desarrollo
npm run dev
```

Abrir el navegador en `http://localhost:8080`

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto con estos valores:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu-anon-key
```

Estos datos se encuentran en el panel de Supabase:
**Project Settings → API → Project URL y anon public key**

## Deploy en Vercel

1. Subir el repositorio a GitHub
2. Entrar a [vercel.com](https://vercel.com) y conectar el repositorio
3. En la configuración del proyecto agregar las variables de entorno del `.env`
4. Vercel despliega automáticamente con cada push a `main`

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build para producción |
| `npm run preview` | Preview del build |
| `npm run lint` | Ejecutar ESLint |
