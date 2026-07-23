// Xray Protocol Helpers & Link Generators for 3X-UI Lite

export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function generateShortId() {
  const chars = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateRealityKeyPair() {
  // Generate random base64-url-safe keypair strings for REALITY simulation
  const randomBytes = (len) => Array.from({length: len}, () => Math.floor(Math.random() * 256));
  const toBase64Url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  
  const privateKey = toBase64Url(randomBytes(32));
  const publicKey = toBase64Url(randomBytes(32));
  return { privateKey, publicKey };
}

export function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let i = Math.floor(Math.log(bytes) / Math.log(k));
  if (i < 0) i = 0;
  if (i >= sizes.length) i = sizes.length - 1;
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Generate Protocol Subscription URLs (vless://, vmess://, etc.)
export function generateInboundUrl(inbound, host = window.location.hostname || '127.0.0.1') {
  const remark = encodeURIComponent(`${inbound.remark} [3X-Lite]`);
  const clientUuid = inbound.clients?.[0]?.id || generateUUID();

  if (inbound.protocol === 'vless') {
    let netParams = '';
    if (inbound.network === 'ws' && inbound.path) netParams += `&path=${encodeURIComponent(inbound.path)}`;
    if (inbound.network === 'grpc' && inbound.serviceName) netParams += `&serviceName=${encodeURIComponent(inbound.serviceName)}`;

    if (inbound.security === 'reality') {
      const pbk = inbound.publicKey || '0123456789abcdef0123456789abcdef01234567';
      const sni = inbound.sni || 'dl.google.com';
      const sid = inbound.shortId || 'a1b2c3d4';
      const fp = inbound.fingerprint || 'chrome';
      const flow = inbound.flow || 'xtls-rprx-vision';
      return `vless://${clientUuid}@${host}:${inbound.port}?type=${inbound.network}&security=reality&pbk=${pbk}&fp=${fp}&sni=${sni}&sid=${sid}&flow=${flow}${netParams}#${remark}`;
    } else if (inbound.security === 'tls') {
      return `vless://${clientUuid}@${host}:${inbound.port}?type=${inbound.network}&security=tls&sni=${inbound.sni || host}${netParams}#${remark}`;
    } else {
      return `vless://${clientUuid}@${host}:${inbound.port}?type=${inbound.network}&security=none${netParams}#${remark}`;
    }
  } 
  
  if (inbound.protocol === 'vmess') {
    const vmessConfig = {
      v: "2",
      ps: `${inbound.remark} [3X-Lite]`,
      add: host,
      port: inbound.port,
      id: clientUuid,
      aid: 0,
      scy: "auto",
      net: inbound.network,
      type: "none",
      host: inbound.sni || "",
      path: inbound.path || "/",
      tls: inbound.security === 'tls' ? "tls" : "",
      sni: inbound.sni || ""
    };
    return "vmess://" + btoa(unescape(encodeURIComponent(JSON.stringify(vmessConfig))));
  }

  if (inbound.protocol === 'trojan') {
    const pass = inbound.password || clientUuid;
    const sni = inbound.sni || host;
    let netParams = '';
    if (inbound.network === 'ws' && inbound.path) netParams += `&path=${encodeURIComponent(inbound.path)}`;
    if (inbound.network === 'grpc' && inbound.serviceName) netParams += `&serviceName=${encodeURIComponent(inbound.serviceName)}`;
    return `trojan://${pass}@${host}:${inbound.port}?type=${inbound.network}&security=tls&sni=${sni}${netParams}#${remark}`;
  }

  if (inbound.protocol === 'shadowsocks') {
    const method = inbound.method || '2022-blake3-aes-128-gcm';
    const pass = inbound.password || 'secretPass123';
    const userinfo = btoa(unescape(encodeURIComponent(`${method}:${pass}`)));
    return `ss://${userinfo}@${host}:${inbound.port}#${remark}`;
  }

  if (inbound.protocol === 'hysteria2') {
    const auth = inbound.password || 'secretPass123';
    const sni = inbound.sni || host;
    return `hysteria2://${auth}@${host}:${inbound.port}?insecure=1&sni=${sni}#${remark}`;
  }

  return `vless://${clientUuid}@${host}:${inbound.port}#${remark}`;
}

// Generate Clash Meta YAML configuration snippet
export function generateClashMetaYaml(inbound, host = window.location.hostname || '127.0.0.1') {
  const clientUuid = inbound.clients?.[0]?.id || generateUUID();
  const name = `${inbound.remark} - ${inbound.protocol.toUpperCase()}`;

  if (inbound.protocol === 'vless') {
    return `proxies:
  - name: "${name}"
    type: vless
    server: ${host}
    port: ${inbound.port}
    uuid: ${clientUuid}
    udp: true
    tls: ${inbound.security === 'reality' || inbound.security === 'tls'}
    flow: ${inbound.flow || 'xtls-rprx-vision'}
    servername: ${inbound.sni || 'dl.google.com'}
    reality-opts:
      public-key: ${inbound.publicKey || ''}
      short-id: ${inbound.shortId || ''}
    client-fingerprint: ${inbound.fingerprint || 'chrome'}`;
  }

  return `# Clash Meta Config for ${name}
proxies:
  - name: "${name}"
    type: ${inbound.protocol}
    server: ${host}
    port: ${inbound.port}
    uuid: ${clientUuid}
    udp: true`;
}

// Generate Sing-Box JSON outbound snippet
export function generateSingBoxJson(inbound, host = window.location.hostname || '127.0.0.1') {
  const clientUuid = inbound.clients?.[0]?.id || generateUUID();
  
  const outbound = {
    type: inbound.protocol,
    tag: `${inbound.remark}-out`,
    server: host,
    server_port: inbound.port,
    uuid: clientUuid,
    flow: inbound.flow || undefined,
    tls: (inbound.security === 'reality' || inbound.security === 'tls') ? {
      enabled: true,
      server_name: inbound.sni || 'dl.google.com',
      utls: {
        enabled: true,
        fingerprint: inbound.fingerprint || 'chrome'
      },
      reality: inbound.security === 'reality' ? {
        enabled: true,
        public_key: inbound.publicKey || '',
        short_id: inbound.shortId || ''
      } : undefined
    } : undefined
  };

  return JSON.stringify({ outbounds: [outbound] }, null, 2);
}

// Initial Preset Inbounds Data
export const initialInbounds = [
  {
    id: 1,
    remark: "HK-VLESS-Reality-Vision",
    protocol: "vless",
    port: 443,
    network: "tcp",
    security: "reality",
    enable: true,
    up: 1425890012, // ~1.4GB
    down: 18459200400, // ~18.4GB
    totalLimit: 536870912000, // 500GB
    expiryTime: Date.now() + 86400000 * 30, // 30 days later
    sni: "dl.google.com",
    publicKey: "q8A-H_1vXzQpL7N0K_3mF-s9yW4eR2tU5iV8oP1zX4A",
    privateKey: "eP1zX4A_q8A-H_1vXzQpL7N0K_3mF-s9yW4eR2tU5iV",
    shortId: "6a8b9c1d",
    fingerprint: "chrome",
    flow: "xtls-rprx-vision",
    clients: [
      { id: "e4d3c2b1-1234-4567-89ab-cdef01234567", email: "user01@3xui.lite", enable: true, up: 512000000, down: 4200000000 }
    ]
  },
  {
    id: 2,
    remark: "US-VMess-WebSocket-TLS",
    protocol: "vmess",
    port: 2083,
    network: "ws",
    path: "/vmess-ws-path",
    security: "tls",
    enable: true,
    up: 842100900,
    down: 9120400100,
    totalLimit: 1073741824000, // 1TB
    expiryTime: Date.now() + 86400000 * 60,
    sni: "cloudflare.com",
    clients: [
      { id: "a1b2c3d4-5678-90ab-cdef-1234567890ab", email: "user02@3xui.lite", enable: true, up: 210000000, down: 1800000000 }
    ]
  },
  {
    id: 3,
    remark: "JP-Trojan-gRPC-Speed",
    protocol: "trojan",
    port: 8443,
    network: "grpc",
    security: "tls",
    enable: true,
    up: 312004000,
    down: 4120900300,
    totalLimit: 0, // unlimited
    expiryTime: 0,
    sni: "apple.com",
    password: "TrojanSecurePass2026",
    clients: [
      { id: "TrojanSecurePass2026", email: "vip_user@3xui.lite", enable: true, up: 312004000, down: 4120900300 }
    ]
  },
  {
    id: 4,
    remark: "SG-Hysteria2-QUIC-UDP",
    protocol: "hysteria2",
    port: 30443,
    network: "udp",
    security: "none",
    enable: true,
    up: 1980000000,
    down: 28400000000,
    totalLimit: 2147483648000, // 2TB
    expiryTime: Date.now() + 86400000 * 15,
    password: "Hys2Passcode998",
    sni: "bing.com",
    clients: [
      { id: "Hys2Passcode998", email: "gaming_user@3xui.lite", enable: true, up: 1980000000, down: 28400000000 }
    ]
  }
];
