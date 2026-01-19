<div align="center">

# 🎨 Creative Hands

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Express_5-339933?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

**Portal de productos artesanales con e-commerce, autenticación segura y chat en tiempo real**

[🌐 Ver Demo](https://creative-hands-cjzg.onrender.com)

</div>

---

## 🎯 El Reto

Los artesanos y creadores manuales necesitan una plataforma moderna para vender sus productos directamente a clientes, manteniendo una comunicación personalizada que refleje la naturaleza artesanal de su trabajo.

Las soluciones genéricas de e-commerce no ofrecen la cercanía necesaria para productos hechos a mano, donde la comunicación con el creador es parte fundamental de la experiencia de compra.

> 💡 El 78% de compradores de productos artesanales valora poder comunicarse directamente con el artesano antes de comprar.

## ✨ La Solución

| ❌ Sin Creative Hands                         | ✅ Con Creative Hands                            |
| --------------------------------------------- | ------------------------------------------------ |
| Plataformas genéricas sin personalización     | Portal dedicado con identidad de marca artesanal |
| Comunicación por email lenta                  | Chat en tiempo real con indicadores de escritura |
| Login con tokens en localStorage (vulnerable) | JWT en httpOnly cookies (previene XSS)           |
| Sin soporte offline                           | PWA instalable con funcionamiento offline        |
| Gestión manual de pedidos                     | Panel admin con estados y notificaciones         |
| Imágenes pesadas y lentas                     | Optimización automática via Cloudinary           |

**Resultado:** Plataforma e-commerce completa lista para producción con chat integrado y panel de administración.

---

## 🏗️ Tecnologías Utilizadas

<div align="center">

### 🖥️ Frontend

![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite_6-646CFF?style=flat-square&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white)

### ⚙️ Backend

![Express](https://img.shields.io/badge/Express_5-000000?style=flat-square&logo=express&logoColor=white)
![Apollo](https://img.shields.io/badge/Apollo_GraphQL-311C87?style=flat-square&logo=apollographql&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=flat-square&logo=socketdotio&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)

### 🔧 DevOps & Herramientas

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=flat-square&logo=jest&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm_Workspaces-F69220?style=flat-square&logo=pnpm&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=flat-square&logo=cloudinary&logoColor=white)

</div>

**Decisiones Clave:**

| Elegí esto...    | En lugar de esto...   | ¿Por qué?                                                     |
| ---------------- | --------------------- | ------------------------------------------------------------- |
| httpOnly Cookies | localStorage para JWT | Previene ataques XSS, el token no es accesible por JavaScript |
| Express 5        | Express 4             | Soporte nativo de async/await en middlewares, sin wrappers    |
| pnpm workspaces  | npm/yarn monorepo     | Instalación más rápida, menos espacio en disco                |
| Tailwind v4      | CSS-in-JS             | Tokens CSS nativos, mejor performance, dark mode nativo       |

---

## ⚡ Features Principales

<table>
<tr>
<td width="50%">

### 👤 Para Usuarios

- ✅ Catálogo con filtros y búsqueda
- ✅ Carrito persistente en localStorage
- ✅ Sistema de reseñas y valoraciones
- ✅ Chat directo con el artesano
- ✅ Historial de pedidos
- ✅ PWA instalable

</td>
<td width="50%">

### 🔧 Para Administradores

- ✅ CRUD completo de productos
- ✅ Gestión de categorías
- ✅ Panel de pedidos en tiempo real
- ✅ Chat centralizado multiusuario
- ✅ Gestión de usuarios y roles
- ✅ Subida de imágenes a Cloudinary

</td>
</tr>
<tr>
<td>

### 🔐 Seguridad

- ✅ JWT en httpOnly cookies
- ✅ Contraseñas con bcrypt (salt 10)
- ✅ Bloqueo tras 5 intentos fallidos
- ✅ Rate limiting por IP
- ✅ Headers seguros con Helmet
- ✅ Validación con Joi

</td>
<td>

### 💬 Chat en Tiempo Real

- ✅ Mensajería instantánea Socket.IO
- ✅ Indicador "escribiendo..."
- ✅ Estado online/offline
- ✅ Notificaciones de nuevos mensajes
- ✅ Soporte multi-pestaña
- ✅ Persistencia en MongoDB

</td>
</tr>
</table>

---

## 🧩 Retos Técnicos Superados

### 🔥 Challenge #1: Autenticación Segura sin localStorage

**El problema:**
Almacenar JWT en localStorage expone el token a ataques XSS. Cualquier script malicioso puede robarlo.

**La solución:**

- Configuré cookies httpOnly que el navegador envía automáticamente
- Implementé interceptor axios que detecta 401 y redirige sin recargar
- Creé endpoint `/auth/me` para verificar sesión al cargar la app
- Añadí protección brute-force: bloqueo 15 min tras 5 intentos

**Tech stack:** JWT • bcrypt • Express middleware • Axios interceptors

---

### ⚡ Challenge #2: Chat Realtime Escalable

**El problema:**
Implementar chat en tiempo real con soporte multi-pestaña, typing indicators, y rate limiting para prevenir spam.

**La solución:**

- Diseñé arquitectura Socket.IO con eventos tipados en TypeScript
- Implementé `Map<userId, Set<socketId>>` para múltiples pestañas por usuario
- Añadí rate limiting: máximo 30 mensajes/minuto con cleanup periódico
- Creé sanitización HTML para prevenir XSS en mensajes

**Tech stack:** Socket.IO • TypeScript types • Joi validation • Custom rate limiter

---

### 🎯 Challenge #3: PWA con Caching Inteligente

**El problema:**
Configurar Service Worker que cachee recursos estáticos sin interferir con actualizaciones de API en desarrollo.

**La solución:**

- Desactivé SW completamente en desarrollo (`enabled: false`)
- Configuré estrategia CacheFirst para fonts (365 días) e imágenes Cloudinary (30 días)
- Usé NetworkFirst para API con fallback de 5 minutos
- Excluí HTML del precache para evitar problemas con CSP headers

**Tech stack:** Vite PWA • Workbox • Runtime caching strategies

---

**Componentes Principales:**

| Componente    | Responsabilidad     | Tecnologías                    |
| ------------- | ------------------- | ------------------------------ |
| Frontend SPA  | UI, estado, routing | React 19, Vite, React Router 7 |
| API REST      | CRUD, autenticación | Express 5, Joi, Multer         |
| GraphQL       | Consultas flexibles | Apollo Server, depth-limit     |
| WebSockets    | Chat en tiempo real | Socket.IO, eventos tipados     |
| Base de datos | Persistencia        | MongoDB, Mongoose 9            |

---

<div align="center">

## 👨‍💻 Desarrollado por Álvaro Lostal

**Ingeniero Informático • Web Developer**

[![Portfolio](https://img.shields.io/badge/Portfolio-lostal.dev-d5bd37?style=for-the-badge&logo=astro&logoColor=white)](https://lostal.dev)
[![GitHub](https://img.shields.io/badge/GitHub-lostal-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/lostal)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Álvaro%20Lostal-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/alvarolostal)

</div>

---

<div align="center">

### ⭐ Si este proyecto te resulta interesante, considera darle una estrella

</div>
