/* 2026-11-25 V0.1。AI假设：跨业务待办聚合、待处理/处理中映射及责任人字段。以下全部为情境化虚构样例，不代表现场任务、权限或已接入系统。固定参考时点2026-11-25 10:00，逾期=未完成且计划完成时间早于参考时点。个人样例以“演示账号”为当前人；无派单、审批、完成或控制操作。 */
'use strict';
const personal=document.body.dataset.mode==='personal',now='2026-11-25 10:00';
const rows=[
['WX20261125003','二沉池回流泵异响检查','维修','设备管理','演示账号','处理中','2026-11-25 09:00','2026-11-25 15:00','二沉池','检查回流泵运行异响，记录检查结果。','设备管理/设备维修_V0.1.html','设备维修'],
['XJ20261125002','生化处理区日常巡检','巡检','巡检管理','演示账号','待处理','2026-11-25 08:30','2026-11-25 12:00','生化处理区','按巡检任务核查现场情况并记录。','',''],
['HY20261125001','出水水质检验记录','化验','化验管理','化验人员','待处理','2026-11-25 08:00','2026-11-25 16:00','化验室','完成本次检验任务并登记检验结果。','',''],
['BY20261124002','污泥脱水机计划保养','保养','设备管理','维修人员','处理中','2026-11-24 16:00','2026-11-25 09:00','污泥脱水间','按保养任务开展检查并登记保养记录。','',''],
['CK20261124003','维修材料领用出库办理','库存','库存管理','演示账号','待处理','2026-11-24 15:30','2026-11-25 09:30','物资仓','核对领用物料及数量后办理出库。','库存管理/领料出库_V0.1.html','领料出库'],
['FP20261124001','采购入库收票登记','库存','库存管理','库管人员','待处理','2026-11-24 14:00','2026-11-26 16:00','物资仓','核对到票信息并登记本次收票。','库存管理/入库未收票_V0.1.html','入库收票登记'],
['XJ20261124001','进水泵房巡检记录补充','巡检','巡检管理','巡检人员','待处理','2026-11-24 09:00','2026-11-24 17:00','进水泵房','补充本次巡检任务的现场记录。','',''],
['BY20261123001','鼓风机滤网检查','保养','设备管理','演示账号','待处理','2026-11-23 13:00','2026-11-26 12:00','鼓风机房','完成滤网检查并记录维护情况。','',''],
['WX20261123002','加药泵管路渗漏检修','维修','设备管理','维修人员','处理中','2026-11-23 10:00','2026-11-25 17:00','加药间','检查渗漏部位并记录维修处理情况。','设备管理/设备维修_V0.1.html','设备维修'],
['HY20261123002','来料检验记录登记','化验','化验管理','演示账号','待处理','2026-11-23 08:30','2026-11-24 16:00','化验室','核对来料检验信息并补充登记记录。','','']
].map(r=>Object.fromEntries(['code','name','type','module','owner','status','created','due','place','content','route','menu'].map((k,i)=>[k,r[i]])));
const scope=rows.filter(r=>!personal||r.owner==='演示账号'),$=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let category='',stat='all',page=1,size=5,filters={keyword:'',status:'',owner:''},selected;
$('title').textContent=personal?'工作台':'指挥中心';document.title=$('title').textContent;$('date').textContent='2026年11月25日';
if(personal)$('owner-field').hidden=true;
const types=['维修','保养','巡检','化验','库存'];
$('tabs').innerHTML=['全部',...types].map(x=>`<button class="tab${x==='全部'?' active':''}" role="tab" aria-selected="${x==='全部'}" data-type="${x==='全部'?'':x}">${x}</button>`).join('');
$('owner').innerHTML='<option value="">全部</option>'+[...new Set(scope.map(r=>r.owner))].map(x=>`<option>${esc(x)}</option>`).join('');
function overdue(r){return r.due<now}
const counts={all:scope.length,pending:scope.filter(r=>r.status==='待处理').length,progress:scope.filter(r=>r.status==='处理中').length,overdue:scope.filter(overdue).length};
if($('stats'))$('stats').innerHTML=[['all',personal?'我的事项':'全厂事项'],['pending','待处理'],['progress','处理中'],['overdue','已逾期']].map(([key,label])=>`<button class="stat${key==='all'?' active':''}" data-key="${key}" aria-pressed="${key==='all'}"><span>${label}</span><strong>${counts[key]}</strong></button>`).join('');
function render(){let data=scope.filter(r=>(!category||r.type===category)&&(!filters.keyword||(r.code+r.name).includes(filters.keyword))&&(!filters.status||r.status===filters.status)&&(!filters.owner||r.owner===filters.owner)&&(stat==='all'||stat==='pending'&&r.status==='待处理'||stat==='progress'&&r.status==='处理中'||stat==='overdue'&&overdue(r))).sort((a,b)=>b.created.localeCompare(a.created));const pages=Math.max(1,Math.ceil(data.length/size));page=Math.min(page,pages);
$('tbody').innerHTML=data.slice((page-1)*size,page*size).map(r=>`<tr><td title="${esc(r.code)}"><button class="link" data-code="${esc(r.code)}">${esc(r.code)}</button></td><td title="${esc(r.name)}">${esc(r.name)}</td><td>${r.type}</td><td title="${esc(r.owner)}">${esc(r.owner)}</td><td><span class="status ${r.status==='处理中'?'progress':''}">${r.status}</span></td><td title="${r.due}">${r.due}${overdue(r)?'<span class="overdue">逾期</span>':''}</td><td title="${r.created}">${r.created}</td></tr>`).join('')||'<tr><td colspan="7" class="empty">暂无符合条件的事项</td></tr>';
$('pager').innerHTML=`<span class="total">共 ${data.length} 条</span><span>第 ${page} / ${pages} 页</span><select class="control" id="size" aria-label="每页条数">${[5,10,20,50].map(n=>`<option ${n===size?'selected':''} value="${n}">${n}条/页</option>`).join('')}</select><button class="btn" id="prev" ${page===1?'disabled':''}>上一页</button><button class="btn" id="next" ${page===pages?'disabled':''}>下一页</button>`;
$('size').onchange=e=>{size=+e.target.value;page=1;render()};$('prev').onclick=()=>{page--;render()};$('next').onclick=()=>{page++;render()};
}
$('tabs').onclick=e=>{const b=e.target.closest('[data-type]');if(!b)return;category=b.dataset.type;page=1;document.querySelectorAll('.tab').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-selected',x===b)});render()};
if($('stats'))$('stats').onclick=e=>{const b=e.target.closest('[data-key]');if(!b)return;stat=b.dataset.key;page=1;document.querySelectorAll('.stat').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b)});render()};
$('query').onsubmit=e=>{e.preventDefault();filters={keyword:$('keyword').value.trim(),status:$('status').value,owner:personal?'':$('owner').value};page=1;render()};
$('reset').onclick=()=>{HTMLFormElement.prototype.reset.call($('query'));filters={keyword:'',status:'',owner:''};category='';stat='all';page=1;document.querySelectorAll('.tab').forEach(x=>{x.classList.toggle('active',!x.dataset.type);x.setAttribute('aria-selected',!x.dataset.type)});document.querySelectorAll('.stat').forEach(x=>{x.classList.toggle('active',x.dataset.key==='all');x.setAttribute('aria-pressed',x.dataset.key==='all')});render()};
$('tbody').onclick=e=>{const b=e.target.closest('[data-code]');if(!b)return;selected=scope.find(r=>r.code===b.dataset.code);const r=selected;const fields=[['业务编号',r.code],['业务类型',r.type],['所属模块',r.module],['负责人',r.owner],['处理状态',r.status],['是否逾期',overdue(r)?'已逾期':'未逾期'],['创建时间',r.created],['计划完成',r.due],['位置 / 仓库',r.place]];$('detail').innerHTML=fields.map(([k,v])=>`<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')+`<dt>事项名称</dt><dd class="wide">${esc(r.name)}</dd><dt>工作内容</dt><dd class="wide">${esc(r.content)}</dd>`;$('business').hidden=!r.route;$('business').href=r.route||'#';$('dialog').showModal()};
$('business').onclick=e=>{if(window.parent!==window){e.preventDefault();window.parent.postMessage({type:'task-portal-navigate',menu:selected.menu},location.protocol==='file:'||location.origin==='null'?'*':location.origin)}};
$('close').onclick=()=>$('dialog').close();render();
