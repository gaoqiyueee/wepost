# 朋友圈文案生成器 · 部署指南

## 第一步：把代码推上 GitHub

在你的电脑上（或直接在这个沙箱里）：

```bash
cd 朋友圈文案生成器_20260420

# 初始化 git
git init
git add .
git commit -m "feat: 朋友圈文案生成器 初始版本"

# 去 github.com 新建一个仓库（名字随意），然后：
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

---

## 第二步：部署到 Vercel

1. 打开 [vercel.com](https://vercel.com) 登录
2. 点击 **"Add New Project"** → Import 你刚推的 GitHub 仓库
3. Framework 选 **Next.js**（会自动检测）
4. 点开 **"Environment Variables"**，添加以下变量：

| 变量名 | 值 |
|--------|-----|
| `API_KEY` | 你的 API Key |
| `API_BASE_URL` | `https://oneapi.hk/v1` |
| `PRIMARY_MODEL` | `claude-sonnet-4-6` |
| `FALLBACK_MODEL` | `claude-haiku-4-5-20251001` |

5. 点击 **Deploy** 🚀

部署完成后 Vercel 会给你一个 `xxx.vercel.app` 的链接，就是你的 Demo 地址！

---

## 关于 API Key

你的 API Key 已经有了 ✅

> **注意**：API Key 只需填入 Vercel 环境变量，绝对不要写进代码文件里！

---

## 本地调试（可选）

```bash
# 复制环境变量配置文件
cp .env.example .env.local

# 编辑 .env.local，填入你的 API Key
# 然后：
npm install
npm run dev
# 访问 http://localhost:3000
```
