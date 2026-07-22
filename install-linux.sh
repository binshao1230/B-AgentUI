#!/usr/bin/env bash
# ==============================================================================
# B-AgentUI Lite (Beta) - Linux 一键自动化部署与系统守护服务配置脚本
# GitHub: https://github.com/binshao1230/B-AgentUI
# ==============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
cat << "EOF"
  ____       _                    _   _ _____   _      _ _       
 |  _ \     / \   __ _  ___ _ __ | |_| | |_ _| | |    (_) |_ ___ 
 | |_) |   / _ \ / _` |/ _ \ '_ \| __| | | ||  | |    | | __/ _ \
 |  _ <   / ___ \ (_| |  __/ | | | |_| |_| ||  | |___ | | ||  __/
 |_| \_\ /_/   \_\__, |\___|_| |_|\__|\___/___| |_____|_|\__\___|
                 |___/                                           
EOF
echo -e "${NC}"
echo -e "${GREEN}⚡ 欢迎使用 B-AgentUI Lite (Beta) Linux 原生一键部署安装向导${NC}"
echo "=============================================================================="

# 检查 Root 权限
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}[错误] 本脚本必须以 root 权限运行，请执行 sudo -i 后重新运行！${NC}" 1>&2
   exit 1
fi

INSTALL_DIR="/usr/local/b-agentui"
DEFAULT_PORT=2053

# 获取用户输入参数
PORT=${1:-$DEFAULT_PORT}

echo -e "${BLUE}[1/5] 检查并安装必要系统依赖...${NC}"
if command -v apt-get >/dev/null 2>&1; then
    apt-get update -y -qq
    apt-get install -y -qq curl tar gzip net-tools coreutils >/dev/null 2>&1
elif command -v yum >/dev/null 2>&1; then
    yum install -y -q curl tar gzip net-tools coreutils >/dev/null 2>&1
elif command -v dnf >/dev/null 2>&1; then
    dnf install -y -q curl tar gzip net-tools coreutils >/dev/null 2>&1
fi

echo -e "${BLUE}[2/5] 检查 Node.js 运行环境...${NC}"
if ! command -v node >/dev/null 2>&1; then
    echo -e "${YELLOW}未检测到 Node.js，正在全自动安装 Node.js LTS 运行环境...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1 || true
    if command -v apt-get >/dev/null 2>&1; then
        apt-get install -y -qq nodejs >/dev/null 2>&1
    elif command -v yum >/dev/null 2>&1; then
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash - >/dev/null 2>&1 || true
        yum install -y -q nodejs >/dev/null 2>&1
    fi
fi
NODE_VER=$(node -v 2>/dev/null || echo "Unknown")
echo -e "${GREEN}✔ Node.js 已就绪: ${NODE_VER}${NC}"

echo -e "${BLUE}[3/5] 准备 B-AgentUI 运行目录 (${INSTALL_DIR})...${NC}"
mkdir -p "${INSTALL_DIR}"

# 复制当前目录解压或存放的文件到目标安装目录
if [ -d "./dist" ] && [ -f "./server.js" ]; then
    echo -e "${CYAN}检测到本地完整打包文件，正在覆盖同步至 ${INSTALL_DIR}...${NC}"
    cp -rf ./dist "${INSTALL_DIR}/"
    cp -f ./server.js "${INSTALL_DIR}/"
    cp -f ./package.json "${INSTALL_DIR}/" 2>/dev/null || true
else
    echo -e "${CYAN}正在从 GitHub Release 下载 B-AgentUI Lite (Beta) 稳定离线包...${NC}"
    DOWNLOAD_URL="https://github.com/binshao1230/B-AgentUI/releases/download/v1.4.0-beta/B-AgentUI-Lite-Beta-v1.4.0-linux.tar.gz"
    curl -L -o /tmp/b-agentui.tar.gz "${DOWNLOAD_URL}"
    tar -xzf /tmp/b-agentui.tar.gz -C "${INSTALL_DIR}"
    rm -f /tmp/b-agentui.tar.gz
fi

# 确保目录权限正确
chmod -R 755 "${INSTALL_DIR}"

echo -e "${BLUE}[4/5] 注册并创建 systemd 开机自启系统服务...${NC}"
cat << EOF > /etc/systemd/system/b-agentui.service
[Unit]
Description=B-AgentUI Lite (Beta) Web UI Master & Agent Management Panel
After=network.target network-online.target nss-lookup.target

[Service]
Type=simple
User=root
WorkingDirectory=${INSTALL_DIR}
ExecStart=$(command -v node) ${INSTALL_DIR}/server.js --port=${PORT}
Restart=on-failure
RestartSec=5s
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable b-agentui >/dev/null 2>&1
systemctl restart b-agentui

echo -e "${BLUE}[5/5] 开放防火墙端口 ${PORT}...${NC}"
if command -v ufw >/dev/null 2>&1 && ufw status | grep -q "Status: active"; then
    ufw allow "${PORT}/tcp" >/dev/null 2>&1 || true
fi
if command -v firewall-cmd >/dev/null 2>&1 && systemctl is-active --quiet firewalld; then
    firewall-cmd --zone=public --add-port="${PORT}/tcp" --permanent >/dev/null 2>&1 || true
    firewall-cmd --reload >/dev/null 2>&1 || true
fi

# 获取本机 IP
SERVER_IP=$(curl -sSL4 ifconfig.me || curl -sSL4 api.ipify.org || echo "您的服务器IP")

echo "=============================================================================="
echo -e "${GREEN}🎉 恭喜！B-AgentUI Lite (Beta) 原生服务安装部署成功！${NC}"
echo -e "${CYAN}🌐 网页登录访问地址 : ${GREEN}http://${SERVER_IP}:${PORT}${NC}"
echo -e "${CYAN}📂 系统运行目录     : ${INSTALL_DIR}${NC}"
echo -e "${CYAN}💡 常用服务管理命令 :${NC}"
echo -e "   - 查看运行状态 : ${YELLOW}systemctl status b-agentui${NC}"
echo -e "   - 重启面板服务 : ${YELLOW}systemctl restart b-agentui${NC}"
echo -e "   - 停止面板服务 : ${YELLOW}systemctl stop b-agentui${NC}"
echo -e "   - 查看实时日志 : ${YELLOW}journalctl -u b-agentui -f -n 50${NC}"
echo "=============================================================================="
