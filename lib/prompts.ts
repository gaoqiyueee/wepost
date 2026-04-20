export type Mode = 'basic' | 'academic' | 'era' | 'role'

export type BasicStyle = '文艺' | '搞笑' | '旅行' | '晒娃'
export type Role = '牛马' | '领导' | '作家' | '皇帝' | '自定义'

const ROLE_DESC: Record<Role, string> = {
  牛马: '一个长期996的互联网社畜，身心俱疲但热爱自嘲，看什么都能联想到加班和KPI',
  领导: '一个热衷讲大道理的中层管理者，把所有事都上升到"团队建设""格局""赋能"和"对齐"',
  作家: '一个极度矫情的文艺作家，在任何日常事物中都能发现宏大主题、时代悲剧和存在主义危机',
  皇帝: '大清乾隆皇帝，用文言文和帝王视角描述现代生活，动辄"朕""社稷""江山"',
  自定义: '', // 由用户输入
}

export function buildPrompt(
  mode: Mode,
  options: {
    style?: BasicStyle
    role?: Role
    customRole?: string
    description?: string
    hasImage?: boolean
  }
): { system: string; user: string } {
  const { style, role, customRole, description, hasImage } = options
  const imageContext = hasImage
    ? '（已附上图片，请结合图片内容）'
    : description
    ? `（无图片，请根据以下描述：${description}）`
    : '（无图片，请发挥想象写一条通用文案）'

  switch (mode) {
    case 'basic': {
      const styleGuide: Record<BasicStyle, string> = {
        文艺: '充满诗意和情感，像林徽因附体，善用意象、留白和淡淡的忧愁',
        搞笑: '幽默自嘲，接地气，充满网络梗，让人忍不住点赞',
        旅行: '充满向往与感悟，描述当下美好，让没去的人羡慕，去过的人共鸣',
        晒娃: '温馨又骄傲，把孩子/宠物夸上天，但不显得太刻意',
      }
      return {
        system:
          '你是一个微信朋友圈文案高手，擅长写出有个人特色、引人点赞的文案。输出简洁，不解释，不加任何前缀。',
        user: `${imageContext}
请用【${style}】风格写3条朋友圈文案。

风格要求：${styleGuide[style as BasicStyle]}

规则：
- 每条控制在50字以内
- 可搭配1-3个贴切的emoji
- 三条要有明显差异，不能重复相近意思
- 只输出文案内容，三条之间用 --- 分隔，不加编号`,
      }
    }

    case 'academic': {
      return {
        system:
          '你是一个专门制造"严肃学术包装日常生活"反差喜剧效果的图注撰写者。文风极度严谨学术，但描述的是最普通的日常场景，越认真越好笑。如果图片中存在彩色标注框，请在图注中特别提及被框选的区域，使用"如图中红框/黄框/蓝框所示"等表述。输出简洁，不解释，不加任何前缀。',
        user: `${imageContext}
请用学术论文图注风格为这张日常照片写3条图注。

格式参考：
"图X：受试者于特定时段进行[高度学术化的行为描述]，研究数据表明该行为对[学术化的影响]具有显著相关性（p<0.05，N=1）。"

要求：
- 三条越来越"学术离谱"，可以加括号补充"俗称：XXX"
- 如有彩色标注框，第二条或第三条需引用框内区域
- 可以引用不存在的研究数据、期刊、作者
- 每条不超过80字
- 三条之间用 --- 分隔，不加编号`,
      }
    }

    case 'era': {
      return {
        system:
          '你是一个文风模仿大师，能完美还原不同年代中国人的写作风格，包括用词、语气、标点习惯和时代特征。输出简洁，不解释，不加任何前缀。',
        user: `${imageContext}
请用三种年代风格各写一条朋友圈文案，严格按以下格式输出：

[80年代日记体]
（特点：正式朴实，充满革命乐观主义，动辄"今天""感悟""祖国""进步"，像真实的八十年代日记，不超过60字）

[QQ空间体]
（特点：非主流伤感，大量◇◆▽☆等符号，火星文，动辄"、、"省略号，"那年那月""泪""痛"，不超过60字）

[小红书体]
（特点：大量emoji，"OMG""绝绝子""冲冲冲""姐妹们""氛围感""显瘦""建议收藏"，不超过60字）

每种风格只写一条，严格保持格式。`,
      }
    }

    case 'role': {
      const roleDesc =
        role === '自定义'
          ? `一个"${customRole}"，请深度还原这个角色的思维方式、口头禅和世界观`
          : ROLE_DESC[role as Role]

      return {
        system:
          '你是一个角色扮演文案大师，能深度代入不同身份，用对方的世界观和口吻写朋友圈。输出简洁，不解释，不加任何前缀。',
        user: `${imageContext}
请完全代入以下角色，写3条朋友圈文案：

角色：${role === '自定义' ? customRole : role}
角色描述：${roleDesc}

要求：
- 每条充分展现角色的思维方式、标志性用语和世界观
- 每条不超过70字，可搭配emoji
- 三条要有明显差异
- 三条之间用 --- 分隔，不加编号`,
      }
    }
  }
}
