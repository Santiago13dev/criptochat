# 🔐 CriptoChat - Secure Messaging Platform

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Socket.io](https://img.shields.io/badge/Socket.io-4.0-010101?style=for-the-badge&logo=socket.io)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## 📱 Overview

CriptoChat es una plataforma de mensajería segura con encriptación de extremo a extremo (E2E) y arquitectura Zero-Knowledge. Los mensajes están protegidos con encriptación AES-256 y el intercambio de claves se realiza mediante códigos QR.

## ✨ Features

- 🔐 **Encriptación E2E** - Mensajes encriptados de extremo a extremo
- 🔑 **Zero-Knowledge** - Ni siquiera el servidor puede leer tus mensajes
- 📱 **QR Code Exchange** - Intercambio seguro de claves mediante QR
- 💬 **Real-time Messaging** - Mensajería en tiempo real con Socket.io
- 🔥 **Self-Destructing Messages** - Mensajes que se autodestruyen
- 🎨 **Modern UI** - Interfaz moderna con Tailwind CSS y glassmorphism
- 📱 **Responsive** - Funciona en desktop y móvil
- 🌐 **PWA Ready** - Instalable como aplicación

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** React Hooks + LocalStorage
- **UI Components:** Custom components with glassmorphism

### Backend
- **Server:** Node.js + Express
- **Real-time:** Socket.io
- **Encryption:** Crypto (próximamente @noble/secp256k1)

### DevOps
- **Container:** Docker
- **Package Manager:** npm
- **Version Control:** Git

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Setup

1. **Clone the repository**
\`\`\`bash
git clone https://github.com/TU_USUARIO/criptochat.git
cd criptochat
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Run development server**
\`\`\`bash
# Frontend only
npm run dev

# Frontend + Backend
npm run dev:all
\`\`\`

4. **Open in browser**
\`\`\`
http://localhost:3000
\`\`\`

## 🎮 Usage

1. **Start the app** - Click "Iniciar CriptoChat"
2. **Get your QR Code** - Click "Ver mi código QR" and share it
3. **Add contacts** - Click "Agregar contacto" and enter their QR code
4. **Start chatting** - Select a contact and send encrypted messages

## 🔒 Security Features

- **End-to-End Encryption**: All messages are encrypted on the client side
- **Zero-Knowledge Architecture**: Server never has access to decrypted messages
- **QR Code Key Exchange**: Secure key exchange without server involvement
- **Local Storage Encryption**: Local data is encrypted
- **No Metadata Collection**: Minimal metadata retention

## 🛠️ Development

### Project Structure
\`\`\`
criptochat/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Main page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
├── lib/                   # Utilities and helpers
├── server/               # Backend server
│   └── index.js         # Socket.io server
├── public/              # Static assets
└── package.json         # Dependencies
\`\`\`

### Available Scripts

\`\`\`bash
npm run dev        # Start Next.js development
npm run build      # Build for production
npm run start      # Start production server
npm run server     # Start Socket.io server
npm run dev:all    # Start everything
\`\`\`

## 🚧 Roadmap

- [x] Basic messaging interface
- [x] QR code generation
- [x] Contact management
- [x] Local message storage
- [ ] Real E2E encryption with @noble/secp256k1
- [ ] WebRTC video calls
- [ ] File sharing
- [ ] Group chats
- [ ] Message reactions
- [ ] Voice messages
- [ ] Desktop app with Electron
- [ ] Mobile app with React Native

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Tu Nombre**
- GitHub: [@TU_USUARIO](https://github.com/TU_USUARIO)
- LinkedIn: [Tu LinkedIn](https://linkedin.com/in/TU_LINKEDIN)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Socket.io for real-time communication
- The open-source community

---

<p align="center">Made with ❤️ and ☕</p>