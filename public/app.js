const app = document.getElementById('app');
const API_BASE = 'http://localhost:3000/api';

// Router Sederhana
async function router(page, params = {}) {
    window.scrollTo(0, 0);
    
    // Update Active Nav
    document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
    // (Logika untuk menandai nav aktif bisa ditambahkan di sini)

    switch(page) {
        case 'home':
            await renderHome();
            break;
        case 'schedule':
            await renderSchedule();
            break;
        case 'explore':
            await renderExplore(params.type || 'ongoing', params.page || 1);
            break;
        case 'genre':
            await renderGenre();
            break;
        case 'search':
            await renderSearch(params.query);
            break;
        default:
            await renderHome();
    }
}

// Render Home
async function renderHome() {
    app.innerHTML = '<div class="loading">Loading...</div>';
    
    try {
        const res = await fetch(`${API_BASE}/home`);
        const data = await res.json();
        
        let html = `
            <h2 class="section-title">Anime Terbaru</h2>
            <div class="anime-grid">
                ${data.map(anime => createCard(anime)).join('')}
            </div>
        `;
        app.innerHTML = html;
    } catch (e) {
        app.innerHTML = '<p>Error memuat data. Pastikan server Node.js berjalan.</p>';
    }
}

// Render Schedule
async function renderSchedule() {
    app.innerHTML = '<div class="loading">Loading...</div>';
    const res = await fetch(`${API_BASE}/schedule`);
    const data = await res.json();

    let html = `
        <h2 class="section-title">Jadwal Rilis</h2>
        <div class="schedule-list">
            ${data.map(item => `
                <div class="schedule-item">
                    <span style="color: var(--primary-color); font-weight:bold; width: 100px;">${item.day}</span>
                    <span style="flex-grow:1; margin-left: 20px;">${item.title}</span>
                    <span style="background:#333; padding: 5px 10px; border-radius:5px;">${item.time}</span>
                </div>
            `).join('')}
        </div>
    `;
    app.innerHTML = html;
}

// Render Explore (Ongoing/Completed)
async function renderExplore(type, page) {
    app.innerHTML = '<div class="loading">Loading...</div>';
    const res = await fetch(`${API_BASE}/explore?type=${type}&page=${page}`);
    const data = await res.json();

    let html = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
            <h2 class="section-title">${type === 'ongoing' ? 'Anime Ongoing' : 'Anime Completed'}</h2>
            <div>
                <button onclick="router('explore', {type: 'ongoing'})" class="genre-tag" style="padding:5px 15px;">Ongoing</button>
                <button onclick="router('explore', {type: 'complete'})" class="genre-tag" style="padding:5px 15px;">Completed</button>
            </div>
        </div>
        <div class="anime-grid">
            ${data.length > 0 ? data.map(anime => createCard(anime)).join('') : '<p>Data tidak ditemukan.</p>'}
        </div>
        <div style="margin-top: 20px; text-align:center;">
            <button onclick="router('explore', {type: '${type}', page: ${parseInt(page)+1}})" class="genre-tag">Load More</button>
        </div>
    `;
    app.innerHTML = html;
}

// Render Genre
async function renderGenre() {
    const res = await fetch(`${API_BASE}/genre`);
    const data = await res.json();

    let html = `
        <h2 class="section-title">Daftar Genre</h2>
        <div class="genre-container">
            ${data.map(g => `
                <a href="#" onclick="alert('Fitur filter genre: ${g.name}')" class="genre-tag">${g.name}</a>
            `).join('')}
        </div>
    `;
    app.innerHTML = html;
}

// Helper: Buat Kartu Anime
function createCard(anime) {
    // Fallback image jika null
    const img = anime.image || 'https://via.placeholder.com/300x400?text=No+Image';
    return `
        <div class="anime-card" onclick="alert('Navigasi ke: ${anime.url}')">
            <img src="${img}" alt="${anime.title}" loading="lazy">
            <div class="card-info">
                <h3>${anime.title}</h3>
                <span>${anime.type || 'TV'}</span>
            </div>
        </div>
    `;
}

// Handle Search
function handleSearch() {
    const query = document.getElementById('searchInput').value;
    if(query) router('search', { query });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    router('home');
});
