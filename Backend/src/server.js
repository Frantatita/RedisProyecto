const express = require('express');
const redis = require('redis');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');

// Configurar Redis
const redisClient = redis.createClient();

redisClient.on('connect', () => {
    console.log('Conectado a Redis');
});

redisClient.on('error', (err) => {
    console.log('Error en Redis:', err);
});

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Ruta de registro
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    redisClient.hset('users', username, hashedPassword, (err, reply) => {
        if (err) {
            res.status(500).json({ message: 'Error al registrar el usuario' });
        } else {
            res.status(201).json({ message: 'Usuario registrado exitosamente' });
        }
    });
});

// Ruta de login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    redisClient.hget('users', username, async (err, hashedPassword) => {
        if (err) {
            res.status(500).json({ message: 'Error al iniciar sesión' });
        } else if (!hashedPassword) {
            res.status(401).json({ message: 'Credenciales inválidas' });
        } else {
            const isMatch = await bcrypt.compare(password, hashedPassword);
            if (isMatch) {
                res.status(200).json({ message: 'Inicio de sesión exitoso' });
            } else {
                res.status(401).json({ message: 'Credenciales inválidas' });
            }
        }
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
