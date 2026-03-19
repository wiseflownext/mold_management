# 模具管理APP - iOS 构建指南

## 项目信息

- Bundle ID: `com.wiseflow.moldApp`
- 应用名称: 模具管理
- Flutter 版本: 3.27+
- 最低支持: iOS 12.0

---

## 一、环境准备

### 硬件要求

macOS 电脑（Mac Mini / MacBook / Mac Studio），Windows 无法构建 iOS。

### 软件安装

```bash
# 1. Xcode（App Store 安装，版本 15+）
# 安装后执行：
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -runFirstLaunch

# 2. Xcode 命令行工具
xcode-select --install

# 3. Flutter SDK
brew install flutter

# 4. CocoaPods
brew install cocoapods

# 5. 验证环境
flutter doctor
```

确保 `flutter doctor` 输出中 iOS 相关项全部打勾。

### Apple Developer 账号

- 注册地址: https://developer.apple.com
- 费用: $99/年（企业版 $299/年）
- 用途: 签名证书、TestFlight 分发、App Store 上架

---

## 二、获取代码

```bash
git clone https://github.com/wiseflownext/mold_management.git
cd mold_management/mold_app
```

---

## 三、安装依赖

```bash
flutter pub get
cd ios
pod install
cd ..
```

如 `pod install` 失败：

```bash
cd ios
pod deintegrate
pod cache clean --all
pod install --repo-update
cd ..
```

---

## 四、Xcode 签名配置

### 打开项目

```bash
open ios/Runner.xcworkspace
```

> 注意：必须打开 `.xcworkspace`，不是 `.xcodeproj`

### 配置签名

1. 左侧选择 `Runner` 项目
2. 中间面板选择 `Runner` target
3. 切换到 `Signing & Capabilities` 标签
4. `Team` 下拉选择你的 Apple Developer 账号
5. 确认 `Bundle Identifier` 为 `com.wiseflow.moldApp`
6. 勾选 `Automatically manage signing`

Xcode 会自动创建开发证书和 Provisioning Profile。

---

## 五、构建

### 调试版（连接 iPhone 运行）

```bash
# 连接 iPhone 后
flutter run -d ios
```

首次运行需要在 iPhone 上信任开发者：
设置 → 通用 → VPN与设备管理 → 信任开发者证书

### Release 版（IPA 文件）

```bash
flutter build ipa --release
```

输出路径：`build/ios/ipa/mold_app.ipa`

### 指定导出选项

```bash
# Ad Hoc 分发
flutter build ipa --release --export-method ad-hoc

# App Store 分发
flutter build ipa --release --export-method app-store
```

---

## 六、分发安装

### 方式一：TestFlight（推荐）

```bash
# 上传到 App Store Connect
xcrun altool --upload-app \
  -f build/ios/ipa/*.ipa \
  -t ios \
  -u YOUR_APPLE_ID \
  -p APP_SPECIFIC_PASSWORD
```

或使用 Transporter App（Mac App Store 下载）直接拖入 IPA 上传。

上传后在 https://appstoreconnect.apple.com 添加测试人员，受邀者通过 TestFlight App 安装。

### 方式二：蒲公英 / fir.im

1. 注册 https://www.pgyer.com 或 https://fir.im
2. 上传 IPA 文件
3. 生成下载链接或二维码
4. 需要 Ad Hoc 签名 + 设备 UDID 注册

### 方式三：Ad Hoc 直接安装

1. 在 Apple Developer Portal 注册测试设备 UDID
2. 生成 Ad Hoc Provisioning Profile
3. 构建 IPA
4. 通过 Apple Configurator 或 AirDrop 安装到设备

---

## 七、无 Mac 替代方案

### Codemagic（推荐）

1. 注册 https://codemagic.io
2. 关联 GitHub 仓库
3. 上传 Apple 签名证书和 Provisioning Profile
4. 配置构建流程，自动输出 IPA
5. 免费额度：500 分钟/月

### GitHub Actions

在仓库创建 `.github/workflows/ios.yml`：

```yaml
name: iOS Build
on:
  workflow_dispatch:

jobs:
  build:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: subosito/flutter-action@v2
        with:
          flutter-version: '3.27.0'
      - run: flutter pub get
        working-directory: mold_app
      - run: cd ios && pod install
        working-directory: mold_app
      - run: flutter build ios --release --no-codesign
        working-directory: mold_app
```

> 注意：GitHub Actions 的 macOS Runner 免费但签名配置较复杂

---

## 八、常见问题

### CocoaPods 版本冲突

```bash
sudo gem install cocoapods
pod repo update
```

### 签名错误

确认 Apple Developer 账号状态正常，证书未过期。在 Xcode → Preferences → Accounts 中重新登录。

### 最低版本问题

项目已设置 iOS 12.0，如需修改：
编辑 `ios/Podfile` 第一行 `platform :ios, '12.0'`

### 真机调试信任问题

iPhone 上：设置 → 通用 → VPN与设备管理 → 选择开发者APP → 信任
