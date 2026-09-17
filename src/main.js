import './style.css';
import { createResume, escapeHtml as safe, fonts, moveSection, parseResume, storageKey, templates } from './model.js';
import { resumeMarkup } from './resume.js';

const icons = {
  document: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 12h7M9 16h7"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  edit: '<path d="m15 4 5 5M4 20l5-1L21 7l-5-5L4 14z"/>',
  sliders: '<path d="M4 7h9m5 0h2M4 17h2m5 0h9"/><circle cx="15" cy="7" r="3"/><circle cx="8" cy="17" r="3"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  upload: '<path d="M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  briefcase: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12h18M10 12v3h4v-3"/>',
  book: '<path d="m2 8 10-5 10 5-10 5zM6 11v7q6 4 12 0v-7"/>',
  star: '<path d="m12 3 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"/>',
  arrow: '<path d="m9 5 7 7-7 7"/>',
  undo: '<path d="M9 4 4 9l5 5M4 9h10a6 6 0 0 1 0 12"/>',
  redo: '<path d="m15 4 5 5-5 5m5-5H10a6 6 0 0 0 0 12"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.document}</svg>`;
let resume = createResume();
let loadWarning = '';
try { const saved = localStorage.getItem(storageKey); if (saved) resume = parseResume(saved); } catch { loadWarning = '本地草稿未能读取，已显示示例。你的原有存储不会被自动覆盖，请先导入备份或编辑。'; }
let activeSection = 'profile';
let zoom = 0.7;
let isAutoFit = true;
let history = [JSON.stringify(resume)];
let historyIndex = 0;
let historyTimer;
let toastTimer;
const app = document.querySelector('#app');
const paperSizeObserver = new ResizeObserver(() => requestAnimationFrame(sizePreview));
function notify(message) {
  const toast = document.querySelector('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 4200);
}
function recordHistory() {
  const snapshot = JSON.stringify(resume);
  if (snapshot === history[historyIndex]) return;
  history = history.slice(0, historyIndex + 1);
  history.push(snapshot);
  if (history.length > 50) history.shift();
  historyIndex = history.length - 1;
  updateHistoryButtons();
}
function updateHistoryButtons() {
  document.querySelector('[data-action="undo"]').disabled = historyIndex === 0;
  document.querySelector('[data-action="redo"]').disabled = historyIndex === history.length - 1;
}
function save({ record = true } = {}) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(resume));
    document.querySelector('#save-state').innerHTML = `${icon('check')} 已保存到本机`;
  } catch { document.querySelector('#save-state').textContent = '保存失败，请导出备份'; notify('浏览器存储不可用或空间不足，请立即导出备份。'); }
  if (record) { clearTimeout(historyTimer); historyTimer = setTimeout(recordHistory, 450); }
  updatePreview();
}
function field(label, key, value, options = {}) {
  const maxLength = options.maxLength || (key.startsWith('section.') || key.endsWith('.date') ? 100 : 12000);
  const attributes = `data-field="${safe(key)}" maxlength="${maxLength}"`;
  return `<label class="field ${options.wide ? 'wide' : ''}"><span>${label}</span>${options.multiline ? `<textarea rows="${options.rows || 4}" ${attributes}>${safe(value)}</textarea>` : `<input type="text" value="${safe(value)}" ${attributes} />`}</label>`;
}
function selectControl(label, key, value, choices) {
  return `<label class="field"><span>${label}</span><select data-style="${key}">${Object.entries(choices).map(([id, name]) => `<option value="${id}" ${id === String(value) ? 'selected' : ''}>${name}</option>`).join('')}</select></label>`;
}
function slider(label, key, min, max, step, suffix = '') {
  return `<label class="range-field"><span>${label}<output data-output="${key}">${resume.style[key]}${suffix}</output></span><input aria-label="${label}" type="range" min="${min}" max="${max}" step="${step}" value="${resume.style[key]}" data-style="${key}" data-suffix="${suffix}" /></label>`;
}
function sectionIcon(id) { return ({ experience: 'briefcase', projects: 'grid', education: 'book', skills: 'sliders', awards: 'star' })[id] || 'document'; }
function renderShell() {
  app.innerHTML = `<header class="topbar"><a class="brand" href="./" aria-label="简历工坊首页"><span class="brand-icon">${icon('document')}</span><span>简历工坊<small>RESUME ATELIER</small></span></a><div class="document-title"><input id="document-title" aria-label="简历文件名称" value="${safe(resume.title)}" maxlength="100" /><span>${icon('edit')}</span></div><div class="top-actions"><span id="save-state" class="save-state">${icon('check')} 本地自动保存</span><button class="button subtle" data-action="backup">${icon('download')}<span>备份</span></button><button class="button subtle" data-action="import">${icon('upload')}<span>导入</span></button><button class="button primary" data-action="print">${icon('download')}<span>打印简历</span></button></div></header>
    <div class="workspace-heading"><div><span class="eyebrow">MAKE YOUR NEXT CHAPTER</span><h1>让经历，<em>被看见。</em></h1><p>一份好简历，是你与下一个机会的开始。</p></div><button class="template-link" data-action="templates"><span class="stacked-pages">${icon('grid')}</span><span>换一种表达<small>探索 ${templates.length} 款精选模板</small></span>${icon('arrow')}</button></div>
    <nav class="mobile-tabs" aria-label="编辑器视图"><button data-view="edit" class="active">编辑内容</button><button data-view="preview">简历预览</button><button data-view="design">设计样式</button></nav>
    <main class="workspace" data-view="edit"><aside class="editor-panel"><div class="panel-header"><h2>${icon('edit')} 编辑内容</h2><span class="small-label">CONTENT</span></div><div class="section-navigation" id="section-navigation"></div><div class="editor-content" id="editor-content"></div><div class="editor-footer">${icon('lock')} 内容仅保存在当前浏览器，不上传服务器</div></aside>
    <section class="preview-panel" aria-label="简历实时预览"><div class="preview-toolbar"><span><span class="live-dot"></span>实时预览 <small>A4</small></span><div><button class="icon-button" data-action="undo" title="撤销" aria-label="撤销">${icon('undo')}</button><button class="icon-button" data-action="redo" title="重做" aria-label="重做">${icon('redo')}</button><i></i><button class="icon-button" data-action="focus" title="专注预览" aria-label="专注预览">${icon('eye')}</button></div></div><div class="paper-stage" id="paper-stage"><div class="paper-frame" id="paper-frame"></div></div><div class="preview-bottom"><span id="page-status">A4 · 210 × 297 mm</span><div class="zoom-controls"><button data-action="zoom-out" aria-label="缩小">−</button><button data-action="fit" id="zoom-label" title="点击适应宽度">70%</button><button data-action="zoom-in" aria-label="放大">+</button></div></div><p class="preview-note" id="preview-note">每一个细节，都在表达你。</p></section>
    <aside class="design-panel"><div class="panel-header"><h2>${icon('sliders')} 设计样式</h2><span class="small-label">DESIGN</span></div><div id="design-content"></div></aside></main>
    <footer class="site-footer"><span>为你的下一段旅程，精心排版。</span><span>CRAFTED FOR YOUR NEXT CHAPTER</span></footer>
    <input type="file" id="import-file" accept="application/json,.json" hidden /><input type="file" id="photo-file" accept="image/png,image/jpeg,image/webp" hidden />
    <dialog id="template-dialog" aria-labelledby="template-title"><div class="dialog-heading"><div><span class="eyebrow">A DIFFERENT WAY TO BE YOU</span><h2 id="template-title">好内容，值得好设计。</h2><p>切换模板，保留你的全部内容。每一种风格，都可以继续自由调整。</p></div><button class="icon-button" data-action="close-templates" aria-label="关闭模板库">${icon('close')}</button></div><div class="template-filters"><button class="active" data-filter="all">全部模板</button><button data-filter="minimal">简约专业</button><button data-filter="creative">个性创意</button><span>${templates.length} 款精心排版 · 全部可用</span></div><div class="template-gallery" id="template-gallery"></div></dialog>`;
  renderNavigation(); renderEditor(); renderDesign(); updatePreview(); updateHistoryButtons();
}
function renderNavigation() {
  document.querySelector('#section-navigation').innerHTML = `<button class="section-tab ${activeSection === 'profile' ? 'active' : ''}" data-section-tab="profile">${icon('user')} 基本信息</button>${resume.sections.map(section => `<button class="section-tab ${activeSection === section.id ? 'active' : ''} ${!section.visible ? 'muted' : ''}" data-section-tab="${safe(section.id)}">${icon(sectionIcon(section.id))} ${safe(section.title)}</button>`).join('')}<button class="section-tab add-tab" data-action="add-section">${icon('plus')} 添加模块</button>`;
}
function renderEditor() {
  const container = document.querySelector('#editor-content');
  if (activeSection === 'profile') {
    const profile = resume.profile;
    container.innerHTML = `<div class="editor-intro"><span class="step-number">01</span><div><h3>从认识你开始</h3><p>让第一印象，恰到好处。</p></div></div><div class="photo-upload"><button class="upload-avatar" data-action="photo" aria-label="上传头像">${profile.photo ? `<img src="${safe(profile.photo)}" alt="当前头像" />` : icon('user')}<span>+</span></button><div><button class="text-button" data-action="photo">${profile.photo ? '更换个人照片' : '上传个人照片'}</button><small>JPG、PNG、WebP · 最大 5 MB</small>${profile.photo ? '<button class="text-button danger" data-action="remove-photo">移除照片</button>' : '<span class="photo-hint">一张好照片，让简历更有温度</span>'}</div></div><div class="form-grid">${field('姓名', 'profile.name', profile.name, { maxLength: 80 })}${field('英文名 / 拼音', 'profile.englishName', profile.englishName, { maxLength: 100 })}${field('求职意向 / 职业头衔', 'profile.role', profile.role, { wide: true })}${field('手机号码', 'profile.phone', profile.phone)}${field('所在城市', 'profile.location', profile.location)}${field('电子邮箱', 'profile.email', profile.email, { wide: true })}${field('个人网站 / 作品集', 'profile.website', profile.website, { wide: true })}${field('个人简介', 'profile.summary', profile.summary, { wide: true, multiline: true, rows: 6 })}</div><div class="writing-tip"><span>✦</span><p>用两三句话介绍你的专业、优势与期待。<br />清晰而真实，比堆砌形容词更有力量。</p></div>`;
    return;
  }
  const section = resume.sections.find(section => section.id === activeSection);
  if (!section) { activeSection = 'profile'; renderEditor(); return; }
  container.innerHTML = `<div class="editor-intro"><span class="step-number">${String(resume.sections.indexOf(section) + 2).padStart(2, '0')}</span><div><h3>${safe(section.title)}</h3><p>记录你的经历，也呈现你的价值。</p></div></div><div class="module-actions"><label class="toggle-label"><input type="checkbox" data-section-visible ${section.visible ? 'checked' : ''} />显示模块</label><div><button class="icon-button" data-action="move-up" aria-label="模块上移" ${resume.sections.indexOf(section) === 0 ? 'disabled' : ''}>↑</button><button class="icon-button" data-action="move-down" aria-label="模块下移" ${resume.sections.indexOf(section) === resume.sections.length - 1 ? 'disabled' : ''}>↓</button><button class="text-button danger" data-action="remove-section">删除</button></div></div><div class="form-grid">${field('模块标题', 'section.title', section.title)}${field('英文副标题', 'section.subtitle', section.subtitle)}<label class="field wide"><span>所在位置</span><select id="section-column"><option value="main" ${section.column === 'main' ? 'selected' : ''}>主要内容栏</option><option value="side" ${section.column === 'side' ? 'selected' : ''}>侧边信息栏</option></select></label></div><div class="entry-editors">${section.items.map((item, index) => `<div class="entry-editor"><div class="entry-editor-heading"><span>条目 ${String(index + 1).padStart(2, '0')}</span><div><button class="icon-button" data-action="item-up" data-item="${safe(item.id)}" aria-label="上移条目 ${index + 1}" ${index === 0 ? 'disabled' : ''}>↑</button><button class="icon-button" data-action="remove-item" data-item="${safe(item.id)}" aria-label="删除条目 ${index + 1}">${icon('close')}</button></div></div>${field(item.level !== undefined ? '技能名称' : '职位 / 项目 / 学位', `item.${item.id}.title`, item.title)}${item.level !== undefined ? `<label class="range-field"><span>熟练程度 <output>${item.level}%</output></span><input type="range" min="0" max="100" value="${item.level}" aria-label="${safe(item.title)}熟练程度" data-level="${safe(item.id)}" /></label>` : `${field('公司 / 学校 / 项目说明', `item.${item.id}.organization`, item.organization)}${field('时间', `item.${item.id}.date`, item.date)}${field('经历描述（每行一条）', `item.${item.id}.description`, item.description, { multiline: true, rows: 5 })}`}</div>`).join('')}</div><button class="button add-entry" data-action="add-item">${icon('plus')} 添加一条${section.id === 'skills' ? '技能' : '经历'}</button>`;
}
function renderDesign() {
  const template = templates.find(item => item.id === resume.style.template);
  document.querySelector('#design-content').innerHTML = `<section class="design-group"><div class="group-heading"><h3>当前模板</h3><button class="text-button" data-action="templates">更换 ${icon('arrow')}</button></div><button class="current-template" data-action="templates"><div class="mini-template" aria-hidden="true">${resumeMarkup({ ...createResume(), style: { ...createResume().style, template: template.id, accent: template.color, layout: template.layout } })}</div><span><small>${template.english}</small><strong>${template.name}</strong><em>${template.description}</em></span></button></section>
    <section class="design-group"><div class="group-heading"><h3>布局结构</h3><span>LAYOUT</span></div><div class="layout-options">${[['left', '左侧栏'], ['right', '右侧栏'], ['single', '单栏'], ['three', '三栏']].map(([id, label]) => `<button class="layout-option ${resume.style.layout === id ? 'selected' : ''}" data-layout="${id}" aria-pressed="${resume.style.layout === id}"><span class="layout-symbol ${id}"><i></i><i></i><i></i></span><small>${label}</small></button>`).join('')}</div>${slider('侧栏宽度', 'sidebarWidth', 25, 42, 1, '%')}</section>
    <section class="design-group"><div class="group-heading"><h3>主题配色</h3><span>COLOR</span></div><div class="color-swatches">${['#53675b', '#303333', '#76969c', '#b7917c', '#bd8586', '#c5a32d'].map(color => `<button class="swatch ${resume.style.accent === color ? 'selected' : ''}" style="--swatch:${color}" data-color="${color}" aria-label="主题色 ${color}" aria-pressed="${resume.style.accent === color}">${resume.style.accent === color ? icon('check') : ''}</button>`).join('')}<label class="custom-color" title="自定义颜色"><input type="color" aria-label="自定义主题色" data-style="accent" value="${resume.style.accent}" />+</label></div></section>
    <section class="design-group"><div class="group-heading"><h3>字体排印</h3><span>TYPOGRAPHY</span></div>${selectControl('正文字体', 'font', resume.style.font, Object.fromEntries(Object.entries(fonts).map(([key, font]) => [key, font.name])))}${selectControl('标题字体', 'headingFont', resume.style.headingFont, Object.fromEntries(Object.entries(fonts).map(([key, font]) => [key, font.name])))}<p class="font-note">使用本机字体；未安装时自动使用备用字体。</p>${slider('正文字号', 'fontSize', 10, 18, 0.5, 'px')}${slider('姓名字号', 'nameSize', 24, 64, 1, 'px')}${slider('标题字重', 'headingWeight', 400, 800, 100)}${slider('文字行距', 'lineHeight', 1.2, 2.4, 0.1)}${slider('字符间距', 'letterSpacing', 0, 3, 0.1, 'px')}</section>
    <section class="design-group"><div class="group-heading"><h3>间距与留白</h3><span>SPACING</span></div>${slider('模块间距', 'sectionGap', 12, 48, 1, 'px')}${slider('页面边距', 'padding', 20, 64, 1, 'px')}</section>
    <section class="design-group"><div class="group-heading"><h3>个人照片</h3><label class="toggle-label"><input type="checkbox" data-style="showPhoto" ${resume.style.showPhoto ? 'checked' : ''} />显示</label></div>${selectControl('照片形状', 'photoShape', resume.style.photoShape, { square: '方形 · 经典', round: '圆形 · 亲和', arch: '拱形 · 艺术' })}</section><button class="button reset-style" data-action="reset-style">恢复当前模板的默认样式</button>`;
}
function updatePreview() {
  paperSizeObserver.disconnect();
  document.querySelector('#paper-frame').innerHTML = resumeMarkup(resume);
  paperSizeObserver.observe(document.querySelector('#paper-frame .resume-paper'));
  requestAnimationFrame(sizePreview);
}
function sizePreview() {
  const stage = document.querySelector('#paper-stage');
  const frame = document.querySelector('#paper-frame');
  const paper = frame.querySelector('.resume-paper');
  if (!paper || stage.clientWidth === 0) return;
  if (isAutoFit) zoom = Math.min(0.85, Math.max(0.25, (stage.clientWidth - 56) / 794));
  paper.style.transform = `scale(${zoom})`;
  frame.style.width = `${794 * zoom}px`;
  frame.style.height = `${paper.offsetHeight * zoom}px`;
  document.querySelector('#zoom-label').textContent = `${Math.round(zoom * 100)}%`;
  const isLong = paper.offsetHeight > 1125;
  document.querySelector('#page-status').textContent = isLong ? '内容超出一页 · 打印时自动续页' : 'A4 · 210 × 297 mm';
  document.querySelector('#preview-note').textContent = isLong ? '可调小字号、行距或边距以精简为一页；长内容不会被裁掉。' : '每一个细节，都在表达你。';
}
function renderGallery(filter = 'all') {
  const creativeIds = ['bold', 'swiss', 'soft', 'cards', 'coastal', 'timeline'];
  document.querySelector('#template-gallery').innerHTML = templates.filter(template => filter === 'all' || (filter === 'creative' ? creativeIds.includes(template.id) : !creativeIds.includes(template.id))).map((template, index) => {
    const sample = createResume();
    sample.style = { ...sample.style, template: template.id, layout: template.layout, accent: template.color };
    return `<button class="gallery-card ${resume.style.template === template.id ? 'selected' : ''}" data-template="${template.id}" aria-label="使用${template.name}模板"><div class="gallery-paper" aria-hidden="true">${resumeMarkup(sample)}<span class="template-tag">${template.tag}</span><span class="choose-template">${resume.style.template === template.id ? '正在使用' : '使用这个模板'} ${icon('arrow')}</span></div><div class="gallery-caption"><div><small>${String(index + 1).padStart(2, '0')} / ${template.english}</small><h3>${template.name}</h3><p>${template.description}</p></div><span style="background:${template.color}"></span></div></button>`;
  }).join('');
}
function updateEverything() { renderNavigation(); renderEditor(); renderDesign(); save(); }
function applyTemplate(id, reset = false) {
  recordHistory();
  const template = templates.find(item => item.id === id);
  resume.style = { ...(reset ? createResume().style : resume.style), template: id, accent: template.color, layout: template.layout };
  if (id === 'cards') resume.style.photoShape = 'round';
  renderDesign(); save(); recordHistory();
}
function exportBackup() {
  const url = URL.createObjectURL(new Blob([JSON.stringify(resume, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = `${resume.title.replace(/[<>:"/\\|?*]/g, '_') || '我的简历'}.json`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  notify('简历备份已导出，可在其他设备导入继续编辑。');
}
app.addEventListener('input', event => {
  const target = event.target;
  if (target.id === 'document-title') { resume.title = target.value; save(); return; }
  if (target.dataset.field) {
    const [group, key, property] = target.dataset.field.split('.');
    if (group === 'profile') resume.profile[key] = target.value;
    else {
      const section = resume.sections.find(item => item.id === activeSection);
      if (group === 'section') { section[key] = target.value; renderNavigation(); }
      if (group === 'item') section.items.find(item => item.id === key)[property] = target.value;
    }
    save();
  }
  if (target.dataset.style) {
    const key = target.dataset.style;
    resume.style[key] = target.type === 'checkbox' ? target.checked : target.type === 'range' ? Number(target.value) : target.value;
    if (target.type === 'range') document.querySelector(`[data-output="${key}"]`).textContent = `${target.value}${target.dataset.suffix}`;
    save();
  }
  if (target.dataset.level) {
    resume.sections.find(section => section.id === activeSection).items.find(item => item.id === target.dataset.level).level = Number(target.value);
    target.parentElement.querySelector('output').textContent = `${target.value}%`; save();
  }
});
app.addEventListener('change', async event => {
  const target = event.target;
  if (target.hasAttribute('data-section-visible')) { resume.sections.find(section => section.id === activeSection).visible = target.checked; renderNavigation(); save(); }
  if (target.id === 'section-column') { resume.sections.find(section => section.id === activeSection).column = target.value; save(); }
  if (target.id === 'import-file' && target.files[0]) {
    const file = target.files[0];
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error('备份文件不能超过 5 MB');
      const imported = parseResume(await file.text());
      if (!confirm('导入将替换当前简历，完成后可以撤销。继续导入？')) return;
      recordHistory(); resume = imported; activeSection = 'profile'; renderShell(); save(); recordHistory(); notify('简历导入成功。');
    } catch (error) { notify(`导入失败：${error instanceof SyntaxError ? '文件不是有效的 JSON' : error.message}`); }
    finally { target.value = ''; }
  }
  if (target.id === 'photo-file' && target.files[0]) {
    try {
      const file = target.files[0];
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('请选择 5 MB 以内的 JPG、PNG 或 WebP 照片');
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 900 / Math.max(bitmap.width, bitmap.height));
      canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
      canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
      recordHistory(); resume.profile.photo = canvas.toDataURL('image/webp', 0.88); renderEditor(); save(); recordHistory(); notify('照片已更新，仅保存在本机。');
    } catch (error) { notify(error.message || '照片读取失败，请换一张图片。'); }
    finally { target.value = ''; }
  }
});
app.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.sectionTab) { activeSection = button.dataset.sectionTab; renderNavigation(); renderEditor(); }
  if (button.dataset.view) {
    document.querySelector('.workspace').dataset.view = button.dataset.view;
    document.querySelectorAll('[data-view]').forEach(element => { if (element.tagName === 'BUTTON') element.classList.toggle('active', element.dataset.view === button.dataset.view); });
    requestAnimationFrame(sizePreview);
  }
  if (button.dataset.layout) { recordHistory(); resume.style.layout = button.dataset.layout; renderDesign(); save(); recordHistory(); }
  if (button.dataset.color) { recordHistory(); resume.style.accent = button.dataset.color; renderDesign(); save(); recordHistory(); }
  if (button.dataset.template) { applyTemplate(button.dataset.template); document.querySelector('#template-dialog').close(); notify('模板已切换，你的内容已完整保留。'); }
  if (button.dataset.filter) { document.querySelectorAll('[data-filter]').forEach(item => item.classList.toggle('active', item === button)); renderGallery(button.dataset.filter); }
  const action = button.dataset.action;
  const section = resume.sections.find(item => item.id === activeSection);
  switch (action) {
    case 'templates': renderGallery(); document.querySelectorAll('[data-filter]').forEach(item => item.classList.toggle('active', item.dataset.filter === 'all')); document.querySelector('#template-dialog').showModal(); break;
    case 'close-templates': document.querySelector('#template-dialog').close(); break;
    case 'backup': exportBackup(); break;
    case 'import': document.querySelector('#import-file').click(); break;
    case 'photo': document.querySelector('#photo-file').click(); break;
    case 'remove-photo': recordHistory(); resume.profile.photo = ''; renderEditor(); save(); recordHistory(); break;
    case 'print': window.print(); break;
    case 'focus': document.querySelector('.workspace').classList.toggle('focus-mode'); isAutoFit = true; requestAnimationFrame(sizePreview); break;
    case 'fit': isAutoFit = true; sizePreview(); break;
    case 'zoom-in': isAutoFit = false; zoom = Math.min(1.3, zoom + 0.1); sizePreview(); break;
    case 'zoom-out': isAutoFit = false; zoom = Math.max(0.25, zoom - 0.1); sizePreview(); break;
    case 'reset-style': applyTemplate(resume.style.template, true); notify('已恢复模板样式，内容保持不变。'); break;
    case 'undo': case 'redo': {
      clearTimeout(historyTimer); recordHistory();
      const next = historyIndex + (action === 'undo' ? -1 : 1);
      if (next < 0 || next >= history.length) break;
      historyIndex = next; resume = JSON.parse(history[historyIndex]); renderShell(); save({ record: false }); notify(action === 'undo' ? '已撤销上一步操作' : '已重做'); break;
    }
    case 'add-section': {
      if (resume.sections.length >= 30) { notify('最多支持 30 个模块'); break; }
      recordHistory(); const id = crypto.randomUUID(); resume.sections.push({ id, title: '自定义模块', subtitle: 'MORE', column: 'main', visible: true, items: [] }); activeSection = id; updateEverything(); recordHistory(); break;
    }
    case 'remove-section': if (confirm(`删除“${section.title}”模块？删除后可以撤销。`)) { recordHistory(); resume.sections = resume.sections.filter(item => item.id !== activeSection); activeSection = 'profile'; updateEverything(); recordHistory(); } break;
    case 'move-up': case 'move-down': recordHistory(); moveSection(resume, activeSection, action === 'move-up' ? -1 : 1); updateEverything(); recordHistory(); break;
    case 'add-item': if (section.items.length >= 100) { notify('每个模块最多支持 100 条内容'); break; } recordHistory(); section.items.push(section.id === 'skills' ? { id: crypto.randomUUID(), title: '新技能', level: 80 } : { id: crypto.randomUUID(), title: '', organization: '', date: '', description: '' }); renderEditor(); save(); recordHistory(); break;
    case 'remove-item': recordHistory(); section.items = section.items.filter(item => item.id !== button.dataset.item); renderEditor(); save(); recordHistory(); notify('条目已删除，可通过撤销恢复。'); break;
    case 'item-up': {
      const index = section.items.findIndex(item => item.id === button.dataset.item); if (index < 1) break;
      recordHistory(); [section.items[index - 1], section.items[index]] = [section.items[index], section.items[index - 1]]; renderEditor(); save(); recordHistory(); break;
    }
  }
});
window.addEventListener('resize', () => requestAnimationFrame(sizePreview));
window.addEventListener('afterprint', sizePreview);
renderShell();
if (loadWarning) notify(loadWarning);
