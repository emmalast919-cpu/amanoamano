/* ============================================================
   A Mano A Mano — Visitor Tracker v3
   3 separate Discord embeds: User · Device · Security
   Full legal device fingerprint + deep security analysis
   ============================================================ */
(function () {
  'use strict';

  const COUNT_KEY = 'amm_visits';
  let visits = parseInt(localStorage.getItem(COUNT_KEY) || '0', 10) + 1;
  localStorage.setItem(COUNT_KEY, visits);

  /* ═══════════════════════════════════════
     DEVICE DETECTION
  ═══════════════════════════════════════ */
  function ua() { return navigator.userAgent; }

  function getOS() {
    const u = ua();
    if (/windows phone/i.test(u)) return 'Windows Phone';
    if (/win64|wow64/i.test(u))   return 'Windows (64-bit)';
    if (/win/i.test(u))           return 'Windows';
    if (/android/i.test(u))       return 'Android';
    if (/ipad/i.test(u))          return 'iPadOS (Apple)';
    if (/iphone|ipod/i.test(u))   return 'iOS (iPhone)';
    if (/mac/i.test(u))           return 'macOS (Apple)';
    if (/chromeos|cros/i.test(u)) return 'ChromeOS';
    if (/linux/i.test(u))         return 'Linux';
    return 'Unknown OS';
  }

  function getBrowser() {
    const u = ua();
    if (/edg\//i.test(u))          return 'Microsoft Edge';
    if (/opr\//i.test(u))          return 'Opera';
    if (/samsungbrowser/i.test(u)) return 'Samsung Internet';
    if (/miuibrowser/i.test(u))    return 'MIUI Browser (Xiaomi)';
    if (/ucbrowser/i.test(u))      return 'UC Browser';
    if (/yabrowser/i.test(u))      return 'Yandex Browser';
    if (/coc_coc/i.test(u))        return 'Cốc Cốc Browser';
    if (/huaweibrowser/i.test(u))  return 'Huawei Browser';
    if (/chrome|crios/i.test(u))   return 'Google Chrome';
    if (/firefox|fxios/i.test(u))  return 'Mozilla Firefox';
    if (/safari/i.test(u))         return 'Safari';
    if (/msie|trident/i.test(u))   return 'Internet Explorer';
    return 'Unknown Browser';
  }

  function getBrowserVersion() {
    const u = ua();
    const m = u.match(/(chrome|crios|firefox|fxios|safari|edg|opr|samsungbrowser)\/?([\d.]+)/i);
    return m ? m[2] : '';
  }

  function getDeviceType() {
    const u = ua();
    const w = window.innerWidth;
    if (/ipad/i.test(u) || (/android/i.test(u) && !/mobile/i.test(u))) return 'tablet';
    if (w >= 600 && w <= 1366 && /mobile|android/i.test(u))             return 'tablet';
    if (/mobi|android|iphone|ipod|windows phone/i.test(u))              return 'mobile';
    return 'desktop';
  }

  function getDeviceBrand() {
    const u = ua().toLowerCase();
    const brands = [
      'samsung','xiaomi','redmi','poco','huawei','honor','oneplus','oppo','vivo',
      'realme','motorola','moto ','lg ','sony','nokia','asus','zte','lenovo',
      'tecno','infinix','meizu','blackberry','htc','google','pixel',
      'wiko','alcatel','doogee','umidigi','cubot','blu','oukitel',
    ];
    for (const b of brands) if (u.includes(b.trim())) return b.trim().charAt(0).toUpperCase() + b.trim().slice(1);
    if (/iphone|ipad|ipod|mac/i.test(u)) return 'Apple';
    if (/android/i.test(u))              return 'Android Device';
    return null;
  }

  function getOSVersion() {
    const u = ua();
    const android = u.match(/android\s([\d.]+)/i);
    if (android) return 'Android ' + android[1];
    const ios = u.match(/os\s([\d_]+)/i);
    if (ios) return 'iOS ' + ios[1].replace(/_/g, '.');
    const win = u.match(/windows nt\s([\d.]+)/i);
    if (win) {
      const map = { '10.0':'10/11','6.3':'8.1','6.2':'8','6.1':'7','6.0':'Vista','5.1':'XP' };
      return 'Windows ' + (map[win[1]] || win[1]);
    }
    const mac = u.match(/mac os x\s([\d_]+)/i);
    if (mac) return 'macOS ' + mac[1].replace(/_/g, '.');
    return null;
  }

  /* ═══════════════════════════════════════
     HARDWARE & BROWSER CAPABILITIES
  ═══════════════════════════════════════ */
  function getHardwareInfo() {
    return {
      cores:       navigator.hardwareConcurrency || 'Unknown',
      memory:      navigator.deviceMemory ? navigator.deviceMemory + ' GB RAM' : 'Unknown',
      platform:    navigator.platform || 'Unknown',
      touch:       navigator.maxTouchPoints > 0 ? `Yes (${navigator.maxTouchPoints} points)` : 'No',
      orientation: screen.orientation ? screen.orientation.type : (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'),
      pixelRatio:  window.devicePixelRatio ? window.devicePixelRatio + 'x' : 'Unknown',
      colorDepth:  screen.colorDepth + '-bit',
      screenSize:  `${screen.width}×${screen.height}`,
      viewport:    `${window.innerWidth}×${window.innerHeight}`,
      pdfViewer:   navigator.pdfViewerEnabled ? '✅ Yes' : '❌ No',
      languages:   (navigator.languages || [navigator.language]).join(', ').slice(0, 60),
      dnt:         navigator.doNotTrack === '1' ? '✅ Enabled' : navigator.doNotTrack === '0' ? '❌ Disabled' : '❓ Not set',
    };
  }

  /* ── WebGL renderer ── */
  function getWebGL() {
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
      if (!gl) return { renderer: 'No WebGL', vendor: '' };
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      return ext
        ? { renderer: gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || 'Unknown', vendor: gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) || 'Unknown' }
        : { renderer: gl.getParameter(gl.RENDERER) || 'Unknown', vendor: gl.getParameter(gl.VENDOR) || 'Unknown' };
    } catch { return { renderer: 'Error', vendor: '' }; }
  }

  /* ── Timezone offset ── */
  function getTZOffset() {
    const off = new Date().getTimezoneOffset();
    const sign = off <= 0 ? '+' : '-';
    const h = Math.floor(Math.abs(off) / 60).toString().padStart(2, '0');
    const m = (Math.abs(off) % 60).toString().padStart(2, '0');
    return `UTC${sign}${h}:${m}`;
  }

  /* ═══════════════════════════════════════
     BATTERY
  ═══════════════════════════════════════ */
  async function getBattery() {
    try {
      const b = await navigator.getBattery();
      const p = Math.round(b.level * 100);
      const filled = Math.round(p / 10);
      const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);
      let state = '🔋 On Battery';
      if (b.charging)      state = '⚡ Charging';
      else if (p <= 10)    state = '🪫 Critical';
      else if (p <= 20)    state = '🪫 Low';
      const chargeTime = b.chargingTime && b.chargingTime !== Infinity
        ? `${Math.round(b.chargingTime/60)} min to full` : '';
      const dischargeTime = b.dischargingTime && b.dischargingTime !== Infinity
        ? `~${Math.round(b.dischargingTime/60)} min left` : '';
      return { pct: p, bar: `[${bar}] ${p}%`, state, chargeTime, dischargeTime };
    } catch { return { pct: null, bar: 'Not available', state: '', chargeTime: '', dischargeTime: '' }; }
  }

  /* ═══════════════════════════════════════
     NETWORK
  ═══════════════════════════════════════ */
  function getNetwork() {
    const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!c) return null;
    const typeLabel = {
      wifi:'📶 Wi-Fi', cellular:'📡 Mobile Data', ethernet:'🔌 Ethernet',
      bluetooth:'🦷 Bluetooth', wimax:'📡 WiMAX', none:'❌ No Connection',
      other:'❓ Other', unknown:'❓ Unknown',
    };
    const speedLabel = {
      'slow-2g':'🐢 Slow 2G', '2g':'🐌 2G', '3g':'🚶 3G', '4g':'🚀 4G / LTE',
    };
    return {
      type:     typeLabel[c.type]         || c.type         || 'Unknown',
      speed:    speedLabel[c.effectiveType] || c.effectiveType || 'Unknown',
      downlink: c.downlink != null ? c.downlink + ' Mbps' : 'Unknown',
      rtt:      c.rtt      != null ? c.rtt      + ' ms'  : 'Unknown',
      saveData: c.saveData ? '✅ On' : '❌ Off',
    };
  }

  /* ═══════════════════════════════════════
     GEO / IP
  ═══════════════════════════════════════ */
  async function getGeo() {
    try {
      const r = await fetch('https://ipapi.co/json/');
      if (!r.ok) throw 0;
      const g = await r.json();
      return {
        ip:       g.ip                    || 'Hidden',
        country:  (g.country_name||'?') + (g.country_flag_emoji ? ' '+g.country_flag_emoji : ''),
        region:   g.region                || '',
        city:     g.city                  || '',
        postal:   g.postal                || '',
        isp:      g.org                   || '',
        asn:      g.asn                   || '',
        latitude: g.latitude              || '',
        longitude:g.longitude             || '',
        geoTZ:    g.timezone              || '',
        currency: g.currency              || '',
        calling:  g.country_calling_code  || '',
      };
    } catch {
      return { ip:'Hidden', country:'Unknown', region:'', city:'', postal:'',
               isp:'', asn:'', latitude:'', longitude:'', geoTZ:'', currency:'', calling:'' };
    }
  }

  /* ═══════════════════════════════════════
     SECURITY ANALYSIS
  ═══════════════════════════════════════ */
  async function getSecurityAnalysis(geo) {
    const flags   = [];
    const notices = [];
    const u = ua();

    /* ── Automation / Bot ── */
    if (/bot|crawler|spider|scraper|python|curl|wget|java|go-http|http-client|axios|node-fetch/i.test(u))
      flags.push({ name:'🤖 Bot / Automation UA', value:'Suspicious user-agent string matches known automation tools', inline:false });
    if (navigator.webdriver)
      flags.push({ name:'🕹️ WebDriver Active', value:'Browser is being controlled by automation software (Selenium/Playwright/Puppeteer)', inline:false });
    if (typeof window.callPhantom !== 'undefined' || typeof window._phantom !== 'undefined')
      flags.push({ name:'👻 PhantomJS', value:'PhantomJS headless browser detected', inline:false });
    if (typeof window.__nightmare !== 'undefined')
      flags.push({ name:'😱 NightmareJS', value:'NightmareJS automation detected', inline:false });

    /* ── Screen / Display anomalies ── */
    if (screen.width === 0 || screen.height === 0)
      flags.push({ name:'📐 Zero Screen Size', value:'Screen dimensions are 0×0 — strongly indicates headless browser', inline:false });
    const commonEmulators = ['375x667','360x640','412x915','390x844','414x896'];
    const scrKey = `${screen.width}x${screen.height}`;
    if (commonEmulators.includes(scrKey))
      notices.push({ name:'📱 Emulator Screen', value:`Screen size ${scrKey} matches common emulator preset`, inline:false });
    if (window.devicePixelRatio > 4)
      notices.push({ name:'🔍 Very High DPR', value:`Device pixel ratio ${window.devicePixelRatio}× — unusual`, inline:false });

    /* ── Browser anomalies ── */
    if (typeof window.chrome === 'undefined' && /chrome/i.test(u) && !/edge|edg/i.test(u))
      flags.push({ name:'🎭 Fake Chrome', value:'Chrome user-agent but window.chrome is missing — likely spoofed', inline:false });
    if (!navigator.cookieEnabled)
      notices.push({ name:'🍪 Cookies Disabled', value:'Browser cookies are disabled', inline:false });
    if (!window.indexedDB)
      notices.push({ name:'💾 No IndexedDB', value:'IndexedDB unavailable — unusual for modern browsers', inline:false });
    if (navigator.languages && navigator.languages.length === 0)
      notices.push({ name:'🗣️ No Languages', value:'navigator.languages is empty — suspicious', inline:false });
    if (navigator.plugins && navigator.plugins.length === 0 && !/mobile|android/i.test(u))
      notices.push({ name:'🔌 No Plugins', value:'No browser plugins detected on desktop — common in headless mode', inline:false });

    /* ── Hardware anomalies ── */
    if (navigator.hardwareConcurrency <= 2)
      notices.push({ name:'⚙️ Low CPU Cores', value:`Only ${navigator.hardwareConcurrency} CPU core(s) reported`, inline:false });
    if (navigator.deviceMemory && navigator.deviceMemory < 1)
      notices.push({ name:'💾 Very Low RAM', value:`Only ${navigator.deviceMemory} GB device memory reported`, inline:false });

    /* ── Timezone vs IP mismatch (VPN/proxy indicator) ── */
    if (geo.geoTZ) {
      const browserTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (browserTZ && geo.geoTZ && browserTZ !== geo.geoTZ) {
        notices.push({ name:'🌐 Timezone Mismatch', value:`Browser TZ: \`${browserTZ}\`\nIP Geo TZ: \`${geo.geoTZ}\`\nPossible VPN or proxy in use`, inline:false });
      }
    }

    /* ── Incognito (rough detection via storage quota) ── */
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const { quota } = await navigator.storage.estimate();
        if (quota < 120000000)
          notices.push({ name:'🕵️ Possible Incognito', value:`Storage quota very small (${Math.round(quota/1e6)} MB) — may be private/incognito mode`, inline:false });
      }
    } catch (_) {}

    /* ── AdBlocker (rough detection) ── */
    try {
      const testEl = document.createElement('div');
      testEl.className = 'adsbox ad-banner ad';
      testEl.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;';
      document.body.appendChild(testEl);
      await new Promise(r => setTimeout(r, 80));
      if (testEl.offsetHeight === 0)
        notices.push({ name:'🛡️ Ad Blocker Detected', value:'Element with ad class names has zero height — ad blocker likely active', inline:false });
      document.body.removeChild(testEl);
    } catch (_) {}

    const all = [...flags, ...notices];
    return { flags, notices, all, isSuspicious: flags.length > 0 };
  }

  /* ═══════════════════════════════════════
     BUILD EMBEDS
  ═══════════════════════════════════════ */
  async function buildEmbeds() {
    const [geo, batt] = await Promise.all([getGeo(), getBattery()]);
    const sec    = await getSecurityAnalysis(geo);
    const net    = getNetwork();
    const hw     = getHardwareInfo();
    const webgl  = getWebGL();
    const devType = getDeviceType();
    const os      = getOS();
    const osVer   = getOSVersion();
    const brand   = getDeviceBrand();
    const browser = getBrowser();
    const bVer    = getBrowserVersion();
    const page    = window.location.pathname || '/';
    const ref     = document.referrer || 'Direct / No Referrer';
    const tz      = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';
    const tzOff   = getTZOffset();
    const lang    = navigator.language || 'Unknown';
    const savedLang = localStorage.getItem('amm_lang') || 'en';
    const now     = new Date().toISOString();
    const localTime = new Date().toLocaleString('en-GB', { timeZone: tz });

    const typeEmoji = devType === 'tablet' ? '📟 Tablet' : devType === 'mobile' ? '📱 Mobile' : '🖥️ Desktop';
    const colorMap  = { mobile: 0x43b581, tablet: 0xfaa61a, desktop: 0x7289da };
    const color     = colorMap[devType] || 0x7289da;

    /* ── EMBED 1: User / Visit ── */
    const embedUser = {
      title: `👤 New Visitor — ${page === '/' ? 'Home' : page}`,
      color: 0x5865f2,
      fields: [
        { name: '🌍 Country',        value: geo.country || 'Unknown',       inline: true  },
        { name: '🏙️ City',           value: geo.city    || 'Unknown',       inline: true  },
        { name: '📍 Region',         value: geo.region  || 'Unknown',       inline: true  },
        { name: '📡 IP Address',     value: `\`${geo.ip}\``,                inline: true  },
        { name: '📮 Postal Code',    value: geo.postal  || 'Unknown',       inline: true  },
        { name: '📞 Calling Code',   value: geo.calling || 'Unknown',       inline: true  },
        { name: '💱 Currency',       value: geo.currency|| 'Unknown',       inline: true  },
        { name: '🌐 ISP',            value: geo.isp     || 'Unknown',       inline: true  },
        { name: '🔌 ASN',            value: geo.asn     || 'Unknown',       inline: true  },
        { name: '📍 Coordinates',    value: geo.latitude && geo.longitude ? `${geo.latitude}, ${geo.longitude}` : 'Unknown', inline: true },
        { name: '🕐 Local Time',     value: localTime,                      inline: true  },
        { name: '🕰️ Timezone',       value: `${tz} (${tzOff})`,            inline: true  },
        { name: '📄 Page Visited',   value: page,                           inline: true  },
        { name: '🔢 Visit # (device)',value: `#${visits}`,                  inline: true  },
        { name: '🗣️ Browser Language',value: lang,                          inline: true  },
        { name: '🌐 Site Language',  value: savedLang.toUpperCase(),        inline: true  },
        { name: '🔗 Referrer',       value: ref.slice(0, 150),              inline: false },
      ],
      footer: { text: `A Mano A Mano — Visitor Log • ${now}` },
      timestamp: now,
    };

    /* ── EMBED 2: Device ── */
    const devFields = [
      { name: '📱 Device Type',     value: typeEmoji,                          inline: true },
      { name: '💻 OS',              value: osVer ? `${os} (${osVer})` : os,   inline: true },
      { name: '🏷️ Brand / Model',   value: brand || 'Unknown',                 inline: true },
      { name: '🌐 Browser',         value: bVer ? `${browser} v${bVer}` : browser, inline: true },
      { name: '📐 Screen',          value: hw.screenSize,                      inline: true },
      { name: '🖼️ Viewport',        value: hw.viewport,                        inline: true },
      { name: '🔍 Pixel Ratio',     value: hw.pixelRatio,                      inline: true },
      { name: '🎨 Color Depth',     value: hw.colorDepth,                      inline: true },
      { name: '📳 Orientation',     value: hw.orientation,                     inline: true },
      { name: '👆 Touch Support',   value: hw.touch,                           inline: true },
      { name: '⚙️ CPU Cores',       value: String(hw.cores),                   inline: true },
      { name: '💾 Device RAM',      value: hw.memory,                          inline: true },
      { name: '🖥️ Platform',        value: hw.platform,                        inline: true },
      { name: '📄 PDF Viewer',      value: hw.pdfViewer,                       inline: true },
      { name: '🛑 Do Not Track',    value: hw.dnt,                             inline: true },
      { name: '🌐 Languages',       value: hw.languages,                       inline: false },
    ];

    /* Battery */
    let battText = batt.bar + ' ' + batt.state;
    if (batt.chargeTime)    battText += ` • ${batt.chargeTime}`;
    if (batt.dischargeTime) battText += ` • ${batt.dischargeTime}`;
    devFields.push({ name: '🔋 Battery', value: battText, inline: false });

    /* Network */
    if (net) {
      devFields.push(
        { name: '📶 Connection',    value: net.type,     inline: true },
        { name: '⚡ Speed Grade',   value: net.speed,    inline: true },
        { name: '📥 Downlink',      value: net.downlink, inline: true },
        { name: '⏱️ Latency (RTT)', value: net.rtt,      inline: true },
        { name: '💾 Data Saver',    value: net.saveData, inline: true },
      );
    } else {
      devFields.push({ name: '📶 Network', value: 'Network Info API not available on this browser', inline: false });
    }

    /* WebGL */
    devFields.push(
      { name: '🎮 GPU Renderer', value: webgl.renderer.slice(0, 100) || 'Unknown', inline: false },
      { name: '🏭 GPU Vendor',   value: webgl.vendor.slice(0, 80)   || 'Unknown', inline: true  },
    );

    devFields.push({ name: '🕵️ User Agent', value: `\`${ua().slice(0, 250)}\``, inline: false });

    const embedDevice = {
      title: `📱 Device Info — ${typeEmoji}`,
      color: color,
      fields: devFields,
      footer: { text: 'A Mano A Mano — Device Log' },
    };

    /* ── EMBED 3: Security ── */
    const secColor = sec.isSuspicious ? 0xe74c3c : (sec.notices.length > 0 ? 0xe67e22 : 0x2ecc71);
    const secTitle = sec.isSuspicious
      ? '🚨 Security Alert — Suspicious Activity'
      : sec.notices.length > 0
        ? '⚠️ Security — Minor Flags'
        : '🔒 Security — Clean Visit';

    const secFields = sec.all.length > 0 ? sec.all : [
      { name: '✅ All Clear', value: 'No automation, no anomalies, no VPN mismatch detected.', inline: false },
    ];

    secFields.push(
      { name: '🤖 WebDriver',    value: navigator.webdriver ? '🚨 YES'  : '✅ No',  inline: true },
      { name: '🍪 Cookies',      value: navigator.cookieEnabled ? '✅ Yes' : '❌ No', inline: true },
      { name: '🛑 DNT',          value: hw.dnt,                                       inline: true },
    );

    const embedSec = {
      title: secTitle,
      color: secColor,
      fields: secFields,
      footer: { text: 'A Mano A Mano — Security Log' },
    };

    return [embedUser, embedDevice, embedSec];
  }

  /* ═══════════════════════════════════════
     SEND
  ═══════════════════════════════════════ */
  async function send() {
    try {
      const webhookUrl = (typeof AMM_CONFIG !== 'undefined') ? AMM_CONFIG.WEBHOOK_URL : '';
      if (!webhookUrl) return;
      const embeds = await buildEmbeds();
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username:   'AMM Visitor Tracker',
          avatar_url: 'https://i.imgur.com/AfFp7pu.png',
          embeds,
        }),
      });
    } catch (_) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', send);
  } else {
    send();
  }
})();
