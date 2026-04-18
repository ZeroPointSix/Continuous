# 寸止 MCP 工具安装指南

## 快速安装

### 方式一：使用安装脚本（推荐）

```bash
# 克隆仓库
git clone https://github.com/imhuso/cunzhi.git
cd cunzhi

# 运行安装脚本
chmod +x install.sh
./install.sh
```

### 方式二：下载预编译版本

从 [Releases](https://github.com/imhuso/cunzhi/releases) 页面下载对应平台的预编译版本：

- **Linux**: `cunzhi-linux-x86_64.tar.gz`
- **macOS**: `cunzhi-macos-universal.tar.gz`
- **Windows**: `cunzhi-windows-x86_64.zip`

#### 安装步骤：

1. 下载对应平台的压缩包
2. 解压到任意目录
3. 将解压目录添加到 PATH 环境变量

```bash
# Linux/macOS 示例
tar -xzf cunzhi-linux-x86_64.tar.gz
sudo cp 等一下 寸止 /usr/local/bin/
```

```powershell
# Windows 示例
# 解压 zip 文件到 C:\cunzhi
# 将 C:\cunzhi 添加到系统 PATH
```

## 验证安装

```bash
# 检查工具是否正确安装
寸止 --help
等一下 --help
```

## MCP 客户端配置

将以下配置添加到您的 MCP 客户端配置文件中：

```json
{
  "mcpServers": {
    "寸止": {
      "command": "寸止"
    }
  }
}
```

## 使用方法

### MCP 服务器模式
```bash
寸止  # 启动 MCP 服务器
```

### 弹窗界面模式
```bash
等一下                          # 启动设置界面
等一下 --mcp-request file       # MCP 弹窗模式
```

## 工具说明

- **寸止**: MCP 服务器，提供记忆管理和智能交互功能
- **等一下**: 弹窗界面，用于用户交互和设置

## 系统要求

- **Linux**: x86_64 架构
- **macOS**: 10.15+ (支持 Intel 和 Apple Silicon)
- **Windows**: Windows 10+ x86_64

## 故障排除

### 权限问题
```bash
# Linux/macOS
chmod +x 等一下 寸止
```

### PATH 问题
确保安装目录已添加到 PATH 环境变量中。

### 依赖问题
两个 CLI 工具必须在同一目录下才能正常工作。

## 开发者安装

如果您想从源码构建：

```bash
# 安装依赖
cargo --version  # 需要 Rust 1.70+
pnpm --version   # 需要 pnpm

# 构建
pnpm install
pnpm build
cargo build --release

# 安装
cp target/release/等一下 target/release/寸止 ~/.local/bin/
```

## 更新

### 使用预编译版本
重新下载最新版本并替换旧文件。

### Windows：使用 GitHub Actions 产物替换（推荐）

> 适用于你现在这条链路：先触发 `Build CLI Tools`，再用最新 run 的 Windows 产物覆盖本机旧 exe。

1. **停止旧进程**（先关掉正在运行的 `等一下.exe` / `寸止.exe`）
2. **下载最新 run 产物**（示例）

```powershell
# 1) 触发构建
gh workflow run "Build CLI Tools" --ref main

# 2) 查看最新 run
gh run list --workflow "Build CLI Tools" --limit 1

# 3) 确认 run 成功（把 <RUN_ID> 换成实际值）
gh run view <RUN_ID> --json status,conclusion,url

# 4) 下载产物到本地目录
gh run download <RUN_ID> --dir "target/ci-artifacts/run-<RUN_ID>"
```

3. **解压 Windows 包**

```powershell
Expand-Archive -Path "target/ci-artifacts/run-<RUN_ID>/cunzhi-cli-windows-x86_64/cunzhi-cli-main-windows-x86_64.zip" `
  -DestinationPath "target/ci-artifacts/run-<RUN_ID>/windows-unpacked" -Force
```

4. **覆盖你正在使用的安装目录**（关键）

假设你的实际安装目录是 `C:\cunzhi`：

```powershell
Copy-Item -Force "target/ci-artifacts/run-<RUN_ID>/windows-unpacked/等一下.exe" "C:\cunzhi\等一下.exe"
Copy-Item -Force "target/ci-artifacts/run-<RUN_ID>/windows-unpacked/寸止.exe" "C:\cunzhi\寸止.exe"
```

如果提示“文件被占用（being used by another process）”，先停止占用进程再覆盖：

```powershell
Get-Process | Where-Object { $_.ProcessName -like '*寸止*' -or $_.ProcessName -like '*等一下*' } | Stop-Process -Force
```

5. **验证更新结果**

```powershell
& "C:\cunzhi\等一下.exe" --help
& "C:\cunzhi\寸止.exe" --help
```

6. **（可选）直接用解压目录先试跑**

```powershell
Start-Process -FilePath "target\ci-artifacts\run-<RUN_ID>\windows-unpacked\等一下.exe"
```

> 注意：只有把新 exe 覆盖到你 PATH 实际指向的目录，日常命令调用才会真正“更新到新版本”。

#### 快速定位 Windows 的真实覆盖目录（PATH 命中目录）

```powershell
Get-Command "等一下" -All | Select-Object Name,Path
Get-Command "寸止" -All | Select-Object Name,Path
where.exe 等一下
where.exe 寸止
```

如果两组输出一致，就用该目录作为“替换目标目录”。

### 卸载重装前：先备份配置文件（Windows）

默认配置文件位置：

```text
C:\Users\<你的用户名>\AppData\Roaming\cunzhi\config.json
```

推荐一键备份到桌面（带时间戳）：

```powershell
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$src = Join-Path $env:APPDATA "cunzhi\config.json"
$dst = Join-Path ([Environment]::GetFolderPath('Desktop')) ("cunzhi-config-backup-" + $timestamp + ".json")
Copy-Item -Force $src $dst
```

重装后恢复：

```powershell
Copy-Item -Force "C:\Users\<你的用户名>\Desktop\cunzhi-config-backup-xxxxxx.json" (Join-Path $env:APPDATA "cunzhi\config.json")
```

### 使用源码
```bash
git pull
./install.sh
```
