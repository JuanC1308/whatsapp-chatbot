const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Crear instancia del cliente
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "mi-chatbot"
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
            '--disable-gpu'
        ]
    }
});

// Generar código QR para autenticación
client.on('qr', (qr) => {
    console.log('Escanea este código QR con tu WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// Cuando el cliente esté listo
client.on('ready', () => {
    console.log('¡Bot de WhatsApp está listo!');
});

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
    
    // Buscar coincidencias exactas
    if (respuestas[texto]) {
        return respuestas[texto];
    }
    
    // Buscar coincidencias parciales
    for (let palabra in respuestas) {
        if (texto.includes(palabra)) {
            return respuestas[palabra];
        }
    }
    
    // Respuesta por defecto
    return 'No entiendo tu mensaje. Escribe "ayuda" para ver los comandos disponibles o contacta con un humano para asistencia personalizada.';
}

// Escuchar mensajes entrantes
client.on('message', async (message) => {
    // Solo responder a mensajes de texto (no a imágenes, videos, etc.)
    if (message.type !== 'chat') {
        return;
    }
    
    // No responder a mensajes de grupos (opcional)
    const chat = await message.getChat();
    if (chat.isGroup) {
        return; // Descomenta esta línea si no quieres que responda en grupos
    }
    
    // No responder a mensajes del propio bot
    if (message.fromMe) {
        return;
    }
    
    console.log(`Mensaje recibido de ${message.from}: ${message.body}`);
    
    // Procesar mensaje y enviar respuesta
    const respuesta = procesarMensaje(message.body);
    
    // Simular que está escribiendo (opcional)
    chat.sendStateTyping();
    
    // Esperar un poco para simular tiempo de respuesta
    setTimeout(async () => {
        await message.reply(respuesta);
        console.log(`Respuesta enviada: ${respuesta}`);
    }, 1000);
});

// Manejar errores
client.on('auth_failure', (msg) => {
    console.error('Error de autenticación:', msg);
});

client.on('disconnected', (reason) => {
    console.log('Cliente desconectado:', reason);
});

// Inicializar el cliente
client.initialize();

// Función para enviar mensaje programado (ejemplo)
function enviarMensajeProgramado(numero, mensaje) {
    const chatId = numero + '@c.us'; // Formato para números individuales
    client.sendMessage(chatId, mensaje)
        .then(() => {
            console.log(`Mensaje enviado a ${numero}: ${mensaje}`);
        })
        .catch(err => {
            console.error('Error enviando mensaje:', err);
        });
}

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Cerrando bot...');
    await client.destroy();
    process.exit(0);
});
