export const templates = [
  { id: 'atelier', name: '留白 · 编辑志', english: 'THE EDITORIAL', color: '#53675b', layout: 'left', tag: '人气之选', description: '雅致衬线 / 温润色块' },
  { id: 'classic', name: '经典 · 序章', english: 'THE CLASSIC', color: '#b9552c', layout: 'left', tag: '专业商务', description: '橘色点缀 / 清晰时间线' },
  { id: 'soft', name: '柔和 · 奶油', english: 'THE SOFT', color: '#b7917c', layout: 'left', tag: '亲和柔美', description: '柔和色块 / 圆角双栏' },
  { id: 'bold', name: '醒目 · 黑金', english: 'THE BOLD', color: '#e0b737', layout: 'left', tag: '创意表达', description: '黑金撞色 / 大胆标题' },
  { id: 'angular', name: '锐意 · 几何', english: 'THE ANGULAR', color: '#d5ac20', layout: 'right', tag: '参考图款', description: '右上大头像 / 金色斜切 / 圆点技能', defaults: { headingFont: 'sans', sidebarWidth: 36, photoShape: 'geometric' } },
  { id: 'natural', name: '自然 · 亚麻', english: 'THE NATURAL', color: '#a09886', layout: 'left', tag: '优雅质感', description: '亚麻配色 / 杂志式姓名' },
  { id: 'cards', name: '灵感 · 卡片', english: 'THE CREATIVE', color: '#c4a34e', layout: 'left', tag: '设计师', description: '圆形头像 / 分层卡片' },
  { id: 'timeline', name: '轨迹 · 时光', english: 'THE TIMELINE', color: '#bd8586', layout: 'right', tag: '履历丰富', description: '玫瑰粉 / 时间轴叙事' },
  { id: 'mono', name: '秩序 · 黑白', english: 'THE MINIMAL', color: '#303333', layout: 'right', tag: '极简主义', description: '黑白细线 / 理性双栏' },
  { id: 'swiss', name: '先锋 · 瑞士', english: 'THE SWISS', color: '#d5c423', layout: 'three', tag: '视觉先锋', description: '醒目亮色 / 三栏网格' },
  { id: 'coastal', name: '海岸 · 雾蓝', english: 'THE COASTAL', color: '#76969c', layout: 'left', tag: '清新自然', description: '雾蓝底色 / 层次分明' },
];
export const fonts = {
  sans: { name: '现代黑体', value: '"Microsoft YaHei", "PingFang SC", sans-serif' },
  serif: { name: '优雅宋体', value: '"Noto Serif SC", "Songti SC", SimSun, serif' },
  kai: { name: '人文楷体', value: 'KaiTi, STKaiti, serif' },
  georgia: { name: 'Georgia · 经典衬线', value: 'Georgia, "Songti SC", SimSun, serif' },
  times: { name: 'Times · 学术衬线', value: '"Times New Roman", SimSun, serif' },
};
export function createResume() {
  return {
    version: 1,
    title: '我的第一份简历',
    profile: { name: '林予安', englishName: 'YUAN LIN', role: '品牌设计师 / BRAND DESIGNER', phone: '138 0000 0000', email: 'hello@example.com', location: '上海，中国', website: 'portfolio.example.com', summary: '在理性与感性之间，寻找设计的平衡。\n拥有 5 年品牌与数字产品设计经验，擅长将复杂的业务需求转化为清晰、富有温度的视觉语言。相信好的设计，既能解决问题，也能打动人心。', photo: '' },
    style: { template: 'atelier', layout: 'left', accent: '#53675b', font: 'sans', headingFont: 'serif', fontSize: 12, nameSize: 38, lineHeight: 1.6, sectionGap: 20, padding: 40, sidebarWidth: 32, letterSpacing: 0, headingWeight: 600, photoShape: 'square', showPhoto: true },
    sections: [
      { id: 'experience', title: '工作经历', subtitle: 'EXPERIENCE', column: 'main', visible: true, items: [
        { id: 'work-1', title: '资深品牌设计师', organization: '观山设计 · 品牌咨询', date: '2022.06 — 至今', description: '主导消费、文化与生活方式领域的品牌视觉项目，从策略到落地交付全流程设计。\n负责 12+ 品牌视觉升级，建立统一的品牌识别与设计规范。\n协同产品与市场团队，推动核心产品转化率提升 28%。' },
        { id: 'work-2', title: '视觉设计师', organization: '一间工作室', date: '2020.07 — 2022.05', description: '参与品牌识别、包装及数字体验设计，探索品牌与用户之间的情感连接。\n独立完成 20+ 线上活动的视觉策划与执行。\n搭建团队设计组件库，提升跨团队协作效率。' },
      ] },
      { id: 'projects', title: '精选项目', subtitle: 'SELECTED PROJECTS', column: 'main', visible: true, items: [
        { id: 'project-1', title: '「山间」生活方式品牌重塑', organization: '品牌策略 / 视觉识别 / 包装设计', date: '2024', description: '以“回归日常”为核心理念，构建从标志、字体到包装的完整视觉系统，让品牌在每一个触点保持一致的表达。' },
      ] },
      { id: 'education', title: '教育背景', subtitle: 'EDUCATION', column: 'side', visible: true, items: [
        { id: 'education-1', title: '视觉传达设计 · 学士', organization: '中国美术学院', date: '2016.09 — 2020.06', description: '优秀毕业生\n专业成绩前 10%' },
      ] },
      { id: 'skills', title: '专业技能', subtitle: 'EXPERTISE', column: 'side', visible: true, items: [
        { id: 'skill-1', title: '品牌策略与视觉识别', level: 90 },
        { id: 'skill-2', title: 'Figma / Adobe XD', level: 95 },
        { id: 'skill-3', title: 'Photoshop / Illustrator', level: 90 },
        { id: 'skill-4', title: '排版与信息设计', level: 85 },
      ] },
      { id: 'awards', title: '荣誉与语言', subtitle: 'MORE ABOUT ME', column: 'main', visible: true, items: [
        { id: 'award-1', title: '2023 设计新锐奖', organization: '品牌视觉类 · 优秀作品', date: '', description: '中文 · 母语 / 英语 · 工作沟通' },
      ] },
    ],
  };
}
export const storageKey = 'resume-atelier-v1';
export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}
export function moveSection(resume, id, direction) {
  const index = resume.sections.findIndex(section => section.id === id);
  const next = index + direction;
  if (index < 0 || next < 0 || next >= resume.sections.length) return false;
  [resume.sections[index], resume.sections[next]] = [resume.sections[next], resume.sections[index]];
  return true;
}
export function parseResume(text) {
  const data = JSON.parse(text);
  const defaults = createResume();
  if (data?.version !== 1 || !data.profile || !data.style || !Array.isArray(data.sections) || data.sections.length > 30) throw new Error('这不是有效的简历备份文件');
  const string = (value, max = 12000) => typeof value === 'string' ? value.slice(0, max) : '';
  const number = (value, min, max, fallback) => Number.isFinite(Number(value)) ? Math.min(max, Math.max(min, Number(value))) : fallback;
  const choice = (value, options, fallback) => options.includes(value) ? value : fallback;
  const profile = Object.fromEntries(Object.keys(defaults.profile).map(key => [key, string(data.profile[key], key === 'photo' ? 3000000 : 12000)]));
  if (profile.photo && !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(profile.photo)) throw new Error('头像格式不受支持');
  const style = data.style;
  const sectionIds = new Set();
  const sections = data.sections.map(section => {
    if (!section || !Array.isArray(section.items) || section.items.length > 100) throw new Error('简历模块格式错误');
    const id = string(section.id, 100);
    if (!/^[a-zA-Z0-9_-]+$/.test(id) || id === 'profile' || sectionIds.has(id)) throw new Error('简历模块标识无效或重复');
    sectionIds.add(id);
    const itemIds = new Set();
    return { id, title: string(section.title, 100), subtitle: string(section.subtitle, 100), visible: section.visible !== false, column: choice(section.column, ['main', 'side'], 'main'), items: section.items.map(item => {
      if (!item || typeof item !== 'object') throw new Error('条目格式错误');
      const itemId = string(item.id, 100);
      if (!/^[a-zA-Z0-9_-]+$/.test(itemId) || itemIds.has(itemId)) throw new Error('条目标识无效或重复');
      itemIds.add(itemId);
      return { id: itemId, title: string(item.title), organization: string(item.organization), date: string(item.date, 100), description: string(item.description), ...(item.level !== undefined ? { level: number(item.level, 0, 100, 80) } : {}) };
    }) };
  });
  return { version: 1, title: string(data.title, 100) || '我的简历', profile, sections, style: {
    template: choice(style.template, templates.map(template => template.id), 'atelier'),
    layout: choice(style.layout, ['left', 'right', 'single', 'three'], 'left'),
    accent: /^#[0-9a-f]{6}$/i.test(style.accent) ? style.accent : defaults.style.accent,
    font: choice(style.font, Object.keys(fonts), 'sans'), headingFont: choice(style.headingFont, Object.keys(fonts), 'serif'),
    fontSize: number(style.fontSize, 10, 18, 12), nameSize: number(style.nameSize, 24, 64, 38), lineHeight: number(style.lineHeight, 1.2, 2.4, 1.6),
    sectionGap: number(style.sectionGap, 12, 48, 20), padding: number(style.padding, 20, 64, 40), sidebarWidth: number(style.sidebarWidth, 25, 42, 32),
    letterSpacing: number(style.letterSpacing, 0, 3, 0), headingWeight: number(style.headingWeight, 400, 800, 600),
    photoShape: choice(style.photoShape, ['square', 'round', 'arch', 'geometric'], 'square'), showPhoto: style.showPhoto !== false,
  } };
}
