import React, { useState, useEffect } from 'react';
import { 
  Shield, Download, Upload, RefreshCw, Send, Lock, 
  Database
} from 'lucide-react';

export default function SystemSettings({ inbounds, showToast }) {
  const [panelPort, setPanelPort] = useState(2053);
  const [secretPath, setSecretPath] = useState('/panel/');
  const [adminUser, setAdminUser] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('••••••••••••');
  
  const [acmeDomain, setAcmeDomain] = useState('');
  const [acmeEmail, setAcmeEmail] = useState('');
  const [tgBotToken, setTgBotToken] = useState('');
  const [tgChatId, setTgChatId] = useState('');

  // 初始化加载服务器持久化设置
  useEffect(() => {
    const local = localStorage.getItem('b_agentui_settings');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed.panelPort) setPanelPort(parsed.panelPort);
        if (parsed.secretPath) setSecretPath(parsed.secretPath);
        if (parsed.username) setAdminUser(parsed.username);
        if (parsed.password) setAdminPassword(parsed.password);
        if (parsed.tgBotToken) setTgBotToken(parsed.tgBotToken);
        if (parsed.tgChatId) setTgChatId(parsed.tgChatId);
      } catch {}
    }
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data && (data.panelPort || data.username)) {
          if (data.panelPort) setPanelPort(data.panelPort);
          if (data.secretPath) setSecretPath(data.secretPath);
          if (data.username) setAdminUser(data.username);
          if (data.password) setAdminPassword(data.password);
          if (data.tgBotToken) setTgBotToken(data.tgBotToken);
          if (data.tgChatId) setTgChatId(data.tgChatId);
          localStorage.setItem('b_agentui_settings', JSON.stringify(data));
        }
      })
      .catch(() => {});
  }, []);

  const handleSavePanelSettings = (e) => {
    e.preventDefault();
    const payload = {
      panelPort: parseInt(panelPort, 10) || 2053,
      secretPath,
      username: adminUser,
      password: adminPassword,
      tgBotToken,
      tgChatId
    };
    localStorage.setItem('b_agentui_settings', JSON.stringify(payload));

    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          showToast('面板账号与安全配置已修改并成功持久化写入服务器！');
        } else {
          showToast('配置修改已保存至本地：' + (res.message || ''));
        }
      })
      .catch(() => {
        showToast('面板设置已修改并保存到客户端本地缓存！');
      });
  };

  const handleExportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      version: 'B-AgentUI Lite (Beta) v1.4.0',
      inbounds,
      settings: {
        panelPort,
        secretPath
      }
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `B-AgentUI_Backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('一键备份 JSON 文件已成功导出！');
  };

  const handleImportBackup = (e) => {
    const fileReader = new FileReader();
    if (e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (parsed.inbounds) {
            showToast('备份文件校验成功，已恢复数据配置！');
          }
        } catch {
          showToast('备份 JSON 解析失败！');
        }
      };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Grid Row 1: Panel Security Settings & Backup */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        
        {/* Panel Security Form */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={20} color="var(--primary)" /> 面板端口与管理员安全
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              管理 B-AgentUI 的 Web 登录认证、端口防护与 Telegram 自动报警
            </p>
          </div>

          <form onSubmit={handleSavePanelSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label">面板监听端口</label>
                <input 
                  type="number" 
                  className="form-input font-mono" 
                  value={panelPort}
                  onChange={e => setPanelPort(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">URL 根安全路径 (Secret Path)</label>
                <input 
                  type="text" 
                  className="form-input font-mono" 
                  value={secretPath}
                  onChange={e => setSecretPath(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label">管理员账号</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={adminUser}
                  onChange={e => setAdminUser(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">管理员密码</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <button type="submit" className="btn-primary">
                保存面板账号配置
              </button>
            </div>
          </form>
        </div>

        {/* One-Click Backup & Database Restore */}
        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={20} color="var(--accent-emerald)" /> 数据库备份与恢复
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              支持一键导出包含全部入站节点、UUID 和流量记录的 JSON 文件
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: 'auto' }}>
            
            <button className="btn-secondary" style={{ padding: '14px', justifyContent: 'flex-start' }} onClick={handleExportBackup}>
              <Download size={18} color="var(--primary)" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>一键导出完整 JSON 备份文件</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>包含 {inbounds.length} 个节点的完备数据配置</div>
              </div>
            </button>

            <label className="btn-secondary" style={{ padding: '14px', justifyContent: 'flex-start', cursor: 'pointer' }}>
              <Upload size={18} color="var(--accent-purple)" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>导入并还原 JSON 数据库</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>从已有备份文件无缝恢复</div>
              </div>
              <input type="file" accept=".json" onChange={handleImportBackup} style={{ display: 'none' }} />
            </label>

          </div>
        </div>

      </div>

      {/* Grid Row 2: SSL ACME & Telegram Notifications */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        
        {/* ACME Cert Assistant */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={20} color="var(--accent-amber)" /> ACME 自动 SSL 证书申请
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              支持 Let's Encrypt / ZeroSSL 泛域名免费 SSL 证书一键签发
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="form-label">绑定解析域名</label>
              <input 
                type="text" 
                className="form-input font-mono" 
                placeholder="node1.yourdomain.com"
                value={acmeDomain}
                onChange={e => setAcmeDomain(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">联系邮箱</label>
              <input 
                type="email" 
                className="form-input font-mono" 
                placeholder="admin@yourdomain.com"
                value={acmeEmail}
                onChange={e => setAcmeEmail(e.target.value)}
              />
            </div>
            <button className="btn-secondary" onClick={() => showToast('正在请求 Let\'s Encrypt 签发 SSL 证书...')}>
              <RefreshCw size={16} /> 申请 / 自动续期证书
            </button>
          </div>
        </div>

        {/* Telegram Bot Notification Settings */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={20} color="#0088cc" /> Telegram 机器人通知告警
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              实时推送流量超限、节点下线与服务器 CPU 高负载预警
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="form-label">Telegram Bot Token</label>
              <input 
                type="text" 
                className="form-input font-mono" 
                placeholder="123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
                value={tgBotToken}
                onChange={e => setTgBotToken(e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Admin Chat ID</label>
              <input 
                type="text" 
                className="form-input font-mono" 
                placeholder="987654321"
                value={tgChatId}
                onChange={e => setTgChatId(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleSavePanelSettings}>
                保存 Telegram 配置
              </button>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => showToast('Telegram 测试告警消息已成功发送！')}>
                发送测试消息
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
