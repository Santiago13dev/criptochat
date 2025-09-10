# 🔐 CriptoChat - Plataforma de Mensajería Segura

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Socket.io](https://img.shields.io/badge/Socket.io-4.0-010101?style=for-the-badge&logo=socket.io)
![Estado](https://img.shields.io/badge/Estado-En%20Desarrollo-yellow?style=for-the-badge)
![Licencia](https://img.shields.io/badge/Licencia-MIT-green?style=for-the-badge)

## 📱 Descripción

**CriptoChat** es una plataforma de mensajería segura que implementa encriptación de extremo a extremo (E2E) con arquitectura Zero-Knowledge. Esto significa que ni siquiera los servidores pueden acceder al contenido de tus mensajes. La aplicación utiliza intercambio de claves mediante códigos QR y encriptación AES-256 para garantizar la máxima privacidad.



### 🎯 ¿Por qué CriptoChat?

En un mundo donde la privacidad digital es cada vez más importante, CriptoChat ofrece una solución de mensajería donde **tú tienes el control total** de tus datos. Sin backdoors, sin acceso de terceros, sin compromisos.

## ✨ Características Principales

### 🔒 Seguridad
- **🔐 Encriptación E2E** - Todos los mensajes se encriptan en tu dispositivo antes de enviarse
- **🔑 Arquitectura Zero-Knowledge** - El servidor nunca tiene acceso a tus mensajes descifrados
- **📱 Intercambio de Claves QR** - Conexión segura sin intermediarios
- **🔥 Mensajes Autodestructivos** - Opción para que los mensajes desaparezcan después de ser leídos
- **🛡️ Sin Metadatos** - Mínima recolección de información

### 💬 Funcionalidades
- **⚡ Mensajería en Tiempo Real** - Comunicación instantánea con WebSockets
- **👥 Gestión de Contactos** - Agrega y administra contactos de forma segura
- **🎨 Interfaz Moderna** - Diseño glassmorphism con modo oscuro
- **📱 Diseño Responsive** - Funciona perfectamente en móvil y desktop
- **💾 Almacenamiento Local** - Tus mensajes nunca salen de tu dispositivo sin encriptar
- **🌐 PWA** - Instalable como aplicación nativa

## 🚀 Stack Tecnológico

### Frontend
- **Framework:** Next.js 14 con App Router
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS + Diseño Glassmorphism
- **Estado:** React Hooks + LocalStorage
- **Componentes:** Componentes propios con diseño modular

### Backend
- **Servidor:** Node.js + Express
- **Tiempo Real:** Socket.io para WebSockets
- **Encriptación:** Crypto nativo (migración a @noble/secp256k1 en proceso)

### DevOps y Herramientas
- **Contenedores:** Docker + Docker Compose
- **CI/CD:** GitHub Actions (próximamente)
- **Testing:** Jest + React Testing Library (próximamente)
- **Linting:** ESLint + Prettier

## 📦 Instalación

### Requisitos Previos
- Node.js 18 o superior
- npm o yarn
- Git
- Terminal (PowerShell, CMD, o Bash)

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/Santiago13dev/criptochat.git
cd criptochat
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno** (opcional)
```bash
# Crear archivo .env.local
cp .env.example .env.local
```

4. **Ejecutar en modo desarrollo**
```bash
# Solo frontend
npm run dev

# Frontend + Backend (recomendado)
npm run dev:all
```

5. **Abrir en el navegador**
```
http://localhost:3000
```

## 🎮 Cómo Usar CriptoChat

### Inicio Rápido

1. **Iniciar la aplicación**
   - Haz clic en "Iniciar CriptoChat"
   - Se generará automáticamente tu identificador único

2. **Obtener tu código QR**
   - Clic en "Ver mi código QR"
   - Comparte este código con tus contactos
   - El código contiene tu clave pública para establecer conexión segura

3. **Agregar contactos**
   - Clic en "Agregar contacto"
   - Ingresa el código QR del contacto
   - La conexión se establece de forma segura sin intermediarios

4. **Enviar mensajes**
   - Selecciona un contacto de la lista
   - Escribe tu mensaje
   - Presiona Enter o clic en "Enviar"
   - El mensaje se encripta automáticamente antes de enviarse

### Características Avanzadas

- **Mensajes Autodestructivos:** Activa la opción antes de enviar
- **Copiar Código QR:** Comparte tu código por otros medios
- **Verificación de Encriptación:** Todos los mensajes muestran el icono 🔒

## 🏗️ Estructura del Proyecto

```
criptochat/
├── 📁 app/                    # Directorio principal de Next.js
│   ├── page.tsx              # Página principal
│   ├── layout.tsx            # Layout raíz
│   └── globals.css           # Estilos globales
├── 📁 components/            # Componentes React reutilizables
│   ├── chat/                # Componentes del chat
│   ├── ui/                  # Componentes de UI
│   └── modals/              # Componentes de modales
├── 📁 lib/                   # Utilidades y helpers
│   ├── crypto/              # Funciones de encriptación
│   └── utils/               # Utilidades generales
├── 📁 server/               # Servidor backend
│   └── index.js            # Servidor Socket.io
├── 📁 public/              # Archivos estáticos
├── 📁 hooks/               # Custom React hooks
└── 📄 package.json         # Dependencias y scripts
```

## 🛠️ Scripts Disponibles

```bash
npm run dev        # Inicia Next.js en modo desarrollo
npm run build      # Compila para producción
npm run start      # Inicia servidor de producción
npm run lint       # Ejecuta el linter
npm run server     # Inicia servidor Socket.io
npm run dev:all    # Inicia todo (frontend + backend)
```

## 🔧 Configuración Avanzada

### Docker

```bash
# Construir imagen
docker build -t criptochat .

# Ejecutar contenedor
docker-compose up
```

### Variables de Entorno

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENCRYPTION_KEY=tu-clave-secreta
```

## 🚧 Roadmap

### ✅ Completado
- [x] Interfaz de mensajería básica
- [x] Generación de códigos QR
- [x] Sistema de contactos
- [x] Almacenamiento local de mensajes
- [x] Diseño responsive
- [x] Arquitectura modular

### 🔄 En Desarrollo
- [ ] Encriptación E2E real con @noble/secp256k1
- [ ] Sistema de notificaciones push
- [ ] Sincronización entre dispositivos
- [ ] Modo offline completo

### 📋 Próximamente
- [ ] Videollamadas con WebRTC
- [ ] Compartir archivos encriptados
- [ ] Chats grupales
- [ ] Reacciones a mensajes
- [ ] Mensajes de voz
- [ ] Aplicación de escritorio con Electron
- [ ] Aplicación móvil con React Native
- [ ] Integración con blockchain para verificación
- [ ] Backup encriptado en la nube

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si quieres contribuir:

1. **Fork** el proyecto
2. Crea tu rama de características (`git checkout -b feature/NuevaCaracteristica`)
3. Haz commit de tus cambios (`git commit -m 'Añade nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un **Pull Request**

### Guías de Contribución

- Sigue el estilo de código existente
- Añade tests para nuevas funcionalidades
- Actualiza la documentación según sea necesario
- Asegúrate de que todos los tests pasen

## 🐛 Reportar Bugs

Si encuentras un bug, por favor abre un [issue](https://github.com/Santiago13dev/criptochat/issues) con:
- Descripción clara del problema
- Pasos para reproducirlo
- Comportamiento esperado
- Screenshots (si aplica)
- Información del navegador y sistema operativo

## 📈 Métricas del Proyecto

![Líneas de Código](https://img.shields.io/tokei/lines/github/Santiago13dev/criptochat?style=flat-square)
![Último Commit](https://img.shields.io/github/last-commit/Santiago13dev/criptochat?style=flat-square)
![Tamaño del Repo](https://img.shields.io/github/repo-size/Santiago13dev/criptochat?style=flat-square)

## 🔐 Seguridad

### Divulgación Responsable

Si descubres una vulnerabilidad de seguridad, por favor envía un email a kevin.rodriguezgomez1308@gmail.com en lugar de usar el issue tracker público.

### Auditorías

- [ ] Auditoría de código pendiente
- [ ] Pruebas de penetración pendientes
- [ ] Certificación de seguridad en proceso

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Santiago Rodriguez**

- 🌐 Portfolio: [github.com/Santiago13dev](https://github.com/Santiago13dev)
- 💼 LinkedIn: [linkedin.com/in/tu-perfil](https://linkedin.com/in/tu-perfil)
- 🐙 GitHub: [@Santiago13dev](https://github.com/Santiago13dev)
- 📧 Email: kevin.rodriguezgomez1308@gmail.com

## 🙏 Agradecimientos

- Al equipo de **Next.js** por el increíble framework
- A **Vercel** por el hosting gratuito
- A **Tailwind CSS** por hacer el CSS divertido otra vez
- A la comunidad **open source** por la inspiración
- A todos los que han probado y dado feedback

## 📊 Estadísticas

<p align="center">
  <img src="https://github-readme-stats.vercel.app/api/pin/?username=Santiago13dev&repo=criptochat&theme=dark" />
</p>

---

<p align="center">
  <b>⭐ Si te gusta el proyecto, no olvides darle una estrella ⭐</b>
</p>

<p align="center">
  Hecho con ❤️ y mucho ☕ por desarrolladores que valoran la privacidad
</p>

<p align="center">
  <a href="https://criptochat.app">🌐 Demo en Vivo</a> •
  <a href="https://docs.criptochat.app">📚 Documentación</a> •
  <a href="https://blog.criptochat.app">📝 Blog</a>
</p>