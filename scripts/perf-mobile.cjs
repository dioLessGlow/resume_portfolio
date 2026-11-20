// 移动端性能测试：Fast4G 节流 + iPhone UA + 独立浏览器 + 禁缓存
const puppeteer = require('puppeteer-core');
const os = require('os');

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'https://diolessglow.github.io/resume_portfolio/';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';

const PAGES = [
  'home.html',
  'index.html',
  'intro.html',
  'works.html',
  'works/works-projects.html',
  'works/works-honors.html',
  'works/works-design.html',
  'works/works-web.html',
  'works/works-games.html',
  'public/games/Bird-Watch.html',
  'public/games/CubSpin.html',
  'public/games/Mirror-Chase.html',
  'public/games/Stack-Tower.html',
  'public/foods/Pocket-Drums.html',
  'public/foods/Sylvan-Sands.html',
  'public/foods/ZephyrLion.html',
  'public/foods/map.html',
  '404.html',
];

// 波动大的页面多测几轮
const ROUNDS = {
  'works/works-honors.html': 3,
  'works/works-web.html': 3,
  'works/works-design.html': 2,
  '404.html': 2,
};
const WAIT_MS = 8000;

async function measure(path, round) {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(UA);
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const client = await page.createCDPSession();
    await client.send('Network.enable');
    await client.send('Network.setCacheDisabled', { cacheDisabled: true });
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
    });

    const errors = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.evaluateOnNewDocument(() => {
      window.__lcp = 0;
      window.__cls = 0;
      try {
        new PerformanceObserver(list => {
          for (const e of list.getEntries()) window.__lcp = e.startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver(list => {
          for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
        }).observe({ type: 'layout-shift', buffered: true });
      } catch (e) {}
    });

    const resp = await page.goto(BASE + path, { waitUntil: 'load', timeout: 60000 });
    await new Promise(r => setTimeout(r, WAIT_MS));

    const m = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] || {};
      const paints = performance.getEntriesByType('paint') || [];
      const fcp = paints.find(p => p.name === 'first-contentful-paint');
      const res = performance.getEntriesByType('resource') || [];
      let bytes = 0;
      for (const r of res) bytes += (r.transferSize || 0) + (r.encodedBodySize || 0);
      return {
        lcp: Math.round(window.__lcp || 0),
        fcp: Math.round(fcp ? fcp.startTime : 0),
        cls: Math.round((window.__cls || 0) * 1000) / 1000,
        ttfb: Math.round((nav.responseStart || 0) - (nav.requestStart || 0)),
        requests: res.length,
        bytes: Math.round(bytes / 1024),
        dom: document.querySelectorAll('*').length,
        heap: Math.round(((performance.memory && performance.memory.usedJSHeapSize) || 0) / 1024),
        title: document.title,
      };
    });

    return { path, round, status: resp ? resp.status() : 0, ...m, errors };
  } finally {
    await browser.close();
  }
}

(async () => {
  const results = [];
  for (const p of PAGES) {
    const rounds = ROUNDS[p] || 1;
    for (let i = 1; i <= rounds; i++) {
      try {
        const r = await measure(p, i);
        results.push(r);
        console.log(`${p} #${i}: LCP=${(r.lcp / 1000).toFixed(2)}s FCP=${(r.fcp / 1000).toFixed(2)}s CLS=${r.cls} requests=${r.requests} bytes=${r.bytes}K status=${r.status} err=${r.errors.length}`);
      } catch (e) {
        console.log(`${p} #${i}: ERROR ${e.message}`);
        results.push({ path: p, round: i, error: e.message });
      }
    }
  }
  require('fs').writeFileSync(
    os.tmpdir() + '/perf-mobile-results.json',
    JSON.stringify(results, null, 2)
  );
  console.log('DONE results=' + results.length);
})();
