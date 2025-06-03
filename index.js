// index.js (ваш прокси-сервер)
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const port = 3000; // Replit автоматически перенаправляет порт 80 на 3000

// Включаем CORS для всех запросов, чтобы ваш HTML мог к нему обращаться
app.use(cors());

// Маршрут для проксирования запросов
app.get('/proxy', async (req, res) => {
    const targetUrl = req.query.url; // Получаем целевой URL из параметра 'url'

    if (!targetUrl) {
        return res.status(400).send('Параметр URL отсутствует.');
    }

    try {
        // Выполняем GET-запрос к целевому URL
        const response = await axios.get(targetUrl, {
            responseType: 'text', // Получаем ответ как текст
            // Важно: если целевой сайт использует строгие CSP,
            // или если вы хотите проксировать не только HTML,
            // здесь может потребоваться более сложная обработка заголовков.
            headers: {
                // Передаем некоторые заголовки, чтобы выглядеть как обычный браузер
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
            }
        });

        // Устанавливаем заголовки ответа, чтобы браузер мог отобразить контент
        // Копируем Content-Type из оригинального ответа
        if (response.headers['content-type']) {
            res.setHeader('Content-Type', response.headers['content-type']);
        } else {
            res.setHeader('Content-Type', 'text/html'); // По умолчанию HTML
        }
        
        // Отправляем данные
        res.send(response.data);

    } catch (error) {
        console.error('Ошибка проксирования:', error.message);
        if (error.response) {
            // Если есть ответ от целевого сервера (например, 404, 500)
            res.status(error.response.status).send(`Ошибка при загрузке URL: ${error.response.statusText || error.message}`);
        } else if (error.request) {
            // Если запрос был сделан, но ответа не получено (например, таймаут)
            res.status(504).send('Целевой сервер не ответил или таймаут.');
        } else {
            // Что-то пошло не так при настройке запроса
            res.status(500).send(`Внутренняя ошибка прокси-сервера: ${error.message}`);
        }
    }
});

// Replit автоматически предоставляет публичный URL для вашего сервера,
// и он прослушивает порт 3000 внутри контейнера.
app.listen(port, () => {
    console.log(`Прокси-сервер запущен на порту ${port}`);
    console.log('Теперь Replit предоставит вам публичный URL для доступа.');
});
