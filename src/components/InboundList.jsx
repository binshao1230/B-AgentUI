import React, { useState } from 'react';
import { 
  Plus, Search, QrCode, Edit3, Trash2, Power, RotateCcw, 
  Shield, Network, HardDrive, Copy
} from 'lucide-react';
import { formatBytes } from '../utils/xrayHelper';

export default function InboundList({ 
  inbounds, 
  onToggleInbound, 
  onResetTraffic, 
  onDeleteInbound, 
  onOpenAddModal, 
  onOpenEditModal,
  onOpenQRModal,
  showToast 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProtocol, setSelectedProtocol] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Filter inbounds logic
  const filteredInbounds = inbounds.filter(item => {
    const matchesSearch = item.remark.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.port.toString().includes(searchQuery) ||
                          item.protocol.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProtocol = selectedProtocol === 'all' || item.protocol === selectedProtocol;
    const matchesStatus = selectedStatus === 'all' || 
                          (selectedStatus === 'enabled' && item.enable) ||
                          (selectedStatus === 'disabled' && !item.enable);

    return matchesSearch && matchesProtocol && matchesStatus;
  });

  const getProtocolBadgeClass = (protocol) => {
    switch (protocol.toLowerCase()) {
      case 'vless': return 'badge-vless';
      case 'vmess': return 'badge-vmess';
      case 'trojan': return 'badge-trojan';
      case 'shadowsocks': return 'badge-shadowsocks';
      case 'hysteria2': return 'badge-hysteria';
      default: return 'badge-vless';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Filter & Action Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Left: Search & Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', flex: 1, minWidth: '280px' }}>
          
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="搜索节点名称 / 端口 / 协议..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              />
          </div>

          {/* Protocol Filter Tabs */}
          <div style={{ display: 'flex', background: 'var(--input-bg)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            {['all', 'vless', 'vmess', 'trojan', 'shadowsocks', 'hysteria2'].map(proto => (
              <button
                key={proto}
                onClick={() => setSelectedProtocol(proto)}
                style={{
                  background: selectedProtocol === proto ? 'var(--primary)' : 'transparent',
                  color: selectedProtocol === proto ? '#ffffff' : 'var(--text-muted)',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '7px',
                  fontSize: '0.8rem',
                  fontWeight: selectedProtocol === proto ? '600' : '500',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  transition: 'all 0.2s ease'
                }}
              >
                {proto}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select 
            className="form-select font-mono" 
            style={{ width: 'auto', padding: '6px 28px 6px 12px', fontSize: '0.8rem' }} 
            value={selectedStatus} 
            onChange={e => setSelectedStatus(e.target.value)}
          >
            <option value="all">所有状态</option>
            <option value="enabled">运行中 (Enabled)</option>
            <option value="disabled">已暂停 (Disabled)</option>
          </select>

        </div>

        {/* Right: Add New Inbound */}
        <button className="btn-primary" onClick={onOpenAddModal}>
          <Plus size={18} /> 新建入站节点
        </button>

      </div>

      {/* Inbounds Cards Grid */}
      {filteredInbounds.length === 0 ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1rem' }}>没有找到匹配的 Xray 入站节点</p>
          <button className="btn-secondary" style={{ marginTop: '16px' }} onClick={onOpenAddModal}>
            点击新建节点
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {filteredInbounds.map(inbound => {
            const usedTraffic = (inbound.up || 0) + (inbound.down || 0);
            const totalLimit = inbound.totalLimit || 0;
            const usagePercent = totalLimit > 0 ? Math.min(100, Math.round((usedTraffic / totalLimit) * 100)) : 0;
            
            return (
              <div 
                key={inbound.id} 
                className="glass-card glass-card-interactive" 
                style={{ 
                  padding: '20px', 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '16px',
                  opacity: inbound.enable ? 1 : 0.65,
                  borderLeft: inbound.enable ? '3px solid var(--primary)' : '3px solid var(--text-dim)'
                }}
              >
                {/* Header: Status, Title, Protocol Badge & Port */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className={`pulse-dot ${inbound.enable ? 'online' : 'offline'}`} />
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {inbound.remark}
                      </h4>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center' }}>
                        <span className={`badge ${getProtocolBadgeClass(inbound.protocol)}`}>
                          {inbound.protocol.toUpperCase()}
                        </span>
                        <span className="font-mono" style={{ fontSize: '0.75rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: '4px', color: 'var(--primary)', fontWeight: '600' }}>
                          Port: {inbound.port}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Enable / Disable Switch Toggle */}
                  <button 
                    onClick={() => onToggleInbound(inbound.id)}
                    title={inbound.enable ? "禁用节点" : "启用节点"}
                    style={{
                      background: inbound.enable ? 'rgba(16, 185, 129, 0.12)' : 'var(--input-bg)',
                      border: inbound.enable ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
                      color: inbound.enable ? 'var(--accent-emerald)' : 'var(--text-dim)',
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Power size={18} />
                  </button>
                </div>

                {/* Transport & Security Meta Tags */}
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.78rem', color: 'var(--text-muted)', background: 'var(--input-bg)', border: '1px solid var(--border-color)', padding: '8px 12px', borderRadius: '8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Network size={13} color="var(--primary)" /> 传输: <strong style={{ color: 'var(--text-main)', textTransform: 'uppercase' }}>{inbound.network}</strong>
                  </span>
                  <span style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Shield size={13} color="var(--accent-purple)" /> 安全: <strong style={{ color: 'var(--text-main)', textTransform: 'uppercase' }}>{inbound.security}</strong>
                  </span>
                  {inbound.sni && (
                    <span style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      SNI: <span className="font-mono" style={{ color: 'var(--text-main)' }}>{inbound.sni}</span>
                    </span>
                  )}
                </div>

                {/* Traffic Usage Progress */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <HardDrive size={14} /> 已用流量: <span className="font-mono" style={{ color: 'var(--text-main)', fontWeight: '600' }}>{formatBytes(usedTraffic)}</span>
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      限额: <span className="font-mono">{totalLimit === 0 ? '不限流量' : formatBytes(totalLimit)}</span>
                    </span>
                  </div>
                  
                  {totalLimit > 0 && (
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${usagePercent}%`, 
                        height: '100%', 
                        background: usagePercent > 90 ? 'var(--accent-rose)' : usagePercent > 70 ? 'var(--accent-amber)' : 'var(--primary)',
                        transition: 'width 0.4s ease'
                      }} />
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
                  
                  {/* Share QR Code & Subscription */}
                  <button className="btn-primary btn-sm" style={{ flex: 1 }} onClick={() => onOpenQRModal(inbound)}>
                    <QrCode size={14} /> 二维码 / 订阅链接
                  </button>

                  {/* Edit Inbound */}
                  <button className="btn-secondary btn-sm" onClick={() => onOpenEditModal(inbound)} title="修改配置">
                    <Edit3 size={14} /> 编辑
                  </button>

                  {/* Clone / Duplicate Inbound */}
                  <button 
                    className="btn-secondary btn-sm" 
                    onClick={() => {
                      const clonedInbound = {
                        ...inbound,
                        id: null, // triggers new creation mode with copied parameters
                        remark: `${inbound.remark}-Copy`,
                        port: Math.floor(Math.random() * 30000) + 10000
                      };
                      onOpenEditModal(clonedInbound);
                      showToast(`已依据 [${inbound.remark}] 载入配置模板！`);
                    }} 
                    title="一键克隆此配置模板"
                  >
                    <Copy size={14} /> 克隆
                  </button>

                  {/* Reset Traffic */}
                  <button className="btn-secondary btn-sm" onClick={() => onResetTraffic(inbound.id)} title="重置已用流量">
                    <RotateCcw size={14} />
                  </button>

                  {/* Delete Inbound */}
                  <button className="btn-danger btn-sm" onClick={() => onDeleteInbound(inbound.id)} title="删除节点">
                    <Trash2 size={14} />
                  </button>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
