import random
from typing import Optional

# ── Templates organized by category and mood ──────────────────────────────────

TEMPLATES = {
    "日常": {
        "文艺": [
            "生活里没有什么大事，只有这一杯茶的温度和窗外的光。{keyword}",
            "平凡的日子里，{keyword}，已是最好的安排。",
            "时光很慢，{keyword}，刚刚好。",
            "某个普通的下午，{keyword}，忽然觉得生活挺好的。",
            "不用去哪里，{keyword}，就是今天最美的风景。",
            "日子不疾不徐，{keyword}，岁月就是这样温柔。",
        ],
        "搞笑": [
            "今天又是元气满满的一天！（其实起床花了两个小时）{keyword}",
            "{keyword} 但我依然热爱生活，主要是热爱躺着。",
            "人间清醒 ing，{keyword}，清醒了但还是很懒。",
            "今日份快乐已到账，{keyword}，请查收。",
            "努力生活的第 N 天，{keyword}，坚持就是胜利（大概）。",
        ],
        "温暖": [
            "小确幸：{keyword}，这就够了。",
            "生活给了我{keyword}，我觉得一切都值得。",
            "感谢今天，{keyword}，让我相信好事会发生。",
            "被{keyword}治愈的一天，谢谢生活。",
            "{keyword}，平凡日子里的小光亮。",
        ],
        "励志": [
            "每一天都是新的开始，{keyword}，继续加油。",
            "不必完美，{keyword}，只要今天比昨天更好一点。",
            "把每个普通的日子过得有意义，{keyword}，就是成功。",
        ],
    },
    "旅游": {
        "文艺": [
            "有些地方，去了就不想回来。{keyword}",
            "旅行的意义，不是打卡，而是遇见另一个自己。{keyword}",
            "{keyword}，远方果然值得。",
            "人间值得，{keyword}，我来了。",
            "把脚印留在{keyword}，把心留在风里。",
            "不必问去哪里，{keyword}，出发就是答案。",
            "世界很大，{keyword}，我想去看看。",
        ],
        "搞笑": [
            "说走就走的旅行！（提前订了三个月的票）{keyword}",
            "{keyword}，我来了！钱也没了。",
            "旅游的本质是：花钱受罪然后说好开心。{keyword}",
            "拍了一百张照片，{keyword}，发一张就够了。",
            "别问我去哪了，{keyword}，问就是穷游。",
        ],
        "温暖": [
            "每一次出发，都是对生活的热爱。{keyword}",
            "{keyword}，感谢可以出门的每一天。",
            "和喜欢的人，去喜欢的地方，{keyword}，足矣。",
            "旅途中遇见的美好，{keyword}，都会成为记忆里的光。",
        ],
        "励志": [
            "去更远的地方，做更好的自己。{keyword}",
            "走出去，{keyword}，世界比你想象的更宽广。",
            "{keyword}，人生就是一场旅行，不要停下脚步。",
        ],
    },
    "美食": {
        "文艺": [
            "最治愈的事，莫过于好好吃一顿饭。{keyword}",
            "{keyword}，人间烟火气，最抚凡人心。",
            "把对生活的热爱，藏在每一口食物里。{keyword}",
            "有好吃的，就有好心情。{keyword}，今天也不错。",
            "一个人吃饭，{keyword}，也可以很幸福。",
        ],
        "搞笑": [
            "减肥这件事，明天再说。{keyword}，今天先吃。",
            "{keyword}，我的自制力在香味面前彻底缴械。",
            "说好的节食，{keyword}，撑死算了。",
            "人生苦短，{keyword}，先吃再说。",
            "今天的快乐全靠{keyword}，嘴巴比我诚实多了。",
        ],
        "温暖": [
            "一碗热汤，{keyword}，是这个季节最好的礼物。",
            "{keyword}，被食物治愈的一天，心满意足。",
            "好吃的东西，{keyword}，总能让人忘掉所有烦恼。",
            "记忆里最深的味道，{keyword}，是家的感觉。",
        ],
        "励志": [
            "好好吃饭，认真生活，{keyword}，元气满满出发。",
            "吃饱了才有力气打拼，{keyword}，加油。",
        ],
    },
    "情感": {
        "文艺": [
            "有些人，{keyword}，你遇见了就知道是对的。",
            "{keyword}，原来喜欢一个人是这种感觉。",
            "最好的陪伴，是{keyword}，什么都不用说也很好。",
            "时间会证明，{keyword}，所有的等待都值得。",
            "喜欢你，{keyword}，就是这么简单。",
            "遇见你之前，{keyword}，不知道生活可以这么好。",
        ],
        "搞笑": [
            "{keyword} 但我还是喜欢你，算了，命该如此。",
            "心动是什么感觉？{keyword}，大概就是你。",
            "我本来是个冷漠的人，{keyword}，直到遇见你。",
            "谁说恋爱会让人变傻？我本来就挺傻的。{keyword}",
        ],
        "温暖": [
            "有你在，{keyword}，哪里都是家。",
            "{keyword}，被喜欢的人喜欢，是最幸运的事。",
            "你笑起来，{keyword}，我觉得所有事都值得。",
            "最好的关系，{keyword}，是彼此成为对方的光。",
        ],
        "励志": [
            "爱自己，{keyword}，才能更好地爱别人。",
            "先成为更好的自己，{keyword}，再遇见更好的人。",
        ],
    },
    "励志": {
        "文艺": [
            "所有的努力，{keyword}，都不会白费。",
            "慢慢来，{keyword}，每一步都算数。",
            "你现在经历的，{keyword}，都将成为你的铠甲。",
            "不必和别人比，{keyword}，只需今天比昨天好一点。",
            "成长就是，{keyword}，一次次与自己和解。",
        ],
        "搞笑": [
            "努力ing，{keyword}，虽然看不出来，但心是热的。",
            "我不是躺平，{keyword}，我是在积蓄力量。",
            "加油！{keyword}！虽然不知道为什么，但就是要加油！",
            "今天也是被自己感动的一天，{keyword}，我好厉害。",
        ],
        "温暖": [
            "{keyword}，你已经很努力了，先给自己鼓个掌。",
            "不管多难，{keyword}，你都撑过来了，了不起。",
            "每一个坚持的日子，{keyword}，都是在为未来铺路。",
        ],
        "励志": [
            "只要不放弃，{keyword}，就还有可能。",
            "今天的努力，{keyword}，是明天的底气。",
            "相信自己，{keyword}，你比你想象的更强大。",
            "越努力，{keyword}，越幸运。",
            "没有捷径，{keyword}，但坚持本身就是答案。",
        ],
    },
    "职场": {
        "文艺": [
            "工作不只是谋生，{keyword}，也是一种修行。",
            "把每件事做到最好，{keyword}，是对自己最大的尊重。",
            "职场中的每一次历练，{keyword}，都是成长的礼物。",
        ],
        "搞笑": [
            "上班是不可能上班的，{keyword}，但还是上了。",
            "今日份打工人语录：{keyword}，打工魂燃烧中。",
            "又是被工作支配的一天，{keyword}，但工资还没到账。",
            "在公司认真摸鱼的第 N 天，{keyword}，暂时没被发现。",
            "老板说要有狼性，{keyword}，我决定好好睡一觉养精蓄锐。",
        ],
        "温暖": [
            "工作虽累，{keyword}，但总有人让你觉得值得。",
            "{keyword}，感谢同事们，工作因为有你们更有意思。",
            "累了就歇一歇，{keyword}，然后继续出发。",
        ],
        "励志": [
            "今天比昨天进步一点点，{keyword}，这就足够了。",
            "{keyword}，职场路上，拼的是坚持。",
            "每一次加班，{keyword}，都是在为梦想充值。",
        ],
    },
}

EMOJI_MAP = {
    "日常": ["☀️", "🌸", "✨", "🍃", "🌿", "💫", "🌙", "🎵"],
    "旅游": ["✈️", "🌍", "🗺️", "🏔️", "🌊", "🏖️", "⛰️", "🌅"],
    "美食": ["🍜", "🍰", "☕", "🍣", "🥘", "🍕", "🧁", "🍱"],
    "情感": ["💕", "🌹", "💫", "🥰", "✨", "💖", "🌸", "💝"],
    "励志": ["💪", "🔥", "⚡", "🌟", "🚀", "💡", "🏆", "✨"],
    "职场": ["💼", "☕", "💻", "📊", "🎯", "📈", "🙌", "⚡"],
}

MOOD_SUFFIX = {
    "文艺": ["", "🌸", "✨", "🍃", "🌿"],
    "搞笑": ["😂", "🤣", "😅", "🙃", "😆"],
    "温暖": ["🌻", "💛", "🌷", "☀️", "💗"],
    "励志": ["💪", "🔥", "⚡", "🌟", "🚀"],
}


def _fill_keyword(template: str, keyword: str) -> str:
    """Replace {keyword} placeholder; if no placeholder, append keyword."""
    if "{keyword}" in template:
        kw = keyword if keyword else ""
        return template.replace("{keyword}", kw).strip(" ，。！")
    if keyword:
        return f"{template} {keyword}"
    return template


def generate_copies(
    category: str,
    mood: str,
    keyword: Optional[str] = None,
    count: int = 5,
) -> list[str]:
    """
    Generate *count* WeChat-Moments copy strings.

    Parameters
    ----------
    category : one of TEMPLATES keys
    mood     : one of the inner keys (文艺 / 搞笑 / 温暖 / 励志)
    keyword  : optional custom text inserted into template placeholders
    count    : number of results to return (capped at available templates)
    """
    keyword = (keyword or "").strip()

    cat_templates = TEMPLATES.get(category, TEMPLATES["日常"])
    mood_templates = cat_templates.get(mood, cat_templates.get("文艺", []))

    # Fall back gracefully
    if not mood_templates:
        mood_templates = next(iter(cat_templates.values()))

    pool = list(mood_templates)
    random.shuffle(pool)
    selected = pool[: min(count, len(pool))]

    emojis = EMOJI_MAP.get(category, ["✨"])
    suffixes = MOOD_SUFFIX.get(mood, [""])

    results = []
    for tpl in selected:
        text = _fill_keyword(tpl, keyword)
        # Prepend a random category emoji
        prefix_emoji = random.choice(emojis)
        # Append a random mood emoji (may be empty string)
        suffix_emoji = random.choice(suffixes)
        copy = f"{prefix_emoji} {text} {suffix_emoji}".strip()
        results.append(copy)

    return results
