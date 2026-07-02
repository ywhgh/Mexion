/* ─────────────────────────────────────────────────────────────────────────
   group-config.js — 分组归属配置
   后端 /api/user/groups 返回的 provider/providers 是业务归属来源。
   本文件只保留用户端 UI 兜底：
   · 后端 provider 缺失时，GROUP_PROVIDER_MAP 才参与展示归类
   · 补充能力/图标/令牌创建元数据 → 在 GROUP_META 里加条目
   · 新增关键词推断规则 → 在 PLATFORM_KEYWORDS 里加条目
   provider 键优先使用 newapi 后端订阅 provider 口径：
     openai / anthropic / google / xai / xiaomi / deepseek / alibaba /
     moonshot / zhipu / baidu / tencent / minimax / mistral / cohere /
     perplexity / openrouter / others
   注：mixed/domestic 仅表示前端展示桶，不作为后端 provider 扣费口径。
───────────────────────────────────────────────────────────────────────── */

/* 精确分组归属表：写在哪个 provider 下就显示在那里
   不在此表中的分组，由 PLATFORM_KEYWORDS 关键词推断
   最终兜底为 'others'                                       */
var GROUP_PROVIDER_MAP = {
  anthropic:['Claude 官 Key', 'Claude - Max', 'Claude Kiro - 高缓'],
  openai:   ['GPT - Codex', 'GPT - Codex - Pro', 'GPT - Pro渠道', 'GPT 生图', 'GPT 自渠道生图', 'Codex 订阅', 'Codex Subscription', 'gpt-codex', 'gpt-codex-pro', 'gpt-image', 'gpt-image-self', 'codex-sub-90m', 'codex-90-monthly', 'default'],
  google:   ['哈吉米 Gemini'],
  xai:      ['Grok', 'grok', 'xAI', 'xai'],
  domestic: ['国产模型'],
  xiaomi:   ['小米Mimo'],
};

/* 分组补充元数据：只写需要明确指定的字段，其余取默认值
   id     — 内部 token 绑定用（前端专用，与 legacy-api slug 无关）
   sub    — true = 订阅制（默认 false = 余额制）
   img    — true = 支持图像生成（默认 false）
   scopes — 能力范围，决定卡片 cap 标签：
            'claude' 'openai' 'gemini_text' 'gemini_image'
            'deepseek' 'qwen' 'xai' 'xiaomi'                */
var GROUP_META = {
  'Claude 官 Key':      { id: 13, scopes: ['claude'] },
  'claude-official':    { id: 13, scopes: ['claude'] },
  'Claude - Max':       { id: 27, scopes: ['claude'] },
  'claude-max':         { id: 27, scopes: ['claude'] },
  'Claude Kiro - 高缓': { id: 16, scopes: ['claude'] },
  'claude-kiro':        { id: 16, scopes: ['claude'] },
  'GPT - Codex':        { id: 15, img: true, scopes: ['openai'] },
  'gpt-codex':          { id: 15, img: true, scopes: ['openai'] },
  'GPT - Codex - Pro':  { id: 14,            scopes: ['openai'] },
  'GPT - Pro渠道':      { id: 14,            scopes: ['openai'] },
  'gpt-codex-pro':      { id: 14,            scopes: ['openai'] },
  'GPT 生图':           { id: 10, img: true  },
  'gpt-image':          { id: 10, img: true  },
  'GPT 自渠道生图':     { id: 11, img: true  },
  'gpt-image-self':     { id: 11, img: true  },
  '哈吉米 Gemini':      { id: 29, img: true, scopes: ['gemini_text', 'gemini_image'] },
  'gemini':             { id: 29, img: true, scopes: ['gemini_text', 'gemini_image'] },
  '国产模型':           { id: 30,            scopes: ['deepseek', 'qwen'] },
  'domestic':           { id: 30,            scopes: ['deepseek', 'qwen'] },
  'Codex 订阅':         { id: 31, sub: true, scopes: ['openai'] },
  'Codex Subscription': { id: 31, sub: true, scopes: ['openai'] },
  'codex-sub-90m':      { id: 31, sub: true, scopes: ['openai'] },
  'codex-90-monthly':   { id: 31, sub: true, scopes: ['openai'] },
  'Grok':               { id: 33,            scopes: ['xai'] },
  'grok':               { id: 33,            scopes: ['xai'] },
  'xAI':                { id: 33,            scopes: ['xai'] },
  'xai':                { id: 33,            scopes: ['xai'] },
  '小米Mimo':           { id: 32,            scopes: ['xiaomi'] },
  'default':            { id: 1  },
};
