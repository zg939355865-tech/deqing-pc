/* ─────────────────────────────────────────────────────────────
   智驾 · 共享行为层  assets/components/behaviors.js
   版本：V1.2（2026-10-29：页签增加方向键/Home/End键盘切换、roving tabindex 与目标文本同步；新增轻量原型反馈 data-feedback-target）
   定位：只做「同一套组件在各页面行为一致」，不含业务逻辑、不含数据请求、无第三方依赖。
   引用：<script src="../components/behaviors.js" defer></script>
   原则：
     1. 自动绑定用语义类名（vc-tabs / vc-tree / vc-collapse / vc-switch），页面无需写一行脚本；
     2. 需显式开启的用 data-behavior~="…"，写在容器元素上；
     3. 幂等：同一节点重复 init 不重复绑定（dataset.vcBound）；
     4. 不改外观，只切换既有状态类与 aria 属性；样式一律在 components.css。
   已覆盖：页签、树折叠、折叠容器、开关、日期面板、表格全选与排序、表单校验、上传列表、行删除／状态操作确认、页面视图切换。
   ───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var VC = window.VC || (window.VC = {});

  function each(sel, root, fn) {
    Array.prototype.forEach.call((root || document).querySelectorAll(sel), fn);
  }
  function bind(el, name, handler, evt) {
    if (!el || el.dataset.vcBound && el.dataset.vcBound.indexOf(name) > -1) return;
    el.dataset.vcBound = (el.dataset.vcBound ? el.dataset.vcBound + ',' : '') + name;
    el.addEventListener(evt || 'click', handler);
  }

  /* ── 页签：按钮 aria-controls 指向面板，切换 active 与 hidden ── */
  function initTabs(root) {
    each('[role="tablist"]', root, function (list) {
      var tabs = list.querySelectorAll('[role="tab"]');
      function activate(btn) {
        Array.prototype.forEach.call(tabs, function (b) {
          var on = b === btn;
          b.classList.toggle('vc-tabs__item--active', on);
          b.setAttribute('aria-selected', String(on));
          b.tabIndex = on ? 0 : -1;
          var panel = document.getElementById(b.getAttribute('aria-controls'));
          if (panel) panel.hidden = !on;
        });
        var targetId = btn.getAttribute('data-tab-label-target');
        var label = targetId && document.getElementById(targetId);
        if (label) label.textContent = btn.textContent.trim();
      }
      Array.prototype.forEach.call(tabs, function (btn) {
        bind(btn, 'tab', function () { activate(btn); });
        bind(btn, 'tab-keyboard', function (event) {
          if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          var current = Array.prototype.indexOf.call(tabs, btn);
          var next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1
            : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
          activate(tabs[next]);
          tabs[next].focus();
        }, 'keydown');
      });
    });
  }

  /* ── 原型反馈：将按钮声明的文案写入页内状态区，不发请求 ── */
  function initFeedback(root) {
    each('[data-feedback-target][data-feedback-message]', root, function (btn) {
      bind(btn, 'feedback', function () {
        var target = document.getElementById(btn.getAttribute('data-feedback-target'));
        if (!target) return;
        target.hidden = false;
        target.textContent = btn.getAttribute('data-feedback-message');
      });
    });
  }

  /* ── 树：点箭头展开/收起，叶子节点跳过 ── */
  function initTrees(root) {
    each('.vc-tree__toggle', root, function (t) {
      if (t.classList.contains('vc-tree__toggle--leaf')) return;
      bind(t, 'tree', function (e) {
        e.stopPropagation();
        t.closest('.vc-tree__node').classList.toggle('is-open');
      });
    });
  }

  /* ── 折叠容器：整条组头可点 ── */
  function initCollapse(root) {
    each('.vc-collapse__head', root, function (h) {
      bind(h, 'collapse', function () {
        h.closest('.vc-collapse__item').classList.toggle('is-open');
      });
    });
  }

  /* ── 开关：click 与空格/回车切换，同步 aria-checked ── */
  function initSwitch(root) {
    each('.vc-switch[role="switch"]', root, function (s) {
      bind(s, 'switch', function () {
        var on = !s.classList.contains('is-on');
        s.classList.toggle('is-on', on);
        s.setAttribute('aria-checked', String(on));
      });
      bind(s, 'switch-key', function (e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); s.click(); }
      }, 'keydown');
    });
  }

  /* ── 日期面板：点触发器开合；快捷项写入文案后关闭；点外部关闭 ── */
  function initDatepicker(root) {
    each('[data-behavior~="datepicker"]', root, function (box) {
      var trigger = box.querySelector('.vc-datepicker__trigger');
      var panel = box.querySelector('.vc-datepicker__panel');
      if (!trigger || !panel) return;
      panel.hidden = true;
      bind(trigger, 'dp', function (e) {
        e.stopPropagation();
        panel.hidden = !panel.hidden;
      });
      bind(panel, 'dp-panel', function (e) { e.stopPropagation(); });
      each('.vc-datepicker__quick button', box, function (q) {
        bind(q, 'dp-quick', function (e) {
          e.stopPropagation();
          var label = trigger.querySelector('.ph');
          if (label) { label.textContent = q.textContent.trim(); label.classList.remove('ph'); }
          panel.hidden = true;
        });
      });
    });
    /* 全局只绑一次：点空白处关闭所有面板 */
    if (!document.documentElement.dataset.vcDpBound) {
      document.documentElement.dataset.vcDpBound = '1';
      document.addEventListener('click', function () {
        each('.vc-datepicker__panel', document, function (p) { p.hidden = true; });
      });
    }
  }

  /* ── 表格全选：thead 勾选框联动 tbody，半选态用 indeterminate ── */
  function initSelectAll(root) {
    each('table[data-behavior~="select-all"]', root, function (table) {
      var all = table.querySelector('thead input[type="checkbox"]');
      var rows = table.querySelectorAll('tbody input[type="checkbox"]');
      if (!all || !rows.length) return;

      function syncFromRows() {
        var checked = 0;
        Array.prototype.forEach.call(rows, function (r) { if (r.checked) checked++; });
        all.checked = checked === rows.length && checked > 0;
        all.indeterminate = checked > 0 && checked < rows.length;
      }
      bind(all, 'sa', function () {
        Array.prototype.forEach.call(rows, function (r) { r.checked = all.checked; });
        syncFromRows();
      });
      Array.prototype.forEach.call(rows, function (r) { bind(r, 'sa-row', syncFromRows); });
      syncFromRows();
    });
  }

  /* ── 表格排序：给 th 加 data-sort，点一次升序再点降序；纯前端排序 ── */
  function initSort(root) {
    each('table[data-behavior~="sort"]', root, function (table) {
      var headRow = table.querySelector('thead tr');
      var body = table.querySelector('tbody');
      if (!headRow || !body) return;

      each('th[data-sort]', headRow, function (th) {
        var idx = Array.prototype.indexOf.call(headRow.children, th);
        bind(th, 'sort', function () {
          var dir = th.dataset.sortDir === 'asc' ? 'desc' : 'asc';
          each('th[data-sort]', headRow, function (o) { delete o.dataset.sortDir; });
          th.dataset.sortDir = dir;

          var rows = Array.prototype.slice.call(body.querySelectorAll('tr'));
          rows.sort(function (a, b) {
            var x = cellValue(a, idx), y = cellValue(b, idx);
            if (x.num !== null && y.num !== null) return dir === 'asc' ? x.num - y.num : y.num - x.num;
            return dir === 'asc' ? String(x.text).localeCompare(String(y.text), 'zh-Hans-CN')
                                 : String(y.text).localeCompare(String(x.text), 'zh-Hans-CN');
          });
          rows.forEach(function (r) { body.appendChild(r); });
        });
      });

      function cellValue(tr, i) {
        var cell = tr.children[i];
        if (!cell) return { text: '', num: null };
        var text = (cell.textContent || '').trim();
        var num = parseFloat(text.replace(/[,%\s]/g, ''));
        return { text: text, num: isFinite(num) ? num : null };
      }
    });
  }

  /* ── 表单校验：容器加 data-behavior~="validate"，字段用 data-required 与 data-err ──
        就地提示，不清空已填值；提交按钮用 data-validate-submit 控制禁用 ── */
  function initValidate(root) {
    each('[data-behavior~="validate"]', root, function (box) {
      var fields = box.querySelectorAll('[data-required]');
      var submit = box.querySelector('[data-validate-submit]');

      function check(input) {
        var v = (input.value || '').trim();
        var ok = !!v && !(input.dataset.pattern && !new RegExp(input.dataset.pattern).test(v));
        var field = input.closest('.vc-field');
        if (!field) return ok;
        field.classList.toggle('vc-field--invalid', !ok);
        var err = field.querySelector('.vc-field__err');
        if (!ok && !err) {
          err = document.createElement('span');
          err.className = 'vc-field__err';
          field.appendChild(err);
        }
        if (!ok) err.textContent = input.dataset.err || '该项为必填，请补全后再提交';
        if (ok && err && !input.dataset.errKeep) err.textContent = '';
        return ok;
      }

      function checkAll() {
        var ok = true;
        Array.prototype.forEach.call(fields, function (f) { if (!check(f)) ok = false; });
        if (submit) submit.disabled = !ok;
        return ok;
      }

      Array.prototype.forEach.call(fields, function (f) {
        bind(f, 'v-blur', function () { check(f); checkAll(); }, 'blur');
        bind(f, 'v-input', function () { check(f); checkAll(); }, 'input');
      });
      if (submit) bind(submit, 'v-submit', function (e) { if (!checkAll()) e.preventDefault(); });
      checkAll();
    });
  }

  /* ── 上传：拖入/选择后追加一行，行内 × 移除；仅前端演示，不做真实上传 ── */
  function initUpload(root) {
    each('[data-behavior~="upload"]', root, function (box) {
      var drop = box.querySelector('.vc-upload__drop');
      var input = box.querySelector('input[type="file"]');
      var list = box.querySelector('.vc-upload__list');
      if (!drop || !input || !list) return;

      bind(drop, 'up-open', function () { input.click(); });
      bind(input, 'up-change', function () {
        Array.prototype.forEach.call(input.files || [], function (f) { addRow(f.name, humanSize(f.size)); });
        input.value = '';
      });
      ['dragover', 'dragenter'].forEach(function (t) {
        bind(drop, 'up-' + t, function (e) { e.preventDefault(); }, t);
      });
      bind(drop, 'up-drop', function (e) {
        e.preventDefault();
        Array.prototype.forEach.call((e.dataTransfer && e.dataTransfer.files) || [], function (f) {
          addRow(f.name, humanSize(f.size));
        });
      });
      each('.vc-upload__x', list, bindRemove);

      function bindRemove(btn) {
        bind(btn, 'up-x', function () {
          var item = btn.closest('.vc-upload__item');
          if (item) item.remove();
        });
      }
      function addRow(name, size) {
        var li = document.createElement('li');
        li.className = 'vc-upload__item vc-upload__item--ok';
        li.innerHTML = '<span class="vc-upload__name"></span><span class="vc-upload__size"></span>' +
          '<span class="vc-upload__state vc-upload__state--ok">已解析</span>' +
          '<button class="vc-upload__x" type="button" aria-label="移除">×</button>' +
          '<span class="vc-upload__bar"><i style="width:100%"></i></span>';
        li.querySelector('.vc-upload__name').textContent = name;
        li.querySelector('.vc-upload__size').textContent = size;
        list.appendChild(li);
        bindRemove(li.querySelector('.vc-upload__x'));
      }
      function humanSize(n) {
        if (!n && n !== 0) return '';
        return n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
      }
    });
  }

  /* ── 列表行操作：删除／停用使用公共确认门；启停状态与可见动作保持同步 ── */
  function initRowMutations(root) {
    each('[data-component-name="ProTable"] table.vc-table', root, function (table) {
      if (table.dataset.vcMutationBound) return;
      table.dataset.vcMutationBound = 'true';
      var owner = table.closest('[data-view]') || table.parentElement;
      var pending = null, mask = null, gate = null, title = null, message = null;
      var cancel = null, confirm = null;

      function rowLabel(row) {
        try {
          var data = JSON.parse(row.getAttribute('data-row-value') || '{}');
          return String(data.name || data.account || data.code || data.id || data.uid || '该记录');
        } catch (_) { return '该记录'; }
      }
      function setStatus(row, button) {
        var code = button.getAttribute('data-status-code') || 'status';
        var value = button.getAttribute('data-next-status') || '';
        if (!value) return;
        row.setAttribute('data-row-status', value);
        if (row.__row) row.__row[code] = value;
        try {
          var data = JSON.parse(row.getAttribute('data-row-value') || '{}');
          data[code] = value;
          row.setAttribute('data-row-value', JSON.stringify(data));
        } catch (_) {}
        var cell = row.querySelector('td[data-column="' + code.replace(/"/g, '\\"') + '"]');
        if (!cell) return;
        var variant = value === '正常' || value === '启用' ? 'vc-tag--ok'
          : value === '停用' || value === '禁用' ? 'vc-tag--err' : 'vc-tag--info';
        cell.innerHTML = '<span class="vc-tag ' + variant + '"></span>';
        cell.firstElementChild.textContent = value;
        syncStatusActions(row);
      }
      function syncStatusActions(row) {
        Array.prototype.forEach.call(row.querySelectorAll('button[data-visible-statuses]'), function (button) {
          var values = [];
          try { values = JSON.parse(button.getAttribute('data-visible-statuses') || '[]'); } catch (_) {}
          button.hidden = values.length > 0 && values.indexOf(row.getAttribute('data-row-status') || '') < 0;
        });
      }
      function closeGate() {
        if (gate) gate.hidden = true;
        if (mask) mask.hidden = true;
        pending = null;
      }
      function ensureGate() {
        if (gate) return;
        mask = document.createElement('div');
        mask.className = 'vc-gate__mask';
        mask.hidden = true;
        gate = document.createElement('section');
        gate.className = 'vc-gate';
        gate.setAttribute('role', 'dialog');
        gate.setAttribute('aria-modal', 'true');
        gate.setAttribute('aria-labelledby', 'row-mutation-dialog-title');
        gate.hidden = true;
        title = document.createElement('h3');
        title.id = 'row-mutation-dialog-title';
        message = document.createElement('p');
        message.className = 'vc-gate__warn';
        var ops = document.createElement('div');
        ops.className = 'vc-gate__ops';
        cancel = document.createElement('button');
        cancel.className = 'vc-btn vc-btn--text';
        cancel.type = 'button';
        cancel.textContent = '取消';
        confirm = document.createElement('button');
        confirm.className = 'vc-btn vc-btn--danger';
        confirm.type = 'button';
        confirm.textContent = '确认';
        ops.appendChild(cancel);
        ops.appendChild(confirm);
        gate.appendChild(title);
        gate.appendChild(message);
        gate.appendChild(ops);
        document.body.appendChild(mask);
        document.body.appendChild(gate);
        bind(cancel, 'row-mutation-cancel', closeGate);
        bind(mask, 'row-mutation-mask', closeGate);
        bind(confirm, 'row-mutation-confirm', function () {
          if (!pending) return;
          var action = pending.action;
          var row = pending.row;
          if (action === 'delete') {
            row.remove();
            table.dispatchEvent(new CustomEvent('vc:table-mutation', { bubbles: true, detail: { table: table, action: action } }));
          } else if (action === 'disable') setStatus(row, pending.button);
          closeGate();
        });
      }
      function openGate(action, button, row) {
        ensureGate();
        pending = { action: action, button: button, row: row };
        title.textContent = action === 'delete' ? '确认删除' : '确认停用';
        message.textContent = action === 'delete'
          ? '确认删除“' + rowLabel(row) + '”？本原型确认后仅从当前列表移除。'
          : '确认停用“' + rowLabel(row) + '”？停用后可通过启用恢复。';
        confirm.textContent = action === 'delete' ? '确认删除' : '确认停用';
        mask.hidden = false;
        gate.hidden = false;
        confirm.focus();
      }
      table.querySelectorAll('tbody tr').forEach(syncStatusActions);
      owner.addEventListener('click', function (event) {
        var button = event.target.closest('button[data-act]');
        if (!button || !table.contains(button) || !button.closest('tbody')) return;
        var row = button.closest('tr');
        var action = button.getAttribute('data-confirm-action');
        if (action === 'delete' || action === 'disable') {
          event.preventDefault();
          event.stopPropagation();
          openGate(action, button, row);
          return;
        }
        if (button.hasAttribute('data-next-status')) {
          event.preventDefault();
          event.stopPropagation();
          setStatus(row, button);
        }
      }, true);
    });
  }

  /* ── 确认门：data-behavior~="gate-open" 打开同页 .vc-gate，gate-close 关闭 ── */
  function initGate(root) {
    each('[data-behavior~="gate-open"]', root, function (btn) {
      bind(btn, 'gate-open', function () {
        var gate = document.querySelector('.vc-gate');
        var mask = document.querySelector('.vc-gate__mask');
        if (gate) gate.hidden = false;
        if (mask) mask.hidden = false;
        if (gate) gate.querySelector('button') && gate.querySelector('button').focus();
      });
    });
    each('[data-behavior~="gate-close"]', root, function (btn) {
      bind(btn, 'gate-close', function () {
        var gate = document.querySelector('.vc-gate');
        var mask = document.querySelector('.vc-gate__mask');
        if (gate) gate.hidden = true;
        if (mask) mask.hidden = true;
      });
    });
  }

  /* ── 页面视图切换：容器 data-behavior~="page-view"；[data-view] 为视图，[data-view-target] 为入口 ── */
  function initPageViews(root) {
    each('[data-behavior~="page-view"]', root, function (box) {
      function show(name) {
        each('[data-view]', box, function (v) {
          v.hidden = v.getAttribute('data-view') !== name;
        });
        /* data-view-only="list"：仅在该视图显示的页头等，不在其他视图重复出现 */
        each('[data-view-only]', box, function (el) {
          el.hidden = el.getAttribute('data-view-only') !== name;
        });
        if (window.scrollTo) window.scrollTo(0, 0);
      }
      each('[data-view-target]', box, function (btn) {
        bind(btn, 'page-view', function (e) {
          e.preventDefault();
          show(btn.getAttribute('data-view-target'));
        });
      });
      /* 可用 ?view=<值> 直达某个视图，便于评审与回归 */
      var initial = new URLSearchParams(location.search).get('view');
      if (initial) show(initial);
      box.showView = show;
    });
  }
  /* 供页面脚本在数据绑定后跳转视图；name 为 [data-view] 的值 */
  VC.showView = function (name, root) {
    each('[data-behavior~="page-view"]', root || document, function (box) {
      if (box.showView) box.showView(name);
    });
  };

  /* ── 初始化：可对整页或子树重复调用 ── */
  VC.init = function (root) {
    root = root || document;
    initTabs(root);
    initFeedback(root);
    initTrees(root);
    initCollapse(root);
    initSwitch(root);
    initDatepicker(root);
    initSelectAll(root);
    initSort(root);
    initValidate(root);
    initUpload(root);
    initRowMutations(root);
    initGate(root);
    initPageViews(root);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { VC.init(); });
  } else {
    VC.init();
  }
})();
