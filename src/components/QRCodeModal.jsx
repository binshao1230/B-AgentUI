import React, { useState } from 'react';
import { X, Copy, Check, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { generateInboundUrl, generateClashMetaYaml, generateSingBoxJson } from '../utils/xrayHelper';

export default function QRCodeModal({ isOpen, onClose, inbound, showToast }) {
  const [activeTab, setActiveTab] = useState('url');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !inbound) return null;

  const nodeUrl = generateInboundUrl(inbound);
  const clashYaml = generateClashMetaYaml(inbound);
  const singBoxJson = generateSingBoxJson(inbound);

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast(`已复制 ${label} 到剪贴板！`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '620px' }} onClick={e => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <QrCode size={20} color="var(--primary)" /> 节点导出与订阅 - {inbound.remark}
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              协议: <strong style={{ color: 'var(--primary)', textTransform: 'uppercase' }}>{inbound.protocol}</strong> | 端口: <span className="font-mono">{inbound.port}</span>
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: 'rgba(10, 15, 26, 0.6)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          {[
            { id: 'url', label: '📱 标准节点链接 / 二维码' },
            { id: 'clash', label: '🛡️ Clash Meta (YAML)' },
            { id: 'singbox', label: '📦 Sing-Box (JSON)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.id ? '#050b14' : 'var(--text-muted)',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: activeTab === tab.id ? '600' : '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content: Standard URL & QR Code */}
        {activeTab === 'url' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            {/* QR Code Canvas Frame */}
            <div style={{ 
              background: '#ffffff', 
              padding: '16px', 
              borderRadius: '16px', 
              boxShadow: '0 0 30px rgba(0, 242, 254, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <QRCodeSVG value={nodeUrl} size={180} level="M" />
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              适用于 Shadowrocket、v2rayNG、Quantumult X、PassWall 扫码一键导入
            </p>

            {/* URL String Input & Copy */}
            <div style={{ width: '100%' }}>
              <div style={{ position: 'relative' }}>
                <textarea 
                  readOnly 
                  rows={3}
                  className="form-textarea font-mono" 
                  value={nodeUrl} 
                  style={{ fontSize: '0.78rem', wordBreak: 'break-all', paddingRight: '90px' }}
                />
                <button 
                  className="btn-primary btn-sm" 
                  onClick={() => handleCopy(nodeUrl, '节点链接')}
                  style={{ position: 'absolute', right: '10px', top: '10px' }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? '已复制' : '复制'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Clash Meta YAML */}
        {activeTab === 'clash' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Clash Meta / Mihomo 代理节点片段:</span>
              <button className="btn-primary btn-sm" onClick={() => handleCopy(clashYaml, 'Clash 配置')}>
                <Copy size={14} /> 复制 Clash YAML
              </button>
            </div>
            <pre style={{ 
              background: '#0f172a', 
              border: '1px solid #334155', 
              borderRadius: '10px', 
              padding: '14px', 
              fontSize: '0.8rem', 
              color: '#38bdf8', 
              overflowX: 'auto',
              maxHeight: '260px'
            }} className="font-mono">
              {clashYaml}
            </pre>
          </div>
        )}

        {/* Tab Content: Sing-Box JSON */}
        {activeTab === 'singbox' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Sing-Box 1.8+ 出站 JSON 片段:</span>
              <button className="btn-primary btn-sm" onClick={() => handleCopy(singBoxJson, 'Sing-Box 配置')}>
                <Copy size={14} /> 复制 Sing-Box JSON
              </button>
            </div>
            <pre style={{ 
              background: '#0f172a', 
              border: '1px solid #334155', 
              borderRadius: '10px', 
              padding: '14px', 
              fontSize: '0.8rem', 
              color: '#a78bfa', 
              overflowX: 'auto',
              maxHeight: '260px'
            }} className="font-mono">
              {singBoxJson}
            </pre>
          </div>
        )}

        {/* Modal Footer */}
        <div style={{ marginTop: '20px', textAlign: 'right' }}>
          <button className="btn-secondary" onClick={onClose}>关闭</button>
        </div>

      </div>
    </div>
  );
}
