import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handle } from 'hono/cloudflare-pages';

const app = new Hono().basePath('/api');

// Configuration
const ADMIN_PASSWORD = "admin";
const DEFAULT_SITES = [
    { key: "ffzy", name: "非凡影视", api: "https://cj.ffzyapi.com/api.php/provide/vod/", active: true },
    { key: "bfzy", name: "暴风影视", api: "https://bfzyapi.com/api.php/provide/vod/", active: true },
    { key: "lzi", name: "量子影视", api: "https://cj.lziapi.com/api.php/provide/vod/", active: true }
    // Add other default sites here if needed, or rely on the admin to populate
];

// Middleware
app.use('/*', cors());

// Helper: Get DB from KV
async function getDB(env) {
    try {
        const data = await env.VIDEO_PROXY_DB.get('sites', { type: 'json' });
        if (!data || !Array.isArray(data)) {
            return { sites: DEFAULT_SITES };
        }
        return { sites: data };
    } catch (e) {
        return { sites: DEFAULT_SITES };
    }
}

// Helper: Save DB to KV
async function saveDB(env, data) {
    await env.VIDEO_PROXY_DB.put('sites', JSON.stringify(data.sites));
}

// Helper: Fetch with timeout
async function fetchWithTimeout(url, options = {}, timeout = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (err) {
        clearTimeout(id);
        throw err;
    }
}

// === ★ 真实测速接口 ★ ===
app.get('/check', async (c) => {
    const key = c.req.query('key');
    const db = await getDB(c.env);
    const site = db.sites.find(s => s.key === key);

    if (!site) return c.json({ latency: 9999 });

    const start = Date.now();
    try {
        const res = await fetchWithTimeout(`${site.api}?ac=list&pg=1`, {}, 3000);
        await res.text(); // Consume body
        const latency = Date.now() - start;
        return c.json({ latency });
    } catch (e) {
        return c.json({ latency: 9999 });
    }
});

// === 热门接口 ===
app.get('/hot', async (c) => {
    const db = await getDB(c.env);
    const sites = db.sites.filter(s => ['ffzy', 'bfzy', 'lzi', 'dbzy'].includes(s.key));

    // Process serially or parallel? Parallel is better for workers but limit concurrency if needed.
    // Cloudflare sub-requests are fast.
    for (const site of sites) {
        try {
            const res = await fetchWithTimeout(`${site.api}?ac=list&pg=1&h=24&out=json`, {}, 3000);
            const data = await res.json();
            const list = data.list || data.data;
            if (list && list.length > 0) {
                return c.json({ list: list.slice(0, 12) });
            }
        } catch (e) { continue; }
    }
    return c.json({ list: [] });
});

// === 搜索接口 ===
app.get('/search', async (c) => {
    const wd = c.req.query('wd');
    if (!wd) return c.json({ list: [] });

    const db = await getDB(c.env);
    const sites = db.sites.filter(s => s.active);

    const promises = sites.map(async (site) => {
        try {
            const res = await fetchWithTimeout(`${site.api}?ac=list&wd=${encodeURIComponent(wd)}&out=json`, {}, 6000);
            const data = await res.json();
            const list = data.list || data.data;
            if (list && Array.isArray(list)) {
                return list.map(item => ({
                    ...item,
                    site_key: site.key,
                    site_name: site.name,
                    latency: 0
                }));
            }
        } catch (e) { }
        return [];
    });

    const results = await Promise.all(promises);
    return c.json({ list: results.flat() });
});

// === 详情接口 ===
app.get('/detail', async (c) => {
    const site_key = c.req.query('site_key');
    const id = c.req.query('id');

    const db = await getDB(c.env);
    const targetSite = db.sites.find(s => s.key === site_key);

    if (!targetSite) return c.json({ error: "Site not found" }, 404);

    try {
        const res = await fetchWithTimeout(`${targetSite.api}?ac=detail&ids=${id}&out=json`, {}, 6000);
        const data = await res.json();
        return c.json(data);
    } catch (e) {
        return c.json({ error: "Source Error" }, 500);
    }
});

// === Admin APIs ===
app.post('/admin/login', async (c) => {
    const body = await c.req.json();
    return body.password === ADMIN_PASSWORD
        ? c.json({ success: true })
        : c.json({ success: false }, 403);
});

app.get('/admin/sites', async (c) => {
    const db = await getDB(c.env);
    return c.json(db.sites);
});

app.post('/admin/sites', async (c) => {
    const body = await c.req.json();
    await saveDB(c.env, { sites: body.sites });
    return c.json({ success: true });
});

export const onRequest = handle(app);
