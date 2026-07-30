# wepost — 朋友圈文案生成器

一款帮你轻松生成高质量朋友圈文案的 Web 应用 ✨

## 功能特色

- **6 大分类**：日常 / 旅游 / 美食 / 情感 / 励志 / 职场
- **4 种风格**：文艺 / 搞笑 / 温暖 / 励志
- **关键词定制**：输入关键词，让文案更贴合你的场景
- **一键生成 5 条**：每次生成多条候选文案，随机不重复
- **一键复制**：点击"复制"按钮，直接粘贴到朋友圈

## 快速开始

```bash
# 安装依赖
pip install -r requirements.txt

# 启动应用
python app.py
```

浏览器访问 `http://127.0.0.1:5000` 即可使用。

## 项目结构

```
wepost/
├── app.py              # Flask 应用入口
├── generator.py        # 文案生成引擎
├── requirements.txt
├── templates/
│   └── index.html      # 前端页面
└── tests/
    └── test_app.py     # 自动化测试
```

## 运行测试

```bash
python -m pytest tests/ -v
```