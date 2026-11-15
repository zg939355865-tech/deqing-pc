# vc-* 结构参考（手写页与 Schema 对照用的组件组合参考）

> 本文件承接原 `blocks/` 中组件组合示例与说明的职责；页面级骨架配方由 `schemas/policies/recipes.json` 唯一维护。2026-10-28 删除区块、骨架与相关生成脚本后，
> 结构不再由脚本拼装：**Schema 页由 `tools/pagegen/generate/page-from-schema.mjs` 生成，
> 手写／人工维护页照本文件的结构直接写 `vc-*` HTML**。
> 只记结构与类名，不含任何色值、字号与 `<style>`；样式一律取 `assets/components/{tokens,components}.css`。
> 样式基准以人工维护的工厂管理页为准；生成页必须使用相同 `vc-*` 面板、表格、详情与操作结构，不叠加外层装饰容器。

---

## 0. 页面外壳（所有页面共用）

```html
<html lang="zh-CN" data-theme="light">
<head>
  <meta charset="utf-8">
  <title>{菜单名}</title>
  <link rel="stylesheet" href="../../assets/components/tokens.css">
  <link rel="stylesheet" href="../../assets/components/components.css">
</head>
<body class="vc-page {页面根类}">
  <div class="vc-content">…视图…</div>
  <script src="../../assets/components/behaviors.js"></script>
</body>
</html>
```

- 页面根元素带 `data-component-baseline="veridix-component-baseline-v1"`（与 `manifest.json` 的 `baseline` 一致）。
- `data-theme` 由框架页经 `?theme=` 决定：`light`（默认）／`portal`。
- 页面根类：菜单页 `.pg-page`、工作台 `.wb-page`、工厂管理 `.fac-page`，新页面照此命名；样式作用域规则见 `rules/prototype.md` §7.1。

## 1. 页面配方

七种页面配方的机器可读唯一结构定义位于 `schemas/policies/recipes.json`；生成器与 `tools/pagegen/describe.mjs` 共用该文件。本节继续说明配方的组件组合细节，不再重复维护配方名称、适用场景和区域顺序。

每页先按 `pageType` 选择对应配方；若现有配方无法表达页面，先补充并验证配方或组件能力，不在页面中另造版式。

多视图页面：外层一个 `data-behavior="page-view"` 容器，各视图 `data-view="list|detail|form"`，
视图入口用 `data-view-target="detail"`；除首视图外每个视图至少一个入口。
视图容器本身只负责切换与隐藏状态，不加 `vc-section`、边框或卡片底；查询区、表格、详情描述区、表单等内容组件自行承载区块外观，避免视图外壳与内部组件重复套卡片。

## 2. 区块结构

### 2.1 `pagehead`（页头）

```html
<!-- standard -->
<header class="vc-pagehead" data-component="pagehead" data-variant="standard">
  <div>
    <h1 data-slot="title">客户管理</h1>
    <p class="vc-pagehead__desc" data-slot="meta">页面用途一句话</p>
  </div>
  <div class="vc-pagehead__ops" data-slot="actions">
    <button class="vc-btn vc-btn--primary" type="button" data-act="create" data-view-target="form">新建客户</button>
  </div>
</header>

<!-- detail（详情头：带返回、不带编辑按钮） -->
<button class="vc-btn vc-btn--text vc-back" type="button" data-slot="back" data-view-target="list">返回列表</button>
<header class="vc-pagehead vc-detail-head" data-component="pagehead" data-variant="detail">
  <div>
    <h1 data-slot="title">客户名称</h1>
    <p class="vc-detail-head__meta" data-slot="meta">客户编码 · 状态</p>
  </div>
</header>
```

页头可在 `vc-pagehead__ops` 中承载上下文标签；Schema 页通过 `PageHeader.contextBadge` 输出，不在内容区再创建第二个页头。

### 2.2 `toolbar`（查询区）

```html
<form class="vc-search" role="search" aria-label="客户查询" data-component="toolbar"
      data-variant="query" data-fields="3">
  <label class="vc-search__item"><span class="vc-search__label">关键字</span>
    <input class="vc-input" type="search" name="keyword" placeholder="客户名称／客户编码／客户简称">
  </label>
  <label class="vc-search__item"><span class="vc-search__label">所属行业</span>
    <select class="vc-select" name="industry"><option value="">全部</option></select>
  </label>
  <div class="vc-search__ops" data-slot="actions">
    <button class="vc-btn" type="reset">重置</button>
    <button class="vc-btn vc-btn--primary" type="submit">查询</button>
  </div>
</form>
```

- 宽屏桌面（≥1280px）优先单屏呈现主要内容；常用查询条件不超过 5 个时，优先将条件和操作压为单行，使用策略计算的 `data-grid-columns`／`data-ops-start`；更多条件维持默认 4 列，最后一行有空位时操作同行，窄屏回到响应式布局。
- 条件 ≥5 个时加 `vc-search--pair` 并用 `data-behavior="collapse"` 折叠。

### 2.3 `table`（列表）

```html
<section class="vc-section vc-section--tight" data-component="table" data-variant="standard">
  <div class="vc-toolbar" data-slot="header">
    <h2 class="vc-toolbar__title">客户列表</h2>
    <div class="vc-toolbar__ops" data-slot="actions">…批量操作…</div>
  </div>

  <div class="vc-table__wrap" data-slot="columns">
    <table class="vc-table" style="--table-min:1120px" data-behavior="table-all">
      <thead><tr><th>客户名称</th><th>客户编码</th><th>状态</th><th>创建时间</th><th>操作</th></tr></thead>
      <tbody data-slot="rows">
        <tr>
          <td><a href="#" class="vc-link" data-act="view" data-view-target="detail">华鲁新材料</a></td>
          <td>C-1001</td>
          <td><span class="vc-tag vc-tag--ok">正常</span></td>
          <td>2026-10-01 09:12</td>
          <td>
            <button class="vc-btn vc-btn--text" type="button" data-act="edit" data-view-target="form">编辑</button>
            <button class="vc-btn vc-btn--text vc-btn--danger" type="button" data-act="delete">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="vc-table__empty" data-slot="empty" hidden>
    <span class="vc-state__title">暂无数据</span>
    <p class="vc-state__hint">调整查询条件后重试，或新建第一条。</p>
  </div>

  <div class="vc-pager" data-slot="footer">
    <span class="vc-pager__total">共 128 条</span>
    <div class="vc-pager__right">
      <select class="vc-pager__size" aria-label="每页条数"><option>20</option><option>50</option></select>
      <button class="vc-pager__btn" type="button" disabled>上一页</button>
      <button class="vc-pager__btn is-current" type="button">1</button>
      <button class="vc-pager__btn" type="button">下一页</button>
    </div>
  </div>
</section>
```

- 单元格**单行不换行**（`white-space: nowrap` 由 `.vc-table td` 保证），列宽不足时 `.vc-table__wrap` 横向滚动；长文本用 `.vc-ellipsis` 截断并保留 `title`。
- 行操作只放「编辑／删除」；详情从主字段链接进入，不设「查看」。
- 列表条数只在分页条出现，工具栏标题不重复「共 N 条」。
- 删除仅在业务范围允许时出现；使用 `vc-btn vc-btn--text vc-btn--danger`，点击必须进入共享二次确认行为。
- 只有 Schema 明确声明可批量操作且至少有一个 `requiresSelection` 动作时才渲染全选与行勾选框；禁止出现没有对应动作的孤立勾选框。
- 启用／停用通过 `rowActions[].statuses` 与 `rowActions[].nextStatus` 声明，由 `behaviors.js` 统一更新状态标签与可见动作；页面不得复制编写状态切换脚本。

### 2.4 `form`（新增／编辑表单）

```html
<header class="vc-pagehead vc-detail-head" data-component="pagehead">
  <div>
    <button class="vc-btn vc-btn--text vc-back" type="button" data-view-target="list">返回列表</button>
    <h1 data-form-title>新建客户</h1>
    <p class="vc-pagehead__desc">登记客户主档信息。</p>
  </div>
</header>

<section class="vc-section vc-form-page" data-component="form" data-variant="standard">
  <div class="vc-alert vc-alert--err" role="alert" hidden></div>

  <div class="vc-form-grid" data-slot="fields">
    <label class="vc-field"><span class="vc-field__label"><i class="vc-req">*</i>客户名称</span>
      <input class="vc-input" name="name" aria-required="true">
      <span class="vc-field__error" hidden>请输入客户名称</span>
    </label>
    <label class="vc-field"><span class="vc-field__label">所属行业</span>
      <select class="vc-select" name="industry"></select>
    </label>
  </div>

  <div class="vc-form-actions" data-slot="actions">
    <button class="vc-btn" type="button" data-act="cancel" data-view-target="list">取消</button>
    <button class="vc-btn vc-btn--primary" type="submit">保存</button>
  </div>
</section>
```

- 多视图表单统一使用共享页面头（返回入口、`h1` 标题、说明）、`vc-form-page` 卡片、两列 `vc-form-grid` 与右侧 `vc-form-actions`；视图外层不额外套卡片。
- 两列栅格；长文本字段加 `vc-field--span2`。校验错误就地提示在字段下方。
- 列表类新增／编辑表单与详情默认含唯一一组只读「创建人／创建时间」；都在备注前。不得默认补「所属公司」或重复的当前登录人字段。
- 文本标识列默认左对齐；数值列按明确的 `cell/component` 类型、字段词元或数值标签识别，不得用代码子串误判（如 `account` 不能命中 `count`）。

### 2.5 `detail`（详情）

```html
<section class="vc-section" data-component="detail" data-variant="section">
  <header class="vc-pagehead vc-detail-head" data-slot="head">
    <div><h1>客户名称</h1><p class="vc-detail-head__meta">客户编码 · 状态</p></div>
  </header>

  <div class="vc-split" data-slot="sections">
    <div class="vc-split__main">
      <dl class="vc-desc vc-desc--2">
        <div class="vc-desc__item"><dt>客户名称</dt><dd>华鲁新材料</dd></div>
        <div class="vc-desc__item"><dt>客户编码</dt><dd>C-1001</dd></div>
      </dl>
    </div>
    <aside class="vc-split__side" data-slot="side">…辅助信息…</aside>
  </div>
</section>
```

- 只有一个字段区块时**不出区块标题**；字段名与列表表头同一字体口径；页头不放「编辑」按钮。
- 详情双列通过 `layoutColumns: 2` 明确声明，生成 `.vc-desc vc-desc--2`；不得依赖 CSS 默认列数。

### 2.6 `tabs`（页签）

```html
<section class="vc-section" data-component="tabs" data-variant="standard">
  <div class="vc-tabs" role="tablist" aria-label="客户详情">
    <button class="vc-tab is-current" type="button" role="tab" aria-selected="true">基本信息</button>
    <button class="vc-tab" type="button" role="tab" aria-selected="false">账号与配额</button>
  </div>
  <div class="vc-tabpanel is-current" role="tabpanel">…</div>
</section>
```

行业分类使用 `vc-tabs vc-tabs--industry`，继续复用 `vc-tabs__item`、`vc-tabpanel` 和共享页签行为，不编写页面级切换脚本。

**应用卡片变体**使用已登记的卡片部件：

```html
<article class="vc-card vc-card--app" data-component="card">
  <div class="vc-card__head"><h3><span class="vc-card__mark" aria-hidden="true">…图标…</span>应用名称</h3></div>
  <p class="vc-card__desc">应用说明</p>
  <div class="vc-card__foot">
    <span>月调用 <strong>12,480</strong></span>
    <div class="vc-card__ops"><span class="vc-tag vc-tag--ok">已上线</span><button class="vc-btn">申请开通</button></div>
  </div>
</article>
```

卡片列表使用 `vc-grid--4` 响应式栅格；视图容器本身不套 `vc-section`。
应用卡片按参考图维持 16px 内边距、38px 图标框、16px 标题与 12px 描述；卡片最小高 170px，描述下方以虚线分隔。状态标签与申请按钮统一为 72px × 24px，状态颜色按状态语义变化。四列卡片间距 16px；悬停或键盘焦点进入时显示橙色左侧强调线和浮起阴影；页脚保持月调用、状态、申请入口同一行，窄屏优先降列，不得横向溢出。

### 2.7 `tree`（左树）

```html
<aside class="vc-section vc-tree-panel" data-component="tree" data-variant="panel">
  <div class="vc-toolbar" data-slot="header"><h2 class="vc-toolbar__title">组织</h2></div>
  <ul class="vc-tree" data-slot="nodes" data-behavior="tree">
    <li class="vc-tree__node"><button class="vc-tree__label is-current" type="button">总部</button>
      <ul class="vc-tree__children"><li class="vc-tree__node"><button class="vc-tree__label" type="button">华东分部</button></li></ul>
    </li>
  </ul>
</aside>
```

带左树的页面用 `vc-split vc-split--aside`，左树在 `.vc-split__main` 之前。

### 2.8 `steps` / `kpi` / `chat`

```html
<ol class="vc-steps" data-component="steps" data-variant="standard">
  <li class="vc-step is-done"><span class="vc-step__title">上传数据</span></li>
  <li class="vc-step is-current"><span class="vc-step__title">训练中</span><span class="vc-step__desc">已完成 62%</span></li>
  <li class="vc-step"><span class="vc-step__title">发布</span></li>
</ol>

<div class="vc-kpi-row" data-component="kpi" data-variant="standard">
  <div class="vc-kpi"><span class="vc-kpi__label">在用客户</span><strong class="vc-kpi__value">128</strong></div>
</div>

<div class="vc-work" data-component="chat" data-variant="chat">
  <main class="vc-chat" data-slot="messages">…</main>
</div>
```

### 2.9 `states`（空／加载／异常／无权限）

```html
<div class="vc-state vc-state--empty" data-component="states" data-variant="empty" hidden>
  <span class="vc-state__title">暂无数据</span>
  <p class="vc-state__hint">首次使用请先新建。</p>
  <div data-slot="action"><button class="vc-btn vc-btn--primary" type="button">新建</button></div>
</div>
```

变体：`vc-state--empty`／`vc-state--loading`／`vc-state--error`／`vc-state--denied`。

### 2.10 `overlay`（弹窗／抽屉）与 `gate`（确认门）

```html
<div class="vc-modal__mask" hidden></div>
<div class="vc-modal" role="dialog" aria-modal="true" aria-labelledby="m-title" hidden>
  <div class="vc-modal__head"><h3 id="m-title">新建客户</h3>
    <button class="vc-btn vc-btn--text" type="button" aria-label="关闭" data-act="close">×</button></div>
  <div class="vc-modal__body">…</div>
  <div class="vc-modal__foot"><button class="vc-btn" type="button" data-act="cancel">取消</button>
    <button class="vc-btn vc-btn--primary" type="button" data-act="confirm">确定</button></div>
</div>

<div class="vc-gate__mask" hidden></div>
<div class="vc-gate" role="dialog" aria-modal="true" data-behavior="gate" hidden>
  <h3>停用客户</h3>
  <ul class="vc-gate__facts"><li>影响对象：华鲁新材料</li><li>生效范围：该客户下全部账号</li></ul>
  <p class="vc-gate__warn">停用后不可恢复，需重新申请开通。</p>
  <div class="vc-gate__ops">
    <button class="vc-btn" type="button" data-act="cancelGate">取消</button>
    <button class="vc-btn vc-btn--danger" type="button" data-act="confirmDisable">确认停用</button>
  </div>
</div>
```

- 二次确认三要素：**影响对象、生效范围、可回滚方式**；生成与执行分离，不一步直达。
- 静态展示用 `vc-gate vc-gate--static`；抽屉用 `vc-drawer` / `vc-drawer__head` / `vc-drawer__body` / `vc-drawer__foot`。

## 3. 行为层（`assets/components/behaviors.js`，不准在页面复制脚本）

| 能力 | 用法 |
|---|---|
| 多视图切换 | `data-behavior="page-view"`＋`[data-view]`／`[data-view-target]` |
| 页签 | `data-behavior="tabs"` |
| 树折叠 | `data-behavior="tree"` |
| 折叠容器／查询区展开 | `data-behavior="collapse"` |
| 开关 | `data-behavior="switch"` |
| 日期面板 | `data-behavior="date"` |
| 表格全选与排序 | `data-behavior="table-all"` |
| 表单校验 | `data-behavior="validate"` |
| 上传列表 | `data-behavior="upload"` |
| 确认门 | `data-behavior="gate"` |

状态类只允许 `is-hidden`／`is-active`／`is-current`／`is-open`。

## 4. 五类状态（每个视图缺一不可）

`空`／`正常`／`异常`／`无权限`／`加载中`。长任务视图须区分「排队中」与「运行中」，并写明可中断性。
