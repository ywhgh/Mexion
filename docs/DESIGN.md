# Mexion Design System

## Register

product

## Scene

自托管开发者在本机或小型服务器旁快速核查订阅、Token、中转和日志。界面应像一份可操作的技术期刊，而不是泛 SaaS 控制台。

## Tokens

| Token | Value | Usage |
|---|---|---|
| paper | `#FAF8F5` | 主背景 |
| vellum | `#FDFDF9` | 容器底 |
| ink | `#111111` | 主文字与反白按钮 |
| mute | `#737373` | 次文字 |
| rule | `#171717` | 1px 分割线 |
| cinnabar | `#C93B2B` | 激活、hover、关键 CTA、警示 |

全站只使用上述 6 色和 white。朱砂红像盖章一样克制。

## Typography

- 标题：Noto Serif SC，`font-serif`，`tracking-wide`。
- 数据：JetBrains Mono，`font-mono`。
- 正文：system sans。

## Shape

- `borderRadius` 全部为 0。
- `boxShadow` 为空。
- 区块通过 `border border-rule` 和 `border-dashed` 分隔。

## Components

`PaperFrame`、`Header`、`Section`、`TextField`、`TextArea`、`Select`、`Button`、`DataRow`、`Modal`、`TableLedger`、`MonoCode`、`StatusDot` 是基础词汇。

## Interaction

- Hover 只改变边框色或反白。
- 过渡只使用 `transition-colors duration-200`。
- Focus 使用 `focus:outline-none focus:border-cinnabar`。
