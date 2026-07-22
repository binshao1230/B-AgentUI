import React, { useState, useEffect } from 'react';
import { 
  Activity, Server, ArrowUpRight, ArrowDownRight, Cpu, HardDrive, 
  RefreshCw, Plus, Zap, Radio, Globe, Layers
} from 'lucide-react';
import { formatBytes } from '../utils/xrayHelper';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
  Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
);

export default function Dashboard({ inbounds, onOpenAddModal, onRestartCore, showToast }) {
  // Real-time dynamic system state
  const [sysInfo, setSysInfo] = useState({
    cpu: 18.5,
    memory: 42.1,
    disk: 28.4,
    uptime: '14 天 6 小时 32 分',
    xrayVersion: 'v1.8.28 (Xray Core)',
    xrayStatus: 'running'
  });

  const [speedData, setSpeedData] = useState({
    labels: ['15s', '12s', '9s', '6s', '3s', '0s'],
    upSpeed: [1.2, 2.4, 1.8, 3.5, 4.2, 2.8], // MB/s
    downSpeed: [12.4, 18.2, 14.5, 26.8, 32.1, 24.5] // MB/s
  });

  // Calculate overall stats from inbounds
  const totalUp = inbounds.reduce((acc, curr) => acc + (curr.up || 0), 0);
  const totalDown = inbounds.reduce((acc, curr) => acc + (curr.down || 0), 0);
  const totalTraffic = totalUp + totalDown;
  const activeInbounds = inbounds.filter(i => i.enable).length;

  // Simulate live traffic chart updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate slight system fluctuation
      setSysInfo(prev => ({
        ...prev,
        cpu: Math.min(99, Math.max(8, (prev.cpu + (Math.random() * 6 - 3)).toFixed(1))),
        memory: Math.min(95, Math.max(35, (prev.memory + (Math.random() * 2 - 1)).toFixed(1)))
      }));

      // Simulate speed data points
      const newUp = (Math.random() * 3 + 1).toFixed(2);
      const newDown = (Math.random() * 25 + 10).toFixed(2);

      setSpeedData(prev => ({
        labels: [...prev.labels.slice(1), '0s'],
        upSpeed: [...prev.upSpeed.slice(1), parseFloat(newUp)],
        downSpeed: [...prev.downSpeed.slice(1), parseFloat(newDown)]
      }));
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  const chartData = {
    labels: speedData.labels,
    datasets: [
      {
        label: '下载速率 (MB/s)',
        data: speedData.downSpeed,
        borderColor: '#00f2fe',
        backgroundColor: 'rgba(0, 242, 254, 0.12)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3
      },
      {
        label: '上传速率 (MB/s)',
        data: speedData.upSpeed,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#334155', font: { family: 'Inter', size: 12 } }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: 'rgba(255,255,255,0.15)',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(0, 0, 0, 0.06)' },
        ticks: { color: '#475569' }
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.06)' },
        ticks: { color: '#475569' }
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* Core Status */}
        <div className="glass-card glass-card-interactive" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>Xray 核心状态</span>
            <div className={`pulse-dot ${sysInfo.xrayStatus === 'running' ? 'online' : 'offline'}`} />
          </div>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)' }}>
              {sysInfo.xrayStatus === 'running' ? '正常运行' : '已停止'}
            </span>
            <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{sysInfo.xrayVersion}</span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            连续运行: {sysInfo.uptime}
          </div>
        </div>

        {/* Real-time Traffic */}
        <div className="glass-card glass-card-interactive" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>实时网速</span>
            <Radio size={18} color="var(--primary)" />
          </div>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <ArrowDownRight size={14} color="var(--primary)" /> 下行
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)' }}>
                {speedData.downSpeed[speedData.downSpeed.length - 1]} <span style={{ fontSize: '0.75rem' }}>MB/s</span>
              </div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-color)', paddingLeft: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <ArrowUpRight size={14} color="#8b5cf6" /> 上行
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#8b5cf6' }}>
                {speedData.upSpeed[speedData.upSpeed.length - 1]} <span style={{ fontSize: '0.75rem' }}>MB/s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Inbounds */}
        <div className="glass-card glass-card-interactive" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>活动入站节点</span>
            <Layers size={18} color="var(--accent-purple)" />
          </div>
          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: '700' }}>{activeInbounds}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/ {inbounds.length} Total</span>
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>
            ● 所有端口数据抓取中
          </div>
        </div>

        {/* Total Cumulative Data */}
        <div className="glass-card glass-card-interactive" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>总累计流量</span>
            <Globe size={18} color="var(--accent-emerald)" />
          </div>
          <div style={{ marginTop: '12px', fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)' }}>
            {formatBytes(totalTraffic)}
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '12px' }}>
            <span>↑ {formatBytes(totalUp)}</span>
            <span>↓ {formatBytes(totalDown)}</span>
          </div>
        </div>

      </div>

      {/* Middle Grid: Speed Chart + Hardware Resource Gauges */}
      <div className="dashboard-grid">
        
        {/* Real-time Traffic Graph */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="var(--primary)" /> 实时流量监控 (Realtime Bandwidth)
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>每 2.5 秒秒级采集网络吞吐量</p>
            </div>
            <button className="btn-secondary btn-sm" onClick={() => showToast('已刷新网速采集模块')}>
              <RefreshCw size={14} /> 刷新
            </button>
          </div>
          <div style={{ flex: 1, minHeight: '260px', position: 'relative' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* System Resource Gauges Card */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} color="var(--accent-purple)" /> 服务器负载 (Hardware)
          </h3>

          {/* CPU Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu size={14} /> CPU 占用
              </span>
              <span className="font-mono" style={{ fontWeight: '600', color: sysInfo.cpu > 70 ? 'var(--accent-rose)' : 'var(--primary)' }}>
                {sysInfo.cpu}%
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${sysInfo.cpu}%`, 
                height: '100%', 
                background: sysInfo.cpu > 70 ? 'var(--accent-rose)' : 'linear-gradient(90deg, #00f2fe, #4facfe)',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          {/* Memory Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={14} /> 内存使用 (RAM)
              </span>
              <span className="font-mono" style={{ fontWeight: '600', color: 'var(--accent-purple)' }}>
                {sysInfo.memory}%
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${sysInfo.memory}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          {/* Disk Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HardDrive size={14} /> 磁盘容量 (Storage)
              </span>
              <span className="font-mono" style={{ fontWeight: '600', color: 'var(--accent-emerald)' }}>
                {sysInfo.disk}%
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${sysInfo.disk}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, #10b981, #34d399)',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          {/* Quick Core Controller */}
          <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px' }}>
            <button className="btn-primary" style={{ flex: 1 }} onClick={onOpenAddModal}>
              <Plus size={16} /> 新增入站
            </button>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={onRestartCore}>
              <Zap size={16} color="var(--accent-amber)" /> 重启 Core
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
