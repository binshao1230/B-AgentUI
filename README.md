# ⚡ B-AgentUI Lite (Beta)

<div align="center">

![B-AgentUI Banner](https://img.shields.io/badge/B--AgentUI-LITE%20(Beta)-0284c7?style=for-the-badge&logo=zap&logoColor=white)
![Version](https://img.shields.io/badge/Version-v1.4.0--beta-f59e0b?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Linux%20%7C%20Docker-6366f1?style=for-the-badge&logo=linux&logoColor=white)

**轻量级、极速响应的多节点 Xray 代理集群与链式中转 Web UI 管理引擎**

[一键安装](#-一键安装-linux) • [核心特性](#-核心特性) • [架构图解](#-集群拓扑架构) • [Docker 部署](#-docker-容器部署)

</div>

---

## 🌟 项目简介

**B-AgentUI Lite (Beta)** 是一款专门针对多 VPS 节点分发、链式架构组网与高并发 Xray 协议管理的精简型现代化控制面板。系统由中央 **Master 主控** 统一指挥，配合轻量级 **Agent 边缘节点**，支持从普通原生 VPS 到纯 NAT 专线的全场景无缝接入与一键自动化对接。

---

## 🚀 一键安装 (Linux)

在任意目标 VPS（支持 Debian / Ubuntu / CentOS / Alpine）上，执行以下命令即可实现原生全自动部署与 systemd 开机自启服务注册：

```bash
curl -fsSL https://raw.githubusercontent.com/binshao1230/B-AgentUI/main/install-linux.sh | bash
```

> **自定义访问端口**（例如修改为 `8080`）：
> ```bash
> curl -fsSL https://raw.githubusercontent.com/binshao1230/B-AgentUI/main/install-linux.sh | bash -s -- 8080
> ```

安装完毕后，在浏览器访问：
```
http://<您的服务器公网IP>:2053
```

---

## 💎 核心特性

- **⚡ 3-Hop 链式中转深度高亮**：原生支持 `入口 (Entrance) ➔ 中转机器 (Intermediate Relay) ➔ 落地节点 (Egress)` 链式转发配置，中转机器卡片全自动启用专属金色/紫色渐变高亮与动画边框提醒。
- **🌐 全功能 NAT 专线自动映射**：专为端口受限的 NAT VPS、单端转发机器打造，支持自定义节点通信端口（如 `2053`、`28053` 等）与映射公网范围（如 `30000-30020`），全自动计算分配可用区间。
- **📦 3X-UI 官方 6 大标准模板完全兼容**：
  1. `VLESS-REALITY-Vision` (3X-UI 最新防封反制标准)
  2. `VMess-WS-TLS` (支持 Cloudflare 等 CDN 深度伪装)
  3. `Trojan-gRPC-TLS` (高并发多路复用模式)
  4. `Shadowsocks-2022` (强抗识别 AEAD 算法升级)
  5. `Hysteria 2` (高丢包网络 UDP/QUIC 暴力提速)
  6. `VLESS-gRPC-REALITY` (多端口混淆分发模式)
- **📋 随时获取与复制 SSH 一键对接命令**：针对任意已创建或现存的 Agent 机器，面板常驻「⚡ 安装脚本」按钮，随时点击生成并一键复制免密绑定的 Shell 命令。
- **📊 实时硬件与流量大盘监控**：基于 Chart.js 与动态 WebSocket 轮询，毫秒级监测所有入站/代理节点的上下行速率、活跃连接数、CPU、内存与硬盘占用。
- **🔒 纯净免打扰授权**：内置全自动免密通信机制与智能鉴权，针对节点下发无缝打通。

---

## 🗺️ 集群拓扑架构

```mermaid
graph TD
    User["🌐 终端用户 (PC / Mobile / Router)"]
    Master["🖥️ B-AgentUI Master 主控面板 (IP:2053)"]
    
    subgraph Cluster["⚡ 边缘与链式中转代理集群 (Xray Engine)"]
        Entrance["🟢 入口节点 (Entrance Node)"]
        Relay["🟣 中转机器 (Relay Node - 金边高亮)"]
        Egress["🔴 落地节点 (Egress Node)"]
        NatNode["🟠 NAT 专线中转机 (自定义映射区间)"]
    end

    User -->|1. 加密连接| Entrance
    Entrance -->|2. gRPC/WS 加密中转| Relay
    Relay -->|3. 高速专线| Egress
    Egress -->|4. 访问目的地址| Internet(("🌍 互联网 (Internet)"))
    
    User -->|NAT 映射端口| NatNode
    NatNode -->|专线| Internet

    Master -.->|下发配置与通信密钥 (Agent Script)| Entrance
    Master -.->|下发配置与通信密钥| Relay
    Master -.->|下发配置与通信密钥| Egress
    Master -.->|下发配置与通信密钥| NatNode
```

---

## 🐳 Docker 容器部署

如果您习惯使用 Docker 管理服务，本项目已自带完整的生产级 Docker 构建套件：

### 使用 Docker Compose 一键启动：
```bash
# 1. 启动容器（后台运行，默认映射 2053 端口）
docker compose up -d

# 2. 查看容器实时日志
docker compose logs -f b-agentui
```

### 单纯 Docker 命令行运行：
```bash
docker build -t b-agentui-lite:beta .
docker run -d --name b-agentui -p 2053:2053 --restart=always b-agentui-lite:beta
```

---

## 📂 常用系统管理指令 (Linux systemctl)

| 指令 | 说明 |
| :--- | :--- |
| `systemctl status b-agentui` | 查看 B-AgentUI 后台运行状态与近期错误信息 |
| `systemctl restart b-agentui` | 重启控制面板服务 |
| `systemctl stop b-agentui` | 停止控制面板服务 |
| `journalctl -u b-agentui -f -n 50` | 实时查看最近 50 条系统后台运行日志 |

---

## 📄 许可证 (License)

本项目采用 **MIT License** 开源。授权任何人免费使用、修改与二次分发。
