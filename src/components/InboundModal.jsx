import React, { useState, useEffect } from 'react';
import { X, Sparkles, Shield, RefreshCw, Check, FileText } from 'lucide-react';
import { generateUUID, generateRealityKeyPair, generateShortId } from '../utils/xrayHelper';

// 3X-UI 官方经典推荐模板全集
const THREE_X_UI_TEMPLATES = [
  {
    id: 'vless_reality_vision',
    name: '⚡ VLESS-REALITY-Vision (3X-UI 最新防封/极高隐蔽)',
    protocol: 'vless',
    remark: 'VLESS-REALITY-Vision',
    port: 443,
    network: 'tcp',
    security: 'reality',
    sni: 'dl.google.com',
    fingerprint: 'chrome',
    flow: 'xtls-rprx-vision',
    path: '/vless-ws-path',
    password: '',
  },
  {
    id: 'vmess_ws_tls',
    name: '🔮 VMess-WS-TLS (3X-UI 经典 CDN 伪装加速)',
    protocol: 'vmess',
    remark: 'VMess-WS-TLS',
    port: 2083,
    network: 'ws',
    security: 'tls',
    sni: 'cloudflare.com',
    fingerprint: 'chrome',
    flow: '',
    path: '/vmess-ws-path',
    password: '',
  },
  {
    id: 'trojan_grpc_tls',
    name: '🛡️ Trojan-gRPC-TLS (3X-UI 高并发低延迟模式)',
    protocol: 'trojan',
    remark: 'Trojan-gRPC-TLS',
    port: 8443,
    network: 'grpc',
    security: 'tls',
    sni: 'apple.com',
    fingerprint: 'chrome',
    flow: '',
    path: '/trojan-grpc-path',
    password: '',
  },
  {
    id: 'ss_2022_aead',
    name: '🔑 Shadowsocks-2022 (3X-UI 强 AEAD 加密算法)',
    protocol: 'shadowsocks',
    remark: 'SS2022-AEAD-Blake3',
    port: 18388,
    network: 'tcp',
    security: 'none',
    method: '2022-blake3-aes-128-gcm',
    sni: '',
    fingerprint: '',
    flow: '',
    path: '',
    password: '',
  },
  {
    id: 'hysteria2_quic',
    name: '🚀 Hysteria 2 (3X-UI UDP/QUIC 弱网暴拉极速)',
    protocol: 'hysteria2',
    remark: 'Hysteria2-QUIC-UDP',
    port: 30443,
    network: 'udp',
    security: 'none',
    sni: 'bing.com',
    fingerprint: '',
    flow: '',
    path: '',
    password: '',
  },
  {
    id: 'vless_grpc_reality',
    name: '🌐 VLESS-gRPC-REALITY (3X-UI 多路复用防护)',
    protocol: 'vless',
    remark: 'VLESS-gRPC-REALITY',
    port: 443,
    network: 'grpc',
    security: 'reality',
    sni: 'microsoft.com',
    fingerprint: 'chrome',
    flow: '',
    path: '/vless-grpc-service',
    password: '',
  }
];

export default function InboundModal({ isOpen, onClose, onSave, editingInbound }) {
  const [formData, setFormData] = useState({
    remark: '',
    protocol: 'vless',
    port: 443,
    network: 'tcp',
    security: 'reality',
    sni: 'dl.google.com',
    publicKey: '',
    privateKey: '',
    shortId: '',
    fingerprint: 'chrome',
    flow: 'xtls-rprx-vision',
    path: '/ws-path',
    password: '',
    method: '2022-blake3-aes-128-gcm',
    totalLimitGB: 500,
    clientEmail: 'user@3xui.lite',
    clientUuid: ''
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [templateLoadedMsg, setTemplateLoadedMsg] = useState(null);

  // 套用 3X-UI 经典模板
  const applyTemplateById = (templateId, notify = true) => {
    const tpl = THREE_X_UI_TEMPLATES.find(t => t.id === templateId) || THREE_X_UI_TEMPLATES[0];
    setSelectedTemplateId(templateId);

    const { publicKey, privateKey } = generateRealityKeyPair();
    const newUuid = generateUUID();
    const newPassword = tpl.protocol === 'trojan' ? 'Trojan_' + generateShortId() :
                        tpl.protocol === 'shadowsocks' ? 'SS2022_' + generateShortId() :
                        tpl.protocol === 'hysteria2' ? 'Hy2_' + generateShortId() : '';

    setFormData(prev => ({
      ...prev,
      remark: tpl.remark + '-' + Math.floor(Math.random() * 90 + 10),
      protocol: tpl.protocol,
      port: tpl.port || Math.floor(Math.random() * 30000) + 10000,
      network: tpl.network,
      security: tpl.security,
      sni: tpl.sni,
      fingerprint: tpl.fingerprint,
      flow: tpl.flow,
      path: tpl.path,
      method: tpl.method || '2022-blake3-aes-128-gcm',
      password: newPassword,
      publicKey: tpl.security === 'reality' ? publicKey : '',
      privateKey: tpl.security === 'reality' ? privateKey : '',
      shortId: tpl.security === 'reality' ? generateShortId() : '',
      clientUuid: newUuid
    }));

    if (notify) {
      setTemplateLoadedMsg(`✨ 已成功套用 3X-UI [${tpl.remark}] 预设配置模板！`);
      setTimeout(() => setTemplateLoadedMsg(null), 3000);
    }
  };

  useEffect(() => {
    if (editingInbound) {
      setFormData({
        id: editingInbound.id,
        remark: editingInbound.remark || '',
        protocol: editingInbound.protocol || 'vless',
        port: editingInbound.port || 443,
        network: editingInbound.network || 'tcp',
        security: editingInbound.security || 'none',
        sni: editingInbound.sni || '',
        publicKey: editingInbound.publicKey || '',
        privateKey: editingInbound.privateKey || '',
        shortId: editingInbound.shortId || '',
        fingerprint: editingInbound.fingerprint || 'chrome',
        flow: editingInbound.flow || 'none',
        path: editingInbound.path || '/ws-path',
        password: editingInbound.password || '',
        method: editingInbound.method || '2022-blake3-aes-128-gcm',
        totalLimitGB: editingInbound.totalLimit ? Math.round(editingInbound.totalLimit / (1024 * 1024 * 1024)) : 0,
        clientEmail: editingInbound.clients?.[0]?.email || 'user@3xui.lite',
        clientUuid: editingInbound.clients?.[0]?.id || generateUUID()
      });
    } else {
      // 默认使用 3X-UI 官方 VLESS-REALITY 模板初始化
      applyTemplateById('vless_reality_vision', false);
    }
  }, [editingInbound, isOpen]);

  if (!isOpen) return null;

  const handleGenerateRealityKeys = () => {
    const { publicKey, privateKey } = generateRealityKeyPair();
    setFormData(prev => ({
      ...prev,
      publicKey,
      privateKey,
      shortId: generateShortId()
    }));
  };

  const handleGenerateUuid = () => {
    setFormData(prev => ({ ...prev, clientUuid: generateUUID() }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 构造 Xray 标准节点对象
    const inboundData = {
      id: editingInbound?.id || Date.now(),
      remark: formData.remark,
      protocol: formData.protocol,
      port: parseInt(formData.port, 10),
      network: formData.network,
      security: formData.security,
      sni: formData.sni,
      publicKey: formData.publicKey,
      privateKey: formData.privateKey,
      shortId: formData.shortId,
      fingerprint: formData.fingerprint,
      flow: formData.flow,
      path: formData.path,
      password: formData.password,
      method: formData.method,
      totalLimit: formData.totalLimitGB > 0 ? formData.totalLimitGB * 1024 * 1024 * 1024 : 0,
      enable: editingInbound ? editingInbound.enable : true,
      up: editingInbound ? editingInbound.up : 0,
      down: editingInbound ? editingInbound.down : 0,
      clients: [
        {
          id: (formData.protocol === 'trojan' || formData.protocol === 'shadowsocks' || formData.protocol === 'hysteria2') ? formData.password : formData.clientUuid,
          email: formData.clientEmail
        }
      ]
    };

    onSave(inboundData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="var(--primary)" />
            {editingInbound ? `修改 Xray 入站节点 [${editingInbound.remark}]` : '创建 Xray 入站节点配置 (参考 3X-UI 标准模板)'}
          </h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* 3X-UI 预设模板选择条 */}
        <div style={{ background: 'rgba(2, 132, 199, 0.08)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(2, 132, 199, 0.25)', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.825rem', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={15} /> 📋 快速套用 3X-UI 预设配置模板
            </label>
            {templateLoadedMsg && (
              <span style={{ fontSize: '0.72rem', color: 'var(--accent-emerald)', fontWeight: '600' }}>
                {templateLoadedMsg}
              </span>
            )}
          </div>

          <select
            className="form-select"
            value={selectedTemplateId}
            onChange={e => applyTemplateById(e.target.value, true)}
            style={{ fontSize: '0.825rem', padding: '6px 10px' }}
          >
            {THREE_X_UI_TEMPLATES.map(tpl => (
              <option key={tpl.id} value={tpl.id}>
                {tpl.name}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* 基本属性配置区 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="form-label">节点备注名称 (Remark)</label>
              <input 
                type="text" 
                className="form-input" 
                required
                value={formData.remark}
                onChange={e => setFormData({ ...formData, remark: e.target.value })}
                placeholder="例如: HK-VLESS-Reality-01"
              />
            </div>

            <div>
              <label className="form-label">协议类型 (Protocol)</label>
              <select 
                className="form-select" 
                value={formData.protocol}
                onChange={e => {
                  const p = e.target.value;
                  let update = { protocol: p };
                  if (p === 'vless') {
                    update = { ...update, security: 'reality', network: 'tcp', flow: 'xtls-rprx-vision' };
                  } else if (p === 'vmess') {
                    update = { ...update, security: 'tls', network: 'ws', path: '/vmess-ws-path' };
                  } else if (p === 'trojan') {
                    update = { ...update, security: 'tls', network: 'grpc', password: 'Trojan_' + generateShortId() };
                  } else if (p === 'shadowsocks') {
                    update = { ...update, security: 'none', network: 'tcp', method: '2022-blake3-aes-128-gcm', password: 'SS2022_' + generateShortId() };
                  } else if (p === 'hysteria2') {
                    update = { ...update, security: 'none', network: 'udp', password: 'Hy2_' + generateShortId() };
                  }
                  setFormData(prev => ({ ...prev, ...update }));
                }}
              >
                <option value="vless">⚡ VLESS (REALITY防封 / xtls-rprx-vision)</option>
                <option value="vmess">🔮 VMess (WebSocket + TLS / CDN)</option>
                <option value="trojan">🛡️ Trojan (TLS域名伪装 / gRPC)</option>
                <option value="shadowsocks">🔑 Shadowsocks-2022 (AEAD强加密算法)</option>
                <option value="hysteria2">🚀 Hysteria 2 (UDP / QUIC 弱网极速)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            <div>
              <label className="form-label">监听端口 (Port)</label>
              <input 
                type="number" 
                className="form-input font-mono" 
                required
                value={formData.port}
                onChange={e => setFormData({ ...formData, port: e.target.value })}
              />
            </div>

            <div>
              <label className="form-label">安全类型 (Security)</label>
              <select 
                className="form-select" 
                value={formData.security}
                onChange={e => setFormData({ ...formData, security: e.target.value })}
              >
                {formData.protocol === 'vless' && <option value="reality">REALITY (最新伪装)</option>}
                <option value="tls">TLS 证书保护</option>
                <option value="none">None (无安全层)</option>
              </select>
            </div>

            <div>
              <label className="form-label">传输网络 (Network)</label>
              <select 
                className="form-select" 
                value={formData.network}
                onChange={e => setFormData({ ...formData, network: e.target.value })}
              >
                <option value="tcp">TCP</option>
                <option value="ws">WebSocket (WS)</option>
                <option value="grpc">gRPC</option>
                <option value="udp">UDP (Hysteria 2)</option>
              </select>
            </div>
          </div>

          {/* VLESS REALITY 专属配置 */}
          {formData.protocol === 'vless' && formData.security === 'reality' && (
            <div style={{ background: 'var(--input-bg)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Shield size={16} /> REALITY 伪装与加密参数 (3X-UI 标准)
                </span>
                <button type="button" className="btn-secondary btn-sm" onClick={handleGenerateRealityKeys}>
                  <RefreshCw size={12} /> 一键重新生成密钥
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">SNI 伪装目标域名</label>
                  <input type="text" className="form-input font-mono" value={formData.sni} onChange={e => setFormData({ ...formData, sni: e.target.value })} placeholder="dl.google.com" />
                </div>

                <div>
                  <label className="form-label">流控控速 (Flow)</label>
                  <select className="form-select font-mono" value={formData.flow} onChange={e => setFormData({ ...formData, flow: e.target.value })}>
                    <option value="xtls-rprx-vision">xtls-rprx-vision (推荐)</option>
                    <option value="none">none</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">公钥 (Public Key)</label>
                  <input type="text" className="form-input font-mono" value={formData.publicKey} onChange={e => setFormData({ ...formData, publicKey: e.target.value })} />
                </div>
                <div>
                  <label className="form-label">私钥 (Private Key)</label>
                  <input type="text" className="form-input font-mono" value={formData.privateKey} onChange={e => setFormData({ ...formData, privateKey: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="form-label">Short ID (简短 ID)</label>
                <input type="text" className="form-input font-mono" value={formData.shortId} onChange={e => setFormData({ ...formData, shortId: e.target.value })} />
              </div>
            </div>
          )}

          {/* Shadowsocks 2022 加密算法 */}
          {formData.protocol === 'shadowsocks' && (
            <div style={{ background: 'var(--input-bg)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label className="form-label">AEAD 加密方法 (Method)</label>
              <select className="form-select font-mono" value={formData.method} onChange={e => setFormData({ ...formData, method: e.target.value })}>
                <option value="2022-blake3-aes-128-gcm">2022-blake3-aes-128-gcm</option>
                <option value="2022-blake3-aes-256-gcm">2022-blake3-aes-256-gcm</option>
                <option value="2022-blake3-chacha20-poly1305">2022-blake3-chacha20-poly1305</option>
              </select>
            </div>
          )}

          {/* 密码与 UUID 凭据 */}
          {(formData.protocol === 'trojan' || formData.protocol === 'shadowsocks' || formData.protocol === 'hysteria2') ? (
            <div>
              <label className="form-label">连接验证密码 (Password)</label>
              <input type="text" className="form-input font-mono" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label className="form-label" style={{ margin: 0 }}>客户端 User UUID</label>
                <button type="button" className="btn-secondary btn-sm" onClick={handleGenerateUuid}>
                  <RefreshCw size={12} /> 重新生成 UUID
                </button>
              </div>
              <input type="text" className="form-input font-mono" value={formData.clientUuid} onChange={e => setFormData({ ...formData, clientUuid: e.target.value })} />
            </div>
          )}

          {/* WS Path */}
          {formData.network === 'ws' && (
            <div>
              <label className="form-label">WebSocket 路径 (WS Path)</label>
              <input type="text" className="form-input font-mono" value={formData.path} onChange={e => setFormData({ ...formData, path: e.target.value })} placeholder="/ws-path" />
            </div>
          )}

          {/* 流量限制 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label className="form-label">配额上限 (GB, 0 表示无限制)</label>
              <input type="number" className="form-input font-mono" value={formData.totalLimitGB} onChange={e => setFormData({ ...formData, totalLimitGB: parseInt(e.target.value, 10) || 0 })} />
            </div>
            <div>
              <label className="form-label">客户端标识 Email</label>
              <input type="text" className="form-input font-mono" value={formData.clientEmail} onChange={e => setFormData({ ...formData, clientEmail: e.target.value })} />
            </div>
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn-primary">
              <Check size={16} /> {editingInbound ? '保存节点修改' : '确认创建节点'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
