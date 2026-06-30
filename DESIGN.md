# Design

## System
Axion uses an editorial product register: paper background, ink text, cinnabar stamp accents, zero radius, zero shadow, and 1px rule-based structure.

## Colors
Use only these tokens in product UI:
- paper: #FAF8F5
- vellum: #FDFDF9
- ink: #111111
- mute: #737373
- rule: #171717
- cinnabar: #C93B2B
- white: #FFFFFF only when inverted text is needed

## Typography
- Headings: Noto Serif SC, tracking-wide, numbered with §, PL., Vol., or bracket plates.
- Data and credentials: JetBrains Mono.
- Body: system sans-serif.

## Shape and Elevation
All border radii are zero. All shadows are disabled. Use thin borders and dashed separators instead of cards.

## Components
PaperFrame, Header, Section, TextField, TextArea, Select, Button, DataRow, Modal, TableLedger, MonoCode, and StatusDot form the base vocabulary.

## Interaction
Hover changes border color to cinnabar or inverts ink/white. Transitions are limited to color changes. Focus uses a cinnabar border, never the browser default blue outline.
