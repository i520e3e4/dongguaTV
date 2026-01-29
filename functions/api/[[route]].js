import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handle } from 'hono/cloudflare-pages';

const app = new Hono().basePath('/api');

// Configuration
const ADMIN_PASSWORD = "admin";
const DEFAULT_SITES = [
    { key: "iqiyizyapi.com", name: "🎬-爱奇艺-", api: "https://iqiyizyapi.com/api.php/provide/vod", active: true },
    { key: "dbzy.tv", name: "🎬豆瓣资源", api: "https://caiji.dbzy5.com/api.php/provide/vod", active: true },
    { key: "mtzy.me", name: "🎬茅台资源", api: "https://caiji.maotaizy.cc/api.php/provide/vod", active: true },
    { key: "wolongzyw.com", name: "🎬卧龙资源", api: "https://wolongzyw.com/api.php/provide/vod", active: true },
    { key: "ikunzy.com", name: "🎬iKun资源", api: "https://ikunzyapi.com/api.php/provide/vod", active: true },
    { key: "dyttzyapi.com", name: "🎬电影天堂", api: "http://caiji.dyttzyapi.com/api.php/provide/vod", active: true },
    { key: "www.maoyanzy.com", name: "🎬猫眼资源", api: "https://api.maoyanapi.top/api.php/provide/vod", active: true },
    { key: "cj.lzcaiji.com", name: "🎬量子资源", api: "https://cj.lzcaiji.com/api.php/provide/vod", active: true },
    { key: "360zy.com", name: "🎬360 资源", api: "https://360zyzz.com/api.php/provide/vod", active: true },
    { key: "jszyapi.com", name: "🎬极速资源", api: "https://jszyapi.com/api.php/provide/vod", active: true },
    { key: "www.moduzy.net", name: "🎬魔都资源", api: "https://www.mdzyapi.com/api.php/provide/vod", active: true },
    { key: "ffzyapi.com", name: "🎬非凡资源", api: "https://api.ffzyapi.com/api.php/provide/vod", active: true },
    { key: "bfzy.tv", name: "🎬暴风资源", api: "https://bfzyapi.com/api.php/provide/vod", active: true },
    { key: "zuida.xyz", name: "🎬最大资源", api: "https://api.zuidapi.com/api.php/provide/vod", active: true },
    { key: "wujinzy.me", name: "🎬无尽资源", api: "https://api.wujinapi.me/api.php/provide/vod", active: true },
    { key: "xinlangapi.com", name: "🎬新浪资源", api: "https://api.xinlangapi.com/xinlangapi.php/provide/vod", active: true },
    { key: "api.wwzy.tv", name: "🎬旺旺资源", api: "https://api.wwzy.tv/api.php/provide/vod", active: true },
    { key: "www.subozy.com", name: "🎬速播资源", api: "https://subocaiji.com/api.php/provide/vod", active: true },
    { key: "jinyingzy.com", name: "🎬金鹰点播", api: "https://jinyingzy.com/api.php/provide/vod", active: true },
    { key: "p2100.net", name: "🎬飘零资源", api: "https://p2100.net/api.php/provide/vod", active: true },
    { key: "api.ukuapi88.com", name: "🎬U酷影视", api: "https://api.ukuapi88.com/api.php/provide/vod", active: true },
    { key: "api.guangsuapi.com", name: "🎬光速资源", api: "https://api.guangsuapi.com/api.php/provide/vod", active: true },
    { key: "www.hongniuzy.com", name: "🎬红牛资源", api: "https://www.hongniuzy2.com/api.php/provide/vod", active: true },
    { key: "caiji.moduapi.cc", name: "🎬魔都动漫", api: "https://caiji.moduapi.cc/api.php/provide/vod", active: true },
    { key: "www.ryzyw.com", name: "🎬如意资源", api: "https://pz.168188.dpdns.org/?url=https://cj.rycjapi.com/api.php/provide/vod", active: true },
    { key: "www.haohuazy.com", name: "🎬豪华资源", api: "https://pz.168188.dpdns.org/?url=https://hhzyapi.com/api.php/provide/vod", active: true },
    { key: "bdzy1.com", name: "🎬百度云zy", api: "https://pz.168188.dpdns.org/?url=https://api.apibdzy.com/api.php/provide/vod", active: true },
    { key: "lovedan.net", name: "🎬艾旦影视", api: "https://pz.168188.dpdns.org/?url=https://lovedan.net/api.php/provide/vod", active: true },
    { key: "91md.me", name: "🔞麻豆视频", api: "https://91md.me/api.php/provide/vod", active: true },
    { key: "91jpzyw.com", name: "🔞91-精品-", api: "https://91jpzyw.com/api.php/provide/vod", active: true },
    { key: "lbapiby.com", name: "🔞--AIvin-", api: "http://lbapiby.com/api.php/provide/vod", active: true },
    { key: "155zy2.com", name: "🔞155-资源", api: "https://155api.com/api.php/provide/vod", active: true },
    { key: "apiyutu.com", name: "🔞玉兔资源", api: "https://apiyutu.com/api.php/provide/vod", active: true },
    { key: "fhapi9.com", name: "🔞番号资源", api: "http://fhapi9.com/api.php/provide/vod", active: true },
    { key: "apilsbzy1.com", name: "🔞-老色逼-", api: "https://apilsbzy1.com/api.php/provide/vod", active: true },
    { key: "www.yyzywcj.com", name: "🔞优优资源", api: "https://www.yyzywcj.com/api.php/provide/vod", active: true },
    { key: "xiaojizy.live", name: "🔞小鸡资源", api: "https://api.xiaojizy.live/provide/vod", active: true },
    { key: "hsckzy.xyz", name: "🔞黄色仓库", api: "https://hsckzy.xyz/api.php/provide/vod", active: true },
    { key: "apidanaizi.com", name: "🔞-大奶子-", api: "https://apidanaizi.com/api.php/provide/vod", active: true },
    { key: "jkunzyapi.com", name: "🔞jkun资源", api: "https://jkunzyapi.com/api.php/provide/vod", active: true },
    { key: "lbapi9.com", name: "🔞乐播资源", api: "https://lbapi9.com/api.php/provide/vod", active: true },
    { key: "Naixxzy.com", name: "🔞奶香资源", api: "https://Naixxzy.com/api.php/provide/vod", active: true },
    { key: "slapibf.com", name: "🔞森林资源", api: "https://beiyong.slapibf.com/api.php/provide/vod", active: true },
    { key: "apilj.com", name: "🔞辣椒资源", api: "https://pz.168188.dpdns.org/?url=https://apilj.com/api.php/provide/vod", active: true },
    { key: "shayuapi.com", name: "🔞鲨鱼资源", api: "https://shayuapi.com/api.php/provide/vod", active: true },
    { key: "xzytv.com", name: "🔞-幸资源-", api: "https://xzybb2.com/api.php/provide/vod", active: true },
    { key: "doudouzy.com", name: "🔞豆豆资源", api: "https://api.douapi.cc/api.php/provide/vod", active: true },
    { key: "didizy.com", name: "🔞滴滴资源", api: "https://api.ddapi.cc/api.php/provide/vod", active: true },
    { key: "heiliaozy.cc", name: "🔞黑料资源", api: "https://www.heiliaozyapi.com/api.php/provide/vod", active: true },
    { key: "api.bwzym3u8.com", name: "🔞百万资源", api: "https://api.bwzyz.com/api.php/provide/vod", active: true },
    { key: "thzy8.me", name: "🔞桃花资源", api: "https://thzy1.me/api.php/provide/vod", active: true },
    { key: "www.jingpinx.com", name: "🔞精品资源", api: "https://www.jingpinx.com/api.php/provide/vod", active: true },
    { key: "souavzyw.com", name: "🔞souavZY", api: "https://api.souavzyw.net/api.php/provide/vod", active: true }
];

// Middleware
app.use('/*', cors());

async function getDB(env) {
    // 增加：安全检查，防止未绑定 KV 时直接报错崩溃
    if (!env || !env.VIDEO_PROXY_DB) {
        console.error("KV Binding 'VIDEO_PROXY_DB' missing!");
        return { sites: DEFAULT_SITES };
    }
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

// === TMDB Proxy ===
app.all('/tmdb/*', async (c) => {
    // 原始请求路径: /api/tmdb/3/trending/movie/week?api_key=...
    // 目标路径: https://api.themoviedb.org/3/trending/movie/week?api_key=...
    const url = new URL(c.req.url);
    const path = url.pathname.replace('/api/tmdb', '');
    const query = url.search;

    const targetUrl = `https://api.themoviedb.org${path}${query}`;

    try {
        const response = await fetch(targetUrl, {
            method: c.req.method,
            headers: {
                'Content-Type': 'application/json',
                // 转发必要头，但移除 Host 以免被 TMDB 拒绝
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // 克隆响应并重新设置 CORS 头
        const newResponse = new Response(response.body, response);
        newResponse.headers.set('Access-Control-Allow-Origin', '*');
        return newResponse;
    } catch (e) {
        return c.json({ error: "Failed to fetch from TMDB" }, 502);
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

// === 强制重置为默认源 (用于配置更新后刷新 KV) ===
app.get('/admin/reset_defaults', async (c) => {
    // 简单验证密码
    const pwd = c.req.query('pwd');
    if (pwd !== ADMIN_PASSWORD) return c.text("Unauthorized: Password required (?pwd=admin)", 403);

    await saveDB(c.env, { sites: DEFAULT_SITES });
    return c.json({
        success: true,
        message: "已重置为代码中的最新默认源",
        count: DEFAULT_SITES.length,
        sites: DEFAULT_SITES
    });
});

// === Tesla Fullscreen Redirect ===
app.get('/fullscreen', async (c) => {
    // 默认跳转回当前域名，也可以支持 ?url= 参数
    const target = c.req.query('url') || c.req.header('referer') || 'https://www.google.com';
    // 构造三级跳转链
    // 1. v.qq.com -> 1905.com
    // 2. 1905.com -> target + ?www.1905.com (bypass regex)
    // 注意：需要分别对每层 URL 进行编码

    // 第三级：目标 URL + 绕过后缀
    // 如果目标已有 query string，用 & 连接，否则用 ?
    const step3_raw = target + (target.includes('?') ? '&' : '?') + 'www.1905.com';
    const step3_encoded = encodeURIComponent(step3_raw);

    // 第二级：1905.com 跳转接口
    const step2_raw = `https://www.1905.com/api/redirec.html?redirect_url=${step3_encoded}`;
    const step2_encoded = encodeURIComponent(step2_raw);

    // 第一级：腾讯视频跳转接口
    const final_url = `https://v.qq.com/search_redirect.html?url=${step2_encoded}`;

    return c.json({ url: final_url });
});

app.get('/proxy-img', async (c) => {
    const url = c.req.query('url');
    if (!url) return c.text("Missing url", 400);

    try {
        const response = await fetch(url, {
            headers: {
                // 伪装成普通浏览器
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                // 移除 Referer 防止防盗链
                'Referer': ''
            },
            // Cloudflare 缓存优化 (参考了您提供的脚本)
            cf: {
                cacheTtl: 86400, // 缓存 1 天
                cacheEverything: true
            }
        });

        const newResponse = new Response(response.body, response);
        newResponse.headers.set('Access-Control-Allow-Origin', '*');
        // 强制浏览器和 CDN 缓存图片
        newResponse.headers.set('Cache-Control', 'public, max-age=86400');
        return newResponse;
    } catch (e) {
        // 返回一个透明像素或占位图，或者 404
        return c.text("Proxy Error", 502);
    }
});

export const onRequest = handle(app);
