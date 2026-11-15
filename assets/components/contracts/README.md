# 资产契约使用说明

| 文件 | 用途 | 谁读 |
|---|---|---|
| `skeletons/<name>.json` | 页面骨架配方：变体、blocks、optionalBlocks、views、states | 生成页面时只读 1 个 |
| `blocks/<name>/block.json` | 区块插槽、变体、默认值、允许子块 | 生成页面时只读用到的 2–4 个 |
| `blocks/<name>/block.html` | 区块结构示例 | 只读用到的区块 |
| `components.json` | 全量类—owner 台账、类名白名单 | `verify` / `impact` / 生成器，不进入页面上下文 |
| `blocks.json` | 13 个区块契约聚合 | 校验与影响分析 |
| `skeletons.json` | 6 套骨架契约聚合 | 校验与页面选择 |
| `demos.json` | 资源中心演示抽取表：owner → 来源文件与抽取根 | `tools/build_gallery.py`，不进入页面上下文 |

## 页面生成的读取预算

- 唯一外壳 `skeletons/base.html`：约 0.9KB
- 1 个骨架配方：约 0.7–1.7KB
- 2–4 个区块契约：约 1.2–2.8KB
- 合计约 **3–5KB**，不含具体业务数据与页面 spec。

## 禁止

- 生成页面时加载 `components.json` 全量（约 49KB，仅校验用）。
- 手改 `components.css`、`component-registry.json`、`manifest.json`、`index.html`；它们由脚本生成（资源中心改 `demos.json` 或资产源后重跑 `tools/build_gallery.py`）。
- 新页面引用 `parts/` 或旧 `page_*_template.html`。