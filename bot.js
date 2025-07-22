const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const http = require('http');

// Servidor HTTP para Railway (OBLIGATORIO)
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(`
        <h1>🤖 WhatsApp Bot Activo</h1>
        <p>Estado: ${client ? 'Conectado' : 'Iniciando...'}</p>
        <p>Hora: ${new Date().toLocaleString()}</p>
    `);
});

server.listen(PORT, () => {
    console.log(`✅ Servidor HTTP corriendo en puerto ${PORT}`);
});

// Cliente WhatsApp con configuración especial para Railway
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "railway-bot",
        dataPath: "./wwebjs_auth"
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-extensions',
            '--disable-plugins',
            '--disable-images',
            '--disable-javascript',
            '--virtual-time-budget=5000'
        ]
    }
});

console.log('🚀 Iniciando WhatsApp Bot...');

// Respuestas del bot
const respuestas = {
    'hola': '¡Hola! 👋 Soy tu asistente virtual. ¿En qué puedo ayudarte?',
    'horarios': 'Nuestros horarios de atención son:\n📅 Lunes a Viernes: 9:00 AM - 6:00 PM\n📅 Sábados: 9:00 AM - 2:00 PM\n📅 Domingos: Cerrado',
    'servicios': 'Ofrecemos los siguientes servicios:\n• Consultoría\n• Soporte técnico\n• Desarrollo de software\n• Capacitaciones',
    'contacto': 'Puedes contactarnos por:\n📧 Email: info@empresa.com\n📞 Teléfono: +1234567890\n🌐 Web: www.empresa.com',
    'precio': 'Para información sobre precios, por favor contacta a nuestro equipo comercial. Escribe "contacto" para obtener los datos.',
    'ayuda': 'Comandos disponibles:\n• hola - Saludo\n• horarios - Ver horarios\n• servicios - Nuestros servicios\n• contacto - Información de contacto\n• precio - Consultar precios\n• ayuda - Ver esta ayuda',
};

// Función para procesar mensajes
function procesarMensaje(mensaje) {
    const texto = mensaje.toLowerCase().trim();
    
    if (respuestas[texto]) {
        return respuestas[texto];
    }
    
    for (let palabra in respuestas) {
        if (texto.includes(palabra)) {
            return respuestas[palabra];
        }
    }
    
    return 'No entiendo tu mensaje. Escribe "ayuda" para ver los comandos disponibles.';
}

// Eventos del cliente
client.on('qr', (qr) => {
    console.log('📱 ESCANEA ESTE CÓDIGO QR CON TU WHATSAPP:');
    console.log('----------------------------------------');
    qrcode.generate(qr, { small: true });
    console.log('----------------------------------------');
    console.log('1. Abre WhatsApp en tu teléfono');
    console.log('2. Ve a Configuración > Dispositivos vinculados');
    console.log('3. Toca "Vincular un dispositivo"');
    console.log('4. Escanea el código QR de arriba');
});

client.on('ready', () => {
    console.log('✅ ¡Bot de WhatsApp está listo y funcionando!');
});

client.on('message', async (message) => {
    try {
        if (message.type !== 'chat' || message.fromMe) {
            return;
        }

        const chat = await message.getChat();
        if (chat.isGroup) {
            return; // No responder en grupos
        }

        console.log(`📨 Mensaje de ${message.from}: ${message.body}`);
        
        const respuesta = procesarMensaje(message.body);
        
        await message.reply(respuesta);
        console.log(`📤 Respuesta enviada: ${respuesta.substring(0, 50)}...`);
        
    } catch (error) {
        console.error('❌ Error procesando mensaje:', error);
    }
});

client.on('auth_failure', (msg) => {
    console.error('❌ Error de autenticación:', msg);
});

client.on('disconnected', (reason) => {
    console.log('⚠️ Cliente desconectado:', reason);
});

// Manejar errores
process.on('unhandledRejection', (err) => {
    console.error('❌ Error no manejado:', err);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Excepción no capturada:', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('🛑 Cerrando bot...');
    await client.destroy();
    server.close();
    process.exit(0);
});

// Inicializar el cliente
console.log('🔄 Inicializando cliente WhatsApp...');
client.initialize().catch(err => {
    console.error('❌ Error inicializando:', err);
    process.exit(1);
});
