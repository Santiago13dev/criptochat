# CriptoChat - Mensajería Segura

Una plataforma de mensajería con encriptación de extremo a extremo y arquitectura Zero-Knowledge. Ni siquiera los servidores pueden acceder al contenido de tus mensajes.

## Características

- **Encriptación E2E** - Todos los mensajes se encriptan en tu dispositivo
- **Zero-Knowledge** - El servidor nunca ve tus mensajes descifrados  
- **Códigos QR** - Intercambio seguro de claves sin intermediarios
- **Tiempo real** - Mensajería instantánea con WebSockets
- **Sin metadatos** - Mínima recolección de información

## Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, Socket.io
- **Encriptación:** @noble/secp256k1, AES-256

## Instalación

```bash
git clone https://github.com/Santiago13dev/criptochat.git
cd criptochat
npm install
npm run dev:all
```

Abre http://localhost:3000

## Cómo usar

1. Haz clic en "Iniciar CriptoChat"
2. Comparte tu código QR con tus contactos
3. Agrega contactos con sus códigos QR
4. Envía mensajes encriptados

## Scripts

```bash
npm run dev        # Solo frontend
npm run dev:all    # Frontend + backend
npm run build      # Compilar para producción
npm run server     # Solo servidor backend
```

## Estructura

```
criptochat/
├── app/           # Páginas de Next.js
├── components/    # Componentes React
├── lib/           # Utilidades y crypto
├── server/        # Servidor Socket.io
└── hooks/         # React hooks
```

## Próximas mejoras

- [ ] Encriptación real con @noble/secp256k1
- [ ] Notificaciones push
- [ ] Videollamadas WebRTC
- [ ] Chats grupales
- [ ] App móvil

## Contribuir

1. Fork el proyecto
2. Crea tu rama (`git checkout -b mi-mejora`)
3. Commit tus cambios (`git commit -m 'agrega nueva función'`)
4. Push (`git push origin mi-mejora`)
5. Abre un Pull Request

## Licencia

MIT - ver [LICENSE](LICENSE)

## Autor

**Santiago Rodriguez**
- GitHub: [@Santiago13dev](https://github.com/Santiago13dev)
- Email: kevin.rodriguezgomez1308@gmail.com
