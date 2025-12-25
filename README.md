# 🎨 Creative Hands

<div align="center">
    
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

</div>

## 📋 Descripción

Portal de **productos artesanales** con sistema completo de autenticación, roles de usuario, gestión de productos y **chat en tiempo real**. La aplicación permite a usuarios navegar y comprar productos mientras mantienen comunicación directa con el administrador mediante un sistema de mensajería instantánea.

---

## 🚀 Instalación y Ejecución

```bash
# Clonar e instalar dependencias
git clone https://github.com/lostal/creative-hands.git
cd creative-hands
pnpm install

# Configurar variables de entorno (ver .env.example)
cp .env.example .env

# Desarrollo (cliente + servidor)
pnpm run dev

# Producción
pnpm run build
pnpm start
```

> Las variables de entorno necesarias están documentadas en `.env.example`

---

## Arquitectura del Sistema

```mermaid
flowchart TB
    subgraph Cliente["🖥️ Cliente (React + Vite)"]
        UI[Interfaz de Usuario]
        Auth[AuthContext]
        Cart[CartContext]
        Socket[SocketContext]
        Theme[ThemeContext]
        Toast[ToastContext]
    end

    subgraph Servidor["⚙️ Servidor (Express + Node.js)"]
        API[API REST]
        SocketIO[Socket.IO Server]
        MW[Middleware JWT]

        subgraph Rutas
            AuthR["/api/auth"]
            ProdR["/api/products"]
            CatR["/api/categories"]
            ChatR["/api/chat"]
            OrdR["/api/orders"]
        end
    end

    subgraph BD["🗄️ MongoDB"]
        Users[(Users)]
        Products[(Products)]
        Messages[(Messages)]
        Orders[(Orders)]
        Categories[(Categories)]
    end

    subgraph Externos["☁️ Servicios Externos"]
        Cloud[Cloudinary]
    end

    UI --> Auth
    UI --> Cart
    UI --> Socket
    UI --> Theme
    UI --> Toast

    Auth -->|HTTP + Cookie| API
    Cart -->|HTTP| API
    Socket -->|WebSocket| SocketIO

    API --> MW
    MW --> Rutas

    AuthR --> Users
    ProdR --> Products
    ProdR --> Cloud
    ChatR --> Messages
    OrdR --> Orders
    CatR --> Categories

    SocketIO -->|Tiempo Real| Messages
```

---

## ✨ Funcionalidades Principales

### 👤 Para Usuarios

- **Catálogo de productos** con filtros por categoría y búsqueda
- **Carrito de compra** persistente con gestión de cantidades
- **Sistema de pedidos** con seguimiento de estado
- **Reseñas y valoraciones** en productos
- **Chat directo** con el administrador en tiempo real
- **Perfil personal** con historial de pedidos

### 🔧 Para Administradores

- **CRUD completo de productos** con subida de imágenes a Cloudinary
- **Gestión de categorías** para organizar el catálogo
- **Panel de pedidos** con actualización de estados
- **Chat centralizado** para atender a todos los usuarios
- **Visión de usuarios online** en tiempo real

---

## 💡 Decisiones de Desarrollo

| Decisión | Justificación |
|----------|---------------|
| **TypeScript** | Tipado estático para prevenir errores y mejorar mantenibilidad |
| **React + Vite** | Desarrollo más rápido con HMR y mejor experiencia DX vs Vanilla JS |
| **Cookies httpOnly** | Más seguro que localStorage para almacenar JWT (previene XSS) |
| **pnpm workspaces** | Monorepo eficiente con dependencias compartidas |
| **Express 5** | Soporte nativo de async/await en middlewares |
| **PWA** | Instalable como app nativa, funciona offline |

---

## 🔐 Sistema de Autenticación

### Flujo JWT con Cookies Seguras

1. **Registro/Login** → El servidor genera un JWT y lo almacena en cookie httpOnly
2. **Peticiones** → La cookie se envía automáticamente (más seguro que headers)
3. **Validación** → Middleware verifica el token de la cookie en cada ruta protegida
4. **Socket.IO** → Token también autentica conexiones WebSocket

### Roles y Permisos

| Funcionalidad           | Usuario | Administrador |
| ----------------------- | :-----: | :-----------: |
| Ver productos           |   ✅    |      ✅       |
| Comprar productos       |   ✅    |      ❌       |
| Chat                    |   ✅    |      ✅       |
| Gestionar productos     |   ❌    |      ✅       |
| Ver todos los pedidos   |   ❌    |      ✅       |
| Panel de administración |   ❌    |      ✅       |

### Seguridad

- **Cookies httpOnly** para almacenamiento de JWT (previene XSS)
- Contraseñas hasheadas con **bcrypt**
- **Bloqueo de cuenta** tras 5 intentos fallidos (15 min lockout)
- **Rate limiting** en endpoints de autenticación
- Validación de inputs con **Joi**
- **Helmet** para headers de seguridad (CSP, etc.)
- CORS configurado por entorno

---

## 💬 Chat en Tiempo Real

El sistema de chat implementa comunicación bidireccional usando **Socket.IO**:

- **Mensajería instantánea** entre usuarios y administrador
- **Indicador de escritura** ("usuario escribiendo...")
- **Estado de conexión** (online/offline)
- **Persistencia de mensajes** en MongoDB
- **Notificaciones** de nuevos mensajes
- **Soporte multi-pestaña** por usuario

### Eventos Socket.IO

| Evento              | Dirección           | Descripción                |
| ------------------- | ------------------- | -------------------------- |
| `message:send`      | Cliente → Servidor  | Enviar nuevo mensaje       |
| `message:new`       | Servidor → Cliente  | Notificar mensaje recibido |
| `typing:start/stop` | Bidireccional       | Indicador de escritura     |
| `user:status`       | Servidor → Clientes | Cambio de estado online    |
| `messages:read`     | Bidireccional       | Marcar como leído          |

---

## 📡 API REST

### Autenticación (`/api/auth`)

| Método | Endpoint    | Descripción       | Acceso  |
| ------ | ----------- | ----------------- | ------- |
| POST   | `/register` | Registrar usuario | Público |
| POST   | `/login`    | Iniciar sesión    | Público |
| GET    | `/me`       | Obtener perfil    | Privado |
| PATCH  | `/me`       | Actualizar perfil | Privado |
| POST   | `/logout`   | Cerrar sesión     | Privado |

### Productos (`/api/products`)

| Método | Endpoint            | Descripción             | Acceso  |
| ------ | ------------------- | ----------------------- | ------- |
| GET    | `/`                 | Listar productos        | Público |
| GET    | `/:id`              | Obtener producto        | Público |
| GET    | `/category/:slug`   | Productos por categoría | Público |
| POST   | `/`                 | Crear producto          | Admin   |
| PUT    | `/:id`              | Actualizar producto     | Admin   |
| DELETE | `/:id`              | Eliminar producto       | Admin   |
| DELETE | `/:id/images`       | Eliminar imagen         | Admin   |
| POST   | `/:id/reviews`      | Añadir reseña           | Privado |
| PUT    | `/:id/reviews/:rid` | Editar reseña           | Privado |
| DELETE | `/:id/reviews/:rid` | Eliminar reseña         | Privado |

### Pedidos (`/api/orders`)

| Método | Endpoint       | Descripción       | Acceso  |
| ------ | -------------- | ----------------- | ------- |
| POST   | `/`            | Crear pedido      | Usuario |
| GET    | `/myorders`    | Mis pedidos       | Usuario |
| GET    | `/:id`         | Obtener pedido    | Privado |
| GET    | `/`            | Todos los pedidos | Admin   |
| PUT    | `/:id/deliver` | Marcar entregado  | Admin   |

### Categorías (`/api/categories`)

| Método | Endpoint | Descripción          | Acceso  |
| ------ | -------- | -------------------- | ------- |
| GET    | `/`      | Listar categorías    | Público |
| POST   | `/`      | Crear categoría      | Admin   |
| PUT    | `/:id`   | Actualizar categoría | Admin   |
| DELETE | `/:id`   | Eliminar categoría   | Admin   |

### Chat (`/api/chat`)

| Método | Endpoint                    | Descripción            | Acceso  |
| ------ | --------------------------- | ---------------------- | ------- |
| GET    | `/admin`                    | Obtener info del admin | Privado |
| GET    | `/messages/:conversationId` | Obtener mensajes       | Privado |
| GET    | `/conversations`            | Listar conversaciones  | Privado |

---

<div align="center">

**Álvaro Lostal**

[![Portafolio](https://img.shields.io/badge/Portafolio-lostal.dev-d5bd37?style=for-the-badge&logo=astro&logoColor=white)](https://lostal.dev)
[![GitHub](https://img.shields.io/badge/GitHub-lostal-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/lostal)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Álvaro%20Lostal-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/alvarolostal)

</div>

---

<div align="center">

⭐ **¿Te gusta este proyecto?** ¡Dale una estrella para apoyar mi trabajo!

</div>
