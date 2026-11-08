
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/home', (req, res) => {
    res.json({
        name: "Hello, URL Shortener"
    });
});

app.post('/shorten', async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).json({
                message: "URL is required"
            });
        }

        // Validate URL
        let parsedUrl;

        try {
            parsedUrl = new URL(url);
        } catch {
            return res.status(400).json({
                message: "Invalid URL"
            });
        }

        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            return res.status(400).json({
                message: "Only HTTP and HTTPS URLs are supported"
            });
        }

        // Call TinyURL API
        const response = await axios.post(
            'https://api.tinyurl.com/create',
            {
                url: parsedUrl.href,
                domain: 'tinyurl.com'
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.TINYURL_API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return res.status(201).json({
            originalUrl: parsedUrl.href,
            shortUrl: response.data.data.tiny_url
        });

    } catch (error) {
        console.error(
            'TinyURL API error:',
            error.response?.data || error.message
        );

        return res.status(
            error.response?.status === 429 ? 503 : 502
        ).json({
            message: "Unable to shorten URL right now"
        });
    }
});

app.listen(process.env.PORT , () => {
    console.log('Server running');
});
