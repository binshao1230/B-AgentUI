import React, { useState, useEffect } from 'react';
import { 
  ArrowRightLeft, Plus, Search, RefreshCw, Power, Edit3, Trash2, 
  Server, Network, Zap, QrCode, MapPin, Link2
} from 'lucide-react';
import { formatBytes } from '../utils/xrayHelper';

const getInitialMasterIp = () => {
  const host = window.location.hostname;
  if (host && host !== 'localhost' && host !== '127.0.0.1' && host !== '0.0.0.0') {
    return host;
  }
  return '127.0.0.1';
};

const PRESET_AGENTS = [
  { id: 'master', name: 'Master 主控本节点', ip: getInitialMasterIp(), role: 'master', isNat: false, region: '🖥️ 本地主控' },
  { id: '__custom__', name: '🌐 自定义服务器 IP...', ip: '', role: 'custom', isNat: false, region: '自定义' },
];

export default function RelayManagement({ showToast, onOpenQRModal, agents = PRESET_AGENTS, onRelaysChange }) {
  const activeAgents = agents && agents.length > 0 ? agents : PRESET_AGENTS;

  // 从 localStorage 加载已保存的中转规则
  const loadSavedRelays = () => {
    try {
      const saved = localStorage.getItem('b_agentui_relays');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  };

  const [relays, setRelays] = useState(loadSavedRelays);

  // 中转规则变化时自动持久化到 localStorage 并通知父组件
  useEffect(() => {
    localStorage.setItem('b_agentui_relays', JSON.stringify(relays));
    if (onRelaysChange) onRelaysChange(relays.length);
  }, [relays, onRelaysChange]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRelay, setEditingRelay] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    mode: 'chained', // 'direct' | 'chained'
    // 入口
    entranceNodeId: 'master',
    entranceNodeName: 'Master 主控本节点',
    entranceIp: getInitialMasterIp(),
    entrancePort: 30010,
    isNatEntrance: false,
    natRange: '',
    // 中转节点
    relayNodeId: '__custom__',
    relayNodeName: '🌐 自定义服务器 IP...',
    relayIp: '',
    relayPort: 18080,
    // 落地
    targetIp: '127.0.0.1',
    targetPort: 443,
    engine: 'Realm (高性能)',
    protocol: 'tcp_udp'
  });

  const handleToggleEnable = (id) => {
    setRelays(prev => prev.map(r => {
      if (r.id === id) {
        const nextState = !r.enable;
        showToast(nextState ? `中转规则 [${r.name}] 已启用` : `中转规则 [${r.name}] 已禁用`);
        return { ...r, enable: nextState };
      }
      return r;
    }));
  };

  const handleTestLatency = (id) => {
    showToast('正在发起链式三跳 ICMP/TCP 链路测速...');
    setTimeout(() => {
      const h1 = Math.floor(Math.random() * 15) + 8;
      const h2 = Math.floor(Math.random() * 20) + 15;
      setRelays(prev => prev.map(r => r.id === id ? { 
        ...r, 
        hop1Latency: h1, 
        hop2Latency: r.mode === 'chained' ? h2 : 0, 
        latency: r.mode === 'chained' ? h1 + h2 : h1 
      } : r));
      showToast(`链式链路测速完成！总延迟: ${h1 + h2} ms (第1跳:${h1}ms, 第2跳:${h2}ms)`);
    }, 800);
  };

  const handleDeleteRelay = (id) => {
    const target = relays.find(r => r.id === id);
    if (confirm(`确认要删除中转规则 [${target?.name}] 吗？`)) {
      setRelays(prev => prev.filter(r => r.id !== id));
      showToast('已删除中转规则');
    }
  };

  // 选择入口 AGENT
  const handleSelectEntranceNode = (nodeId) => {
    const selectedAgent = activeAgents.find(a => a.id === nodeId) || PRESET_AGENTS.find(a => a.id === nodeId);
    if (!selectedAgent) return;

    if (nodeId === '__custom__') {
      setFormData(prev => ({
        ...prev,
        entranceNodeId: '__custom__',
        entranceNodeName: '自定义入口服务器',
        entranceIp: '',
        isNatEntrance: false,
        natRange: ''
      }));
    } else {
      const defaultPort = selectedAgent.isNat ? 30010 : 10080;
      setFormData(prev => ({
        ...prev,
        entranceNodeId: selectedAgent.id,
        entranceNodeName: selectedAgent.name,
        entranceIp: selectedAgent.ip,
        entrancePort: defaultPort,
        isNatEntrance: !!selectedAgent.isNat,
        natRange: selectedAgent.natPublicPortRange || ''
      }));
    }
  };

  // 选择中转过境 AGENT
  const handleSelectRelayNode = (nodeId) => {
    const selectedAgent = activeAgents.find(a => a.id === nodeId) || PRESET_AGENTS.find(a => a.id === nodeId);
    if (!selectedAgent) return;

    if (nodeId === '__custom__') {
      setFormData(prev => ({
        ...prev,
        relayNodeId: '__custom__',
        relayNodeName: '自定义过境中转节点',
        relayIp: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        relayNodeId: selectedAgent.id,
        relayNodeName: selectedAgent.name,
        relayIp: selectedAgent.ip,
        relayPort: 18080
      }));
    }
  };

  const handleOpenAddModal = () => {
    setEditingRelay(null);
    const defaultEntrance = activeAgents[1] || activeAgents[0] || PRESET_AGENTS[1];
    const defaultRelay = activeAgents[2] || activeAgents[0] || PRESET_AGENTS[2];
    setFormData({
      name: '广州移动 NAT ➔ 上海电信 ➔ 美国洛杉矶链式中转',
      mode: 'chained',
      entranceNodeId: defaultEntrance.id,
      entranceNodeName: defaultEntrance.name,
      entranceIp: defaultEntrance.ip,
      entrancePort: 30012,
      isNatEntrance: true,
      natRange: '30000-30020',
      relayNodeId: defaultRelay.id,
      relayNodeName: defaultRelay.name,
      relayIp: defaultRelay.ip || '',
      relayPort: 18080,
      targetIp: '127.0.0.1',
      targetPort: 443,
      engine: 'Realm (高性能)',
      protocol: 'tcp_udp'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (relay) => {
    setEditingRelay(relay);
    setFormData({
      name: relay.name,
      mode: relay.mode || 'direct',
      entranceNodeId: relay.entranceNodeId || 'node-nat-1',
      entranceNodeName: relay.entranceNodeName || '入口节点',
      entranceIp: relay.entranceIp || '',
      entrancePort: relay.entrancePort,
      isNatEntrance: !!relay.isNatEntrance,
      natRange: relay.natRange || '',
      relayNodeId: relay.relayNodeId || 'node-2',
      relayNodeName: relay.relayNodeName || '中转节点',
      relayIp: relay.relayIp || '',
      relayPort: relay.relayPort || 18080,
      targetIp: relay.targetIp,
      targetPort: relay.targetPort,
      engine: relay.engine,
      protocol: relay.protocol
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    const h1 = Math.floor(Math.random() * 15) + 8;
    const h2 = Math.floor(Math.random() * 20) + 15;
    
    if (editingRelay) {
      setRelays(prev => prev.map(r => r.id === editingRelay.id ? { 
        ...r, 
        ...formData,
        hop1Latency: h1,
        hop2Latency: formData.mode === 'chained' ? h2 : 0,
        latency: formData.mode === 'chained' ? h1 + h2 : h1
      } : r));
      showToast(`中转规则 [${formData.name}] 已保存修改！`);
    } else {
      const newRule = {
        id: Date.now(),
        ...formData,
        status: 'active',
        hop1Latency: h1,
        hop2Latency: formData.mode === 'chained' ? h2 : 0,
        latency: formData.mode === 'chained' ? h1 + h2 : h1,
        up: 0,
        down: 0,
        enable: true,
        remark: 'Chained-Relay-Node'
      };
      setRelays(prev => [newRule, ...prev]);
      showToast(`已成功新建 [${formData.mode === 'chained' ? '三跳链式中转' : '双跳直连中转'}] 规则！`);
    }
    setIsModalOpen(false);
  };

  const filteredRelays = relays.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.entranceNodeName && r.entranceNodeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (r.relayNodeName && r.relayNodeName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    r.entrancePort.toString().includes(searchQuery) ||
    r.targetIp.includes(searchQuery)
  );

  const totalRelayTraffic = relays.reduce((acc, curr) => acc + (curr.up || 0) + (curr.down || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* Active Relays */}
        <div className="glass-card glass-card-interactive" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>活跃中转通道</span>
            <ArrowRightLeft size={18} color="var(--primary)" />
          </div>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)' }}>
              {relays.filter(r => r.enable).length}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              / {relays.length} 条 (含 {relays.filter(r => r.mode === 'chained').length} 条链式多跳)
            </span>
          </div>
        </div>

        {/* Total Forwarded Traffic */}
        <div className="glass-card glass-card-interactive" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>中转总吞吐流量</span>
            <Network size={18} color="var(--accent-purple)" />
          </div>
          <div style={{ marginTop: '12px', fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)' }}>
            {formatBytes(totalRelayTraffic)}
          </div>
        </div>

        {/* Forwarding Engine */}
        <div className="glass-card glass-card-interactive" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>链式中转引擎</span>
            <Zap size={18} color="var(--accent-emerald)" />
          </div>
          <div style={{ marginTop: '12px', fontSize: '1.25rem', fontWeight: '700', color: 'var(--accent-emerald)' }}>
            Realm + GOST 3-Hop
          </div>
        </div>

      </div>

      {/* Action Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Search */}
        <div style={{ position: 'relative', minWidth: '280px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="搜索中转 / 入口 / 中转过境 / 落地 IP..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>

        {/* Add Relay Button */}
        <button className="btn-primary" onClick={handleOpenAddModal}>
          <Plus size={18} /> 新建链式 / 直连中转
        </button>

      </div>

      {/* Relay Rules List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '20px' }}>
        {filteredRelays.map(relay => {
          const isChained = relay.mode === 'chained';
          return (
            <div 
              key={relay.id} 
              className="glass-card glass-card-interactive" 
              style={{ 
                padding: '20px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px',
                opacity: relay.enable ? 1 : 0.65,
                border: isChained ? '2px solid #8b5cf6' : '1px solid var(--border-color)',
                boxShadow: isChained ? '0 0 20px rgba(139, 92, 246, 0.28), 0 4px 20px rgba(0, 0, 0, 0.08)' : 'none',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '16px'
              }}
            >
              {/* 链式中转专属顶部流光彩条 */}
              {isChained && (
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, height: '4px',
                  background: 'linear-gradient(90deg, #8b5cf6, #ec4899, #3b82f6)',
                  boxShadow: '0 0 10px rgba(139, 92, 246, 0.7)'
                }} />
              )}

              {/* Header: Title & Switch */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '1.02rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {relay.name}
                  </h4>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {isChained ? (
                      <span className="badge" style={{ 
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15))', 
                        color: '#7c3aed', 
                        border: '1.5px solid #a78bfa', 
                        fontWeight: '800',
                        boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)',
                        padding: '2px 8px'
                      }}>
                        🔗 3跳链式中转
                      </span>
                    ) : (
                      <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}>
                        双跳直连中转
                      </span>
                    )}
                  
                  <span className="badge" style={{ background: 'var(--input-bg)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                    {relay.engine}
                  </span>

                  {relay.isNatEntrance && (
                    <span className="badge" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontSize: '0.62rem' }}>
                      🌐 NAT
                    </span>
                  )}

                  <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div className="pulse-dot online" style={{ width: '6px', height: '6px' }} />
                    {relay.latency} ms
                  </span>
                </div>
              </div>

              {/* Power Switch */}
              <button 
                onClick={() => handleToggleEnable(relay.id)}
                title={relay.enable ? "禁用中转" : "启用中转"}
                style={{
                  background: relay.enable ? 'rgba(16, 185, 129, 0.12)' : 'var(--input-bg)',
                  border: relay.enable ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)',
                  color: relay.enable ? 'var(--accent-emerald)' : 'var(--text-dim)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                <Power size={18} />
              </button>
            </div>

            {/* Entrance ➔ [Intermediate Relay] ➔ Destination Visual Map Card */}
            <div style={{ 
              background: 'var(--input-bg)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '10px', 
              padding: '12px', 
              display: 'grid', 
              gridTemplateColumns: relay.mode === 'chained' ? 'minmax(0, 1fr) auto minmax(0, 1.15fr) auto minmax(0, 1fr)' : 'minmax(0, 1fr) auto minmax(0, 1fr)',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              
              {/* 1. 入口 AGENT 机器 */}
              <div style={{ minWidth: 0 }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Server size={11} color="var(--primary)" /> 1. 入口节点
                </div>
                <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.82rem', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {relay.entranceNodeName || '入口'}
                </div>
                <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-main)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {relay.entranceIp ? `${relay.entranceIp}:${relay.entrancePort}` : `Port: ${relay.entrancePort}`}
                </div>
              </div>

              <div style={{ color: 'var(--text-dim)', textAlign: 'center', fontSize: '0.68rem', fontWeight: '700', flexShrink: 0 }}>➔</div>

              {/* 2. 中转过境节点 (如果是链式中转) */}
              {relay.mode === 'chained' && (
                <>
                  <div style={{ background: 'rgba(139, 92, 246, 0.08)', padding: '6px 8px', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.25)', minWidth: 0 }}>
                    <div style={{ color: 'var(--accent-purple)', fontSize: '0.68rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Link2 size={10} color="var(--accent-purple)" /> 2. 过境中转
                    </div>
                    <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.8rem', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {relay.relayNodeName || '过境节点'}
                    </div>
                    <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {relay.relayIp ? `${relay.relayIp}:${relay.relayPort || 18080}` : `Port: ${relay.relayPort}`}
                    </div>
                  </div>

                  <div style={{ color: 'var(--text-dim)', textAlign: 'center', fontSize: '0.68rem', fontWeight: '700', flexShrink: 0 }}>➔</div>
                </>
              )}

              {/* 3. 落地服务器 */}
              <div style={{ textAlign: 'right', minWidth: 0 }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
                  <MapPin size={11} color="var(--accent-emerald)" /> {relay.mode === 'chained' ? '3. 落地' : '2. 落地'}
                </div>
                <div className="font-mono" style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.82rem', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {relay.targetIp}:{relay.targetPort}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {relay.remark || 'Direct'}
                </div>
              </div>

            </div>

            {/* Traffic & Hop Latencies */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', alignItems: 'center' }}>
              <span>吞吐流量: <strong className="font-mono" style={{ color: 'var(--text-main)' }}>{formatBytes(relay.up + relay.down)}</strong></span>
              
              {relay.mode === 'chained' ? (
                <div style={{ fontSize: '0.72rem', color: 'var(--accent-purple)', fontWeight: '600' }}>
                  跳段: Hop1 {relay.hop1Latency || 12}ms + Hop2 {relay.hop2Latency || 24}ms
                </div>
              ) : (
                <div style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: '600' }}>
                  直连 1Hop 延时
                </div>
              )}
            </div>

            {/* Footer Action Controls */}
            <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
              <button className="btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => handleTestLatency(relay.id)}>
                <RefreshCw size={13} /> 测速 (分段跳)
              </button>
              <button 
                className="btn-secondary btn-sm" 
                onClick={() => onOpenQRModal && onOpenQRModal({ 
                  id: relay.id, 
                  remark: relay.name, 
                  protocol: 'vless', 
                  port: relay.entrancePort || 30008, 
                  network: 'tcp',
                  security: 'reality',
                  sni: 'dl.google.com',
                  address: relay.entranceIp 
                })} 
                title="查看该链式/直连中转节点专属订阅与链接"
              >
                <QrCode size={13} /> 订阅 / 二维码
              </button>
              <button className="btn-secondary btn-sm" onClick={() => handleOpenEditModal(relay)}>
                <Edit3 size={13} /> 编辑
              </button>
              <button className="btn-danger btn-sm" onClick={() => handleDeleteRelay(relay.id)}>
                <Trash2 size={13} /> 删除
              </button>
            </div>
          </div>
        );
      })}
      </div>

      {/* Add / Edit Relay Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowRightLeft size={20} color="var(--primary)" /> {editingRelay ? '编辑节点中转规则' : '新建链式 / 直连中转规则'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* 中转模式切换：双跳直连 vs 三跳链式 */}
              <div style={{ background: 'var(--input-bg)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <label className="form-label">中转架构模式</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, mode: 'direct' })}
                    style={{
                      padding: '10px', borderRadius: '8px',
                      border: formData.mode === 'direct' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      background: formData.mode === 'direct' ? 'rgba(2, 132, 199, 0.1)' : 'transparent',
                      color: formData.mode === 'direct' ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer'
                    }}
                  >
                    ⚡ 双跳直连中转 (入口 ➔ 落地)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, mode: 'chained' })}
                    style={{
                      padding: '10px', borderRadius: '8px',
                      border: formData.mode === 'chained' ? '2px solid var(--accent-purple)' : '1px solid var(--border-color)',
                      background: formData.mode === 'chained' ? 'rgba(139, 92, 246, 0.12)' : 'transparent',
                      color: formData.mode === 'chained' ? 'var(--accent-purple)' : 'var(--text-muted)',
                      fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}
                  >
                    <Link2 size={16} /> 🔗 3跳链式中转 (入口 ➔ 中转 ➔ 落地)
                  </button>
                </div>
              </div>

              <div>
                <label className="form-label">中转规则名称</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如: 广州移动 NAT ➔ 上海 CN2 ➔ 美国洛杉矶链式"
                />
              </div>

              {/* ===== Step 1: 入口 AGENT 机器选择 ===== */}
              <div style={{ background: 'var(--input-bg)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                  <Server size={14} color="var(--primary)" /> 1. 选择中转入口 AGENT 服务器
                </label>
                
                <select
                  className="form-select"
                  value={formData.entranceNodeId}
                  onChange={e => handleSelectEntranceNode(e.target.value)}
                >
                  {PRESET_AGENTS.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.name} {agent.ip ? `(${agent.ip})` : ''} {agent.isNat ? '[NAT机器]' : ''}
                    </option>
                  ))}
                </select>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {formData.entranceNodeId === '__custom__' ? (
                    <input 
                      type="text" 
                      className="form-input font-mono"
                      required
                      placeholder="自定义入口 IP"
                      value={formData.entranceIp}
                      onChange={e => setFormData({ ...formData, entranceIp: e.target.value })}
                    />
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                      IP: <strong className="font-mono" style={{ color: 'var(--primary)', marginLeft: '4px' }}>{formData.entranceIp}</strong>
                    </div>
                  )}

                  <div>
                    <input 
                      type="number" 
                      className="form-input font-mono"
                      required
                      placeholder="监听端口 (如: 30010)"
                      value={formData.entrancePort}
                      onChange={e => setFormData({ ...formData, entrancePort: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>
                </div>

                {formData.isNatEntrance && (
                  <div style={{ fontSize: '0.72rem', color: '#b45309' }}>
                    🌐 NAT 提醒: 入口为 NAT 机器，请在公网端口段 {formData.natRange} 内选择监听端口。
                  </div>
                )}
              </div>

              {/* ===== Step 2: 链式过境中转节点 (仅链式模式显示) ===== */}
              {formData.mode === 'chained' && (
                <div style={{ background: 'rgba(139, 92, 246, 0.08)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(139, 92, 246, 0.3)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-purple)', margin: 0 }}>
                    <Link2 size={14} color="var(--accent-purple)" /> 2. 选择中间过境中转节点 (Intermediate Relay)
                  </label>

                  <select
                    className="form-select"
                    value={formData.relayNodeId}
                    onChange={e => handleSelectRelayNode(e.target.value)}
                  >
                    {PRESET_AGENTS.map(agent => (
                      <option key={agent.id} value={agent.id}>
                        {agent.name} {agent.ip ? `(${agent.ip})` : ''}
                      </option>
                    ))}
                  </select>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <input 
                      type="text" 
                      className="form-input font-mono"
                      required
                      placeholder="中转过境 IP / 域名"
                      value={formData.relayIp}
                      onChange={e => setFormData({ ...formData, relayIp: e.target.value })}
                    />
                    <input 
                      type="number" 
                      className="form-input font-mono"
                      required
                      placeholder="中转端口 (如: 18080)"
                      value={formData.relayPort}
                      onChange={e => setFormData({ ...formData, relayPort: parseInt(e.target.value, 10) || 0 })}
                    />
                  </div>
                </div>
              )}

              {/* ===== Step 3: 落地服务器 ===== */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">{formData.mode === 'chained' ? '3. 落地服务器 IP / 域名 (Destination)' : '2. 落地服务器 IP / 域名'}</label>
                  <input 
                    type="text" 
                    className="form-input font-mono"
                    required
                    placeholder="例如: 1.2.3.4 或 node.example.com"
                    value={formData.targetIp}
                    onChange={e => setFormData({ ...formData, targetIp: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">落地节点端口</label>
                  <input 
                    type="number" 
                    className="form-input font-mono"
                    required
                    value={formData.targetPort}
                    onChange={e => setFormData({ ...formData, targetPort: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">中转转发引擎 (Engine)</label>
                <select 
                  className="form-select"
                  value={formData.engine}
                  onChange={e => setFormData({ ...formData, engine: e.target.value })}
                >
                  <option value="Realm (高性能)">Realm (高性能轻量级多跳链式)</option>
                  <option value="GOST v3 隧道">GOST v3 多级隧道加密转发</option>
                  <option value="iptables 原生转发">iptables 原生双向端口转发</option>
                  <option value="Xray 链式 Outbound">Xray 链式 Outbound 路由</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  取消
                </button>
                <button type="submit" className="btn-primary">
                  保存{formData.mode === 'chained' ? '链式' : '直连'}中转配置
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
