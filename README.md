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
- 脚本自动启动，右下角出现控制面板
- Open https://tinder.com/app/recs
- The script starts automatically and a control panel appears in the bottom-right corner

---

## 功能 / Features

- ✅ 实时 Swipe 计数显示 / Real-time swipe counter
- ✅ 速度滑块，5 档可调（0.3s ~ 12s）/ Speed slider with 5 levels (0.3s ~ 12s)
- ✅ 每档速度为随机区间，模拟人工操作 / Each speed level uses a random interval to mimic human behavior
- ✅ 一键暂停 / 继续，状态指示灯同步 / One-click pause/resume with status indicator
- ✅ 后台运行，无需停留在当前 tab / Runs in background tab
- ✅ 无任何外部依赖 / No external dependencies

---

## 速度档位 / Speed Levels

| 档位 / Level | 间隔 / Interval | 说明 / Note |
|:---:|:---:|:---:|
| 1 | 0.3 ~ 0.7 秒 | 极快 / Very Fast |
| 2 | 0.7 ~ 1.5 秒 | 快 / Fast |
| 3 | 1 ~ 3 秒 | 默认 / Default |
| 4 | 3 ~ 6 秒 | 慢 / Slow |
| 5 | 6 ~ 12 秒 | 极慢 / Very Slow |

---

## 注意事项 / Notes

- 若 Tinder 弹出付费或验证弹窗，脚本会暂停直到弹窗消失
- If Tinder shows a paywall or verification popup, the script pauses until it's dismissed
- Tinder 更新 DOM 结构后 selector 可能失效，届时提 Issue
- If Tinder updates its DOM, the selector may break — feel free to open an Issue
- 建议使用默认档位（3档），过快可能触发 Tinder 风控
- Default speed level (3) is recommended — too fast may trigger Tinder's anti-bot detection

---

## 免责声明 / Disclaimer

**中文**

本项目由 AI 辅助编写，作者不对代码的准确性、稳定性或安全性作任何保证。本脚本仅供学习和技术研究目的，使用者需自行承担所有风险。使用本脚本可能违反 Tinder 的服务条款（Terms of Service），可能导致账号被限制或封禁。作者不对任何因使用本脚本产生的账号损失、数据丢失或其他后果承担任何责任。请在了解相关风险后自行决定是否使用。

**English**

This project was developed with the assistance of AI. The author makes no guarantees regarding the accuracy, stability, or security of the code.This script is intended for educational and technical research purposes only. Use at your own risk. Using this script may violate Tinder's Terms of Service and could result in account restrictions or bans. The author assumes no responsibility for any account loss, data loss, or other consequences arising from the use of this script. Please make an informed decision before use.

---
