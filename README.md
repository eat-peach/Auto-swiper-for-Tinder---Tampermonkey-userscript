# Auto-swiper-for-Tinder---Tampermonkey-userscript

一个自动右划 Tinder 的油猴脚本，无需一直停留在页面，后台静默运行。

A Tampermonkey userscript that automatically swipes right on Tinder. Runs silently in the background — no need to stay on the tab.

---

## 安装 / Installation

**1. 安装 Tampermonkey / Install Tampermonkey**

- Chrome: [Tampermonkey](https://www.tampermonkey.net/)

**2. 安装脚本 / Install the script**

- 打开 `tinder-auto-swiper.user.js` → 点击 **Raw** → Tampermonkey 会自动弹出安装提示
- Open `tinder-auto-swiper.user.js` → Click **Raw** → Tampermonkey will prompt you to install

**3. 使用 / Usage**

- 打开 https://tinder.com/app/recs
- 脚本自动启动，每隔 1~3 秒随机右划一次
- Open https://tinder.com/app/recs
- The script starts automatically and swipes right every 1~3 seconds

---

## 功能 / Features

- ✅ 随机间隔 1~3 秒，模拟人工操作 / Random 1~3s delay to mimic human behavior
- ✅ 后台运行，无需停留在当前 tab / Runs in background tab
- ✅ Console 实时显示划卡计数 / Real-time swipe count in console
- ✅ 无任何外部依赖 / No external dependencies

---

## 注意事项 / Notes

- 若 Tinder 弹出付费或验证弹窗，脚本会暂停直到弹窗消失
- If Tinder shows a paywall or verification popup, the script pauses until it's dismissed
- Tinder 更新 DOM 结构后 selector 可能失效，届时提 Issue
- If Tinder updates its DOM, the selector may break — feel free to open an Issue

---

## 免责声明 / Disclaimer

**中文**

本项目由 AI 辅助编写，作者不对代码的准确性、稳定性或安全性作任何保证。本脚本仅供学习和技术研究目的，使用者需自行承担所有风险。使用本脚本可能违反 Tinder 的服务条款（Terms of Service），可能导致账号被限制或封禁。作者不对任何因使用本脚本产生的账号损失、数据丢失或其他后果承担任何责任。请在了解相关风险后自行决定是否使用。

**English**

This project was developed with the assistance of AI. The author makes no guarantees regarding the accuracy, stability, or security of the code.This script is intended for educational and technical research purposes only. Use at your own risk. Using this script may violate Tinder's Terms of Service and could result in account restrictions or bans. The author assumes no responsibility for any account loss, data loss, or other consequences arising from the use of this script. Please make an informed decision before use.

---
