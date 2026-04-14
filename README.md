# Tinder Auto Swiper

一个自动右划 Tinder 的油猴脚本，支持简介筛选、可视化控制面板，后台静默运行。

A Tampermonkey userscript that automatically swipes right on Tinder with profile filtering and a visual control panel. Runs silently in the background.

---

## 安装 / Installation

**1. 安装 Tampermonkey / Install Tampermonkey**

- Chrome: [Tampermonkey](https://www.tampermonkey.net/)

**2. 安装脚本 / Install the script**

- 打开 `tinder-auto-swiper.user.js` -> 点击 **Raw** -> Tampermonkey 会自动弹出安装提示
- Open `tinder-auto-swiper.user.js` -> Click **Raw** -> Tampermonkey will prompt you to install

**3. 使用 / Usage**

- 打开 https://tinder.com/app/recs
- 右下角出现控制面板，点击 **▶** 开始运行
- Open https://tinder.com/app/recs
- A control panel appears. Click **▶** to start

---

## 功能 / Features

- 实时右划/左划计数 / Real-time swipe counter
- 速度滑块 5 档可调（0.3s ~ 12s），每档随机区间模拟人工操作 / 5-level speed slider with random intervals
- 关键词筛选：匹配简介、Prompt、性取向、语言、烟酒等所有可见资料 / Keyword filtering across full profile
- 距离筛选：超过设定公里数左划 / Distance filter
- 身高筛选：低于设定厘米数左划 / Height filter
- 无身高/距离信息时默认右划 / Defaults to right swipe if info is missing
- 设置持久化，刷新页面自动恢复 / Settings saved across sessions
- 默认暂停，手动开始 / Starts paused by default
- 后台运行，无需停留在当前 tab / Runs in background tab

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

## 更新日志 / Changelog

### V2.0
- 新增简介页全内容筛选（性取向、语言、Prompt、烟酒习惯等所有可见字段）
- 新增距离筛选和身高筛选
- 新增界面语言自动检测，提示关键词应使用的语言
- 说明选项类字段（语言/性取向等）随界面语言，自填简介随对方语言
- 修复按钮定位改用 `sparks-like-default` class，彻底解决误触问题
- 控制面板新增 Tab 分页（主页 / 筛选）
- 新增最小化功能，最小化状态下仍可一键开始/暂停
- 新增面板拖动，可在页面任意位置移动
- 展开时自动修正位置，防止面板超出视窗边缘
- 设置持久化，关键词/距离/身高刷新后自动恢复
- 默认暂停启动，不再自动开始

### V1.0
- 基础自动右划功能
- 随机间隔（1~3 秒）模拟人工操作
- 速度滑块 5 档可调
- 右划/左划计数显示
- 暂停/继续按钮
- 后台运行，无需停留在当前 tab

---

## 注意事项 / Notes

- 若 Tinder 弹出付费或验证弹窗，脚本会暂停直到弹窗消失
- If Tinder shows a paywall or verification popup, the script pauses until dismissed
- Tinder 更新 DOM 后 selector 可能失效，届时提 Issue
- If Tinder updates its DOM, selectors may break. Feel free to open an Issue
- 建议使用默认档位（3档），过快可能触发风控
- Default speed level (3) recommended. Too fast may trigger anti-bot detection

---

## 免责声明 / Disclaimer

**中文**

本项目由 AI 辅助编写，作者不对代码的准确性、稳定性或安全性作任何保证。本脚本仅供学习和技术研究目的，使用者需自行承担所有风险。使用本脚本可能违反 Tinder 的服务条款（Terms of Service），可能导致账号被限制或封禁。作者不对任何因使用本脚本产生的账号损失、数据丢失或其他后果承担任何责任。请在了解相关风险后自行决定是否使用。

**English**

This project was developed with the assistance of AI. The author makes no guarantees regarding the accuracy, stability, or security of the code.This script is intended for educational and technical research purposes only. Use at your own risk. Using this script may violate Tinder's Terms of Service and could result in account restrictions or bans. The author assumes no responsibility for any account loss, data loss, or other consequences arising from the use of this script. Please make an informed decision before use.

---
