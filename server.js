const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = 3000;

// 1. Rate Limiting (Mencegah spam ke API/Website target)
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 menit
    max: 10, // Maksimal 10 request per menit per IP
    message: { error: "Terlalu banyak request, coba lagi nanti." }
});

app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Base URL Target (Ganti jika website target berubah)
const BASE_URL = "https://www.sankavollerei.com";

// Helper Function Scraping (Wajib disesuaikan jika struktur HTML website target berubah)
async function scrapeData(url, selector, listCallback) {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const results = [];
        
        $(selector).each((i, el) => {
            const item = listCallback($, el);
            if (item) results.push(item);
        });
        return results;
    } catch (error) {
        console.error("Scraping Error:", error.message);
        return [];
    }
}

// --- ENDPOINTS ---

// Home Page
app.get('/api/home', apiLimiter, async (req, res) => {
    // Contoh selector (Wajib disesuaikan dengan inspect element website target)
    const url = `${BASE_URL}/anime/home`;
    const results = await scrapeData(url, '.anime-list .anime-card', ($, el) => {
        return {
            title: $(el).find('h3').text().trim(),
            image: $(el).find('img').attr('src'),
            url: $(el).find('a').attr('href'),
            type: $(el).find('.type').text().trim()
        };
    });
    res.json(results);
});

// Schedule
app.get('/api/schedule', apiLimiter, async (req, res) => {
    const url = `${BASE_URL}/anime/schedule`;
    // Placeholder: Karena struktur schedule rumit, kita buat data dummy dulu
    // Sesuaikan selector dengan inspect element website target
    res.json([
        { day: "Senin", title: "One Piece", time: "08:00" },
        { day: "Selasa", title: "Jujutsu Kaisen", time: "18:30" },
        { day: "Rabu", title: "Chainsaw Man", time: "22:00" },
    ]);
});

// Explore (Ongoing/Complete)
app.get('/api/explore', apiLimiter, async (req, res) => {
    const type = req.query.type || 'ongoing';
    const page = req.query.page || 1;
    const url = `${BASE_URL}/anime/${type}-anime?page=${page}`;
    
    const results = await scrapeData(url, '.anime-list .anime-item', ($, el) => {
        return {
            title: $(el).find('.title').text().trim(),
            thumb: $(el).find('img').attr('src'),
            url: $(el).find('a').attr('href'),
            rating: $(el).find('.rating').text().trim()
        };
    });
    res.json(results);
});

// Genre
app.get('/api/genre', apiLimiter, async (req, res) => {
    const url = `${BASE_URL}/anime/genre`;
    res.json([
        { name: "Action", url: "/anime/genre/action" },
        { name: "Comedy", url: "/anime/genre/comedy" },
        { name: "Drama", url: "/anime/genre/drama" },
        { name: "Ecchi", url: "/anime/genre/ecchi" },
        { name: "Fantasy", url: "/anime/genre/fantasy" },
        { name: "Horror", url: "/anime/genre/horror" },
        { name: "Romance", url: "/anime/genre/romance" },
        { name: "Sci-Fi", url: "/anime/genre/sci-fi" },
    ]);
});

// Search
app.get('/api/search', apiLimiter, async (req, res) => {
    const query = req.query.q;
    if(!query) return res.json([]);
    const url = `${BASE_URL}/anime/search/${query}`;
    // Implementasikan logika scraping search di sini
    res.json([]); 
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
