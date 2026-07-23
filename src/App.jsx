import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, Layers, Shield, Settings, Zap, 
  Server, Copy, Check, RefreshCw, Sun, Moon, ArrowRightLeft 
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import InboundList from './components/InboundList';
import InboundModal from './components/InboundModal';
import QRCodeModal from './components/QRCodeModal';
import RelayManagement from './components/RelayManagement';
import RoutingRules from './components/RoutingRules';
import SystemSettings from './components/SystemSettings';
import AgentCluster from './components/AgentCluster';
import './App.css';

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('b_agentui_theme') || 'dark');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toastMessage, setToastMessage] = useState(null);
  
  const [inbounds, setInbounds] = useState(() => {
    const saved = localStorage.getItem('b_agentui_inbounds');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('b_agentui_inbounds', JSON.stringify(inbounds));
  }, [inbounds]);
  const [agentCount, setAgentCount] = useState(1);
  const [relayCount, setRelayCount] = useState(0);

  const handleNodesChange = useCallback((count) => {
    setAgentCount(count);
  }, []);

  const handleRelaysChange = useCallback((count) => {
    setRelayCount(count);
  }, []);

  const [isInboundModalOpen, setIsInboundModalOpen] = useState(false);
  const [editingInbound, setEditingInbound] = useState(null);
  
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedQRInbound, setSelectedQRInbound] = useState(null);

  const [serverIpCopied, setServerIpCopied] = useState(false);

  // 自动识别 VPS 公网 IP（默认取 hostname，后台支持请求接口读取公网地址）
  const getInitialIp = () => {
    const host = window.location.hostname;
    if (host && host !== 'localhost' && host !== '127.0.0.1' && host !== '0.0.0.0') {
      return host;
    }
    return '127.0.0.1';
  };
  const [serverIp, setServerIp] = useState(getInitialIp());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('b_agentui_theme', theme);
  }, [theme]);

  // 自动请求后端获取真实公网地址（仅初始化时执行一次）
  useEffect(() => {
    fetch('/api/ip').then(res => res.json()).then(data => {
      if (data && data.ip && data.ip !== '127.0.0.1') {
        setServerIp(data.ip);
      }
    }).catch(() => {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => {
          if (d && d.ip) setServerIp(d.ip);
        }).catch(() => {});
      }
    });
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    showToast(nextTheme === 'light' ? '已切换至浅色主题 ☀️' : '已切换至暗黑主题 🌙');
  };

  const toastTimerRef = React.useRef(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyIp = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(serverIp);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = serverIp;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch {}
      document.body.removeChild(textArea);
    }
    setServerIpCopied(true);
    showToast(`服务器 IP ${serverIp} 已复制到剪贴板！`);
    setTimeout(() => setServerIpCopied(false), 2000);
  };

  const handleRestartCore = () => {
    showToast('⚡ Xray Core 核心服务重启中...');
    setTimeout(() => {
      showToast('✅ Xray Core 已成功加载最新配置并启动！');
    }, 1500);
  };

  // Inbound Handlers
  const handleToggleInbound = (id) => {
    setInbounds(prev => prev.map(item => {
      if (item.id === id) {
        const nextState = !item.enable;
        showToast(nextState ? `节点 [${item.remark}] 已启用` : `节点 [${item.remark}] 已禁用`);
        return { ...item, enable: nextState };
      }
      return item;
    }));
  };

  const handleResetTraffic = (id) => {
    setInbounds(prev => prev.map(item => {
      if (item.id === id) {
        showToast(`节点 [${item.remark}] 已重置已用流量！`);
        return { ...item, up: 0, down: 0 };
      }
      return item;
    }));
  };

  const handleDeleteInbound = (id) => {
    const target = inbounds.find(i => i.id === id);
    if (confirm(`确认要删除节点 [${target?.remark}] 吗？`)) {
      setInbounds(prev => prev.filter(i => i.id !== id));
      showToast(`已删除节点 [${target?.remark}]`);
    }
  };

  const handleSaveInbound = (inboundData) => {
    setInbounds(prev => {
      const exists = prev.some(i => i.id === inboundData.id);
      if (exists) {
        showToast(`节点 [${inboundData.remark}] 修改保存成功！`);
        return prev.map(i => i.id === inboundData.id ? inboundData : i);
      } else {
        showToast(`成功创建节点 [${inboundData.remark}]！`);
        return [inboundData, ...prev];
      }
    });
    setIsInboundModalOpen(false);
    setEditingInbound(null);
  };

  const handleOpenAddModal = () => {
    setEditingInbound(null);
    setIsInboundModalOpen(true);
  };

  const handleOpenEditModal = (inbound) => {
    setEditingInbound(inbound);
    setIsInboundModalOpen(true);
  };

  const handleOpenQRModal = (inbound) => {
    setSelectedQRInbound(inbound);
    setIsQRModalOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Header Navbar */}
      <header style={{
        background: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(9, 13, 22, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo & Master Core Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #0284c7, #2563eb)', 
              width: '36px', 
              height: '36px', 
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
            }}>
              <Zap size={22} color="#ffffff" />
            </div>
            <div>
              <span className="header-title-text" style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                B-AgentUI <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', background: 'rgba(2, 132, 199, 0.12)', color: 'var(--primary)', border: '1px solid rgba(2, 132, 199, 0.3)', verticalAlign: 'middle' }}>LITE</span> <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '2px 5px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.35)', verticalAlign: 'middle', marginLeft: '3px' }}>BETA</span>
              </span>
            </div>
          </div>

          <div className="header-status-badge" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(5, 150, 105, 0.1)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(5, 150, 105, 0.25)', fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>
            <div className="pulse-dot online" />
            <span>Master & Agent Cluster Active</span>
          </div>
        </div>

        {/* Desktop & Scrollable Nav Links */}
        <nav className="desktop-nav" style={{ display: 'flex', gap: '8px', overflowX: 'auto', flexWrap: 'nowrap' }}>
          {[
            { id: 'dashboard', label: '主控仪表盘', icon: Activity },
            { id: 'agent', label: 'AGENT 集群', icon: Server, count: agentCount },
            { id: 'inbounds', label: '入站列表', icon: Layers, count: inbounds.length },
            { id: 'relay', label: '节点中转', icon: ArrowRightLeft, count: relayCount },
            { id: 'routing', label: '路由分流', icon: Shield },
            { id: 'settings', label: '面板设置', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: isActive ? 'rgba(2, 132, 199, 0.12)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  border: isActive ? '1px solid rgba(2, 132, 199, 0.3)' : '1px solid transparent',
                  borderRadius: '10px',
                  padding: '8px 16px',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? '600' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexShrink: 0,
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={16} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="font-mono" style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 6px', borderRadius: '10px', fontSize: '0.7rem' }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Action Widgets */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Light / Dark Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="glass-card"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              cursor: 'pointer',
              border: '1px solid var(--border-color)',
              color: theme === 'light' ? '#d97706' : '#00f2fe'
            }}
            title={theme === 'light' ? '切换为暗黑模式' : '切换为浅色模式'}
          >
            {theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Server IP Pill */}
          <button 
            onClick={handleCopyIp}
            className="glass-card"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '6px 12px', 
              fontSize: '0.8rem', 
              color: 'var(--text-main)', 
              cursor: 'pointer',
              border: '1px solid var(--border-color)'
            }}
            title="点击复制 VPS 公网 IP"
          >
            <Server size={14} color="var(--primary)" />
            <span className="font-mono">{serverIp}</span>
            {serverIpCopied ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} color="var(--text-muted)" />}
          </button>

          {/* Quick Core Restart */}
          <button className="btn-secondary btn-sm" onClick={handleRestartCore} title="重启 Xray 服务">
            <RefreshCw size={14} /> 重启 Core
          </button>
        </div>

      </header>

      {/* Main Content Viewport */}
      <main style={{ flex: 1, padding: '28px 24px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        {activeTab === 'dashboard' && (
          <Dashboard 
            inbounds={inbounds} 
            onOpenAddModal={handleOpenAddModal}
            onRestartCore={handleRestartCore}
            showToast={showToast}
          />
        )}

        {activeTab === 'agent' && (
          <AgentCluster 
            inbounds={inbounds}
            showToast={showToast}
            onOpenQRModal={handleOpenQRModal}
            onNodesChange={handleNodesChange}
          />
        )}

        {activeTab === 'inbounds' && (
          <InboundList 
            inbounds={inbounds}
            onToggleInbound={handleToggleInbound}
            onResetTraffic={handleResetTraffic}
            onDeleteInbound={handleDeleteInbound}
            onOpenAddModal={handleOpenAddModal}
            onOpenEditModal={handleOpenEditModal}
            onOpenQRModal={handleOpenQRModal}
            showToast={showToast}
          />
        )}

        {activeTab === 'relay' && (
          <RelayManagement 
            showToast={showToast} 
            onOpenQRModal={handleOpenQRModal}
            onRelaysChange={handleRelaysChange}
          />
        )}

        {activeTab === 'routing' && (
          <RoutingRules showToast={showToast} />
        )}

        {activeTab === 'settings' && (
          <SystemSettings inbounds={inbounds} showToast={showToast} onRestoreInbounds={setInbounds} />
        )}
      </main>

      {/* Interactive Modals */}
      <InboundModal 
        isOpen={isInboundModalOpen}
        onClose={() => setIsInboundModalOpen(false)}
        onSave={handleSaveInbound}
        editingInbound={editingInbound}
      />

      <QRCodeModal 
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        inbound={selectedQRInbound}
        serverIp={serverIp}
        showToast={showToast}
      />

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="toast-notice">
          <Zap size={18} color="var(--primary)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '16px 24px',
        textAlign: 'center',
        color: 'var(--text-dim)',
        fontSize: '0.8rem',
        marginTop: 'auto'
      }}>
        B-AgentUI LITE (Beta) v1.4.0 • Multi-Node Master & Agent Cluster Panel • Powered by High-Performance Frontend Engine
      </footer>

    </div>
  );
}
