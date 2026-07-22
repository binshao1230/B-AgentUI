import React, { useState } from 'react';
import { Shield, Globe, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

export default function RoutingRules({ showToast }) {
  const [presetRules, setPresetRules] = useState([
    { id: 1, name: '全杀广告与追踪器 (GeoSite Ads)', category: 'geosite:category-ads-all', action: 'block', enabled: true, desc: '自动拦截绝大多数网络广告、数据追踪及恶意分析节点' },
    { id: 2, name: 'P2P / BT 种子下载拦截', category: 'protocol: bittorrent', action: 'block', enabled: true, desc: '防止 VPS IP 因 BT 违规下载导致被机房封禁或收到投诉信' },
    { id: 3, name: '中国大陆 IP 域名直连 (CN Direct)', category: 'geoip:cn, geosite:cn', action: 'direct', enabled: true, desc: '国内流量不经过代理，提升访问速度并节省服务器流量' },
    { id: 4, name: '局域网与私有 IP 直连 (LAN Private)', category: 'geoip:private', action: 'direct', enabled: true, desc: '127.0.0.1, 192.168.x.x 等私有网段直连' },
    { id: 5, name: '赌博与高风险欺诈站点拦截', category: 'geosite:gambling', action: 'block', enabled: false, desc: '屏蔽已知的涉赌与钓鱼风险网站' }
  ]);

  const [customRules, setCustomRules] = useState([
    { id: 101, domain: 'google.com, github.com', outbound: 'proxy' }
  ]);

  const [newDomain, setNewDomain] = useState('');
  const [newOutbound, setNewOutbound] = useState('proxy');

  const togglePresetRule = (id) => {
    setPresetRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
    showToast('已更新路由分流规则策略');
  };

  const handleAddCustomRule = (e) => {
    e.preventDefault();
    if (!newDomain.trim()) return;

    setCustomRules(prev => [...prev, { id: Date.now(), domain: newDomain.trim(), outbound: newOutbound }]);
    setNewDomain('');
    showToast('已添加自定义路由分流规则！');
  };

  const handleDeleteCustomRule = (id) => {
    setCustomRules(prev => prev.filter(r => r.id !== id));
    showToast('已删除路由规则');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Preset Security One-Click Rules */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={20} color="var(--primary)" /> 预置安全分流策略 (Preset Security Rules)
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            基于 GeoIP / GeoSite 规则库进行秒级精确拦截与直连策略
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {presetRules.map(rule => (
            <div 
              key={rule.id} 
              className="glass-card" 
              style={{ 
                padding: '16px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: rule.enabled ? 'var(--bg-card)' : 'var(--input-bg)',
                borderColor: rule.enabled ? 'var(--border-glow)' : 'var(--border-color)',
                opacity: rule.enabled ? 1 : 0.7
              }}
            >
              <div style={{ flex: 1, paddingRight: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)' }}>{rule.name}</h4>
                  <span className="badge" style={{ 
                    background: rule.action === 'block' ? '#ffe4e6' : '#d1fae5',
                    color: rule.action === 'block' ? '#be123c' : '#047857',
                    border: rule.action === 'block' ? '1px solid #fecdd3' : '1px solid #a7f3d0',
                    fontSize: '0.7rem'
                  }}>
                    {rule.action.toUpperCase()}
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>{rule.desc}</p>
                <div className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600', marginTop: '6px' }}>
                  {rule.category}
                </div>
              </div>

              <button 
                onClick={() => togglePresetRule(rule.id)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: rule.enabled ? 'var(--primary)' : 'var(--text-dim)' }}
              >
                {rule.enabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Domain/IP Routing Rules Form & List */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={20} color="var(--accent-purple)" /> 自定义域名 / IP 路由规则
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            添加自定义域名、IP网段或规则标识（多个用逗号隔开）
          </p>
        </div>

        {/* Add New Rule Form */}
        <form onSubmit={handleAddCustomRule} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <input 
            type="text" 
            className="form-input font-mono" 
            placeholder="例如: openai.com, api.anthropic.com, 1.1.1.1" 
            value={newDomain}
            onChange={e => setNewDomain(e.target.value)}
            style={{ flex: 2, minWidth: '240px' }}
          />

          <select 
            className="form-select"
            value={newOutbound}
            onChange={e => setNewOutbound(e.target.value)}
            style={{ flex: 1, minWidth: '130px' }}
          >
            <option value="proxy">Proxy (代理)</option>
            <option value="direct">Direct (直连)</option>
            <option value="block">Block (拦截)</option>
          </select>

          <button type="submit" className="btn-primary">
            <Plus size={18} /> 添加规则
          </button>
        </form>

        {/* Custom Rules List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {customRules.map(rule => (
            <div 
              key={rule.id} 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                background: 'var(--input-bg)', 
                padding: '12px 16px', 
                borderRadius: '10px',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="font-mono" style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: '600' }}>
                  {rule.domain}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span className="badge" style={{ 
                  background: rule.outbound === 'proxy' ? '#e0f2fe' : rule.outbound === 'direct' ? '#d1fae5' : '#ffe4e6',
                  color: rule.outbound === 'proxy' ? '#0369a1' : rule.outbound === 'direct' ? '#047857' : '#be123c',
                  border: rule.outbound === 'proxy' ? '1px solid #bae6fd' : rule.outbound === 'direct' ? '1px solid #a7f3d0' : '1px solid #fecdd3'
                }}>
                  ➔ {rule.outbound.toUpperCase()}
                </span>
                <button 
                  onClick={() => handleDeleteCustomRule(rule.id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
