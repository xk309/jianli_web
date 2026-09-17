import { escapeHtml as safe, fonts } from './model.js';

function lines(text) { return safe(text).split('\n').filter(Boolean).map(line => `<p>${line}</p>`).join(''); }
function sectionMarkup(section) {
  return `<section class="resume-section" data-section="${safe(section.id)}"><h2>${safe(section.title)}<span>${safe(section.subtitle)}</span></h2>${section.items.map(item => item.level !== undefined
    ? `<div class="skill-row"><div>${safe(item.title)}</div><div class="skill-track"><span style="width:${item.level}%"></span></div></div>`
    : `<article class="resume-entry"><div class="entry-top"><h3>${safe(item.title)}</h3><time>${safe(item.date)}</time></div><div class="organization">${safe(item.organization)}</div><div class="entry-description">${lines(item.description)}</div></article>`).join('')}</section>`;
}
export function resumeMarkup(resume) {
  const { profile, style, sections } = resume;
  const variables = `--accent:${style.accent};--resume-font:${fonts[style.font].value};--heading-font:${fonts[style.headingFont].value};--body-size:${style.fontSize}px;--name-size:${style.nameSize}px;--line-height:${style.lineHeight};--section-gap:${style.sectionGap}px;--page-padding:${style.padding}px;--sidebar-width:${style.sidebarWidth}%;--letter-spacing:${style.letterSpacing}px;--heading-weight:${style.headingWeight}`;
  const photo = style.showPhoto ? `<div class="portrait shape-${style.photoShape}">${profile.photo ? `<img src="${safe(profile.photo)}" alt="个人头像" />` : `<div class="portrait-placeholder"><span>${safe(profile.name.slice(0, 1) || '你')}</span><small>YOUR PORTRAIT</small></div>`}</div>` : '';
  const contact = `<section class="resume-contact"><h2>联系方式<span>CONTACT</span></h2>${[['TEL', profile.phone], ['MAIL', profile.email], ['CITY', profile.location], ['WEB', profile.website]].filter(([, value]) => value).map(([label, value]) => `<div><small>${label}</small><span>${safe(value)}</span></div>`).join('')}</section>`;
  const summary = profile.summary ? `<section class="resume-section summary"><h2>关于我<span>PROFILE</span></h2><div>${lines(profile.summary)}</div></section>` : '';
  const content = style.layout === 'single'
    ? `<div class="single-profile">${photo}${contact}</div><div class="resume-main">${summary}${sections.filter(section => section.visible).map(sectionMarkup).join('')}</div>`
    : `<aside class="resume-sidebar">${photo}${contact}${sections.filter(section => section.visible && section.column === 'side').map(sectionMarkup).join('')}</aside><div class="resume-main">${summary}${sections.filter(section => section.visible && section.column === 'main').map(sectionMarkup).join('')}</div>`;
  return `<article class="resume-paper theme-${style.template} layout-${style.layout}" style="${safe(variables)}"><header class="resume-header"><div class="name-group"><div class="resume-eyebrow">${safe(profile.englishName)}</div><h1>${safe(profile.name || '你的姓名')}</h1><p class="resume-role">${safe(profile.role)}</p></div><span class="header-mark">履历 / CURRICULUM VITAE</span></header><div class="resume-columns">${content}</div><footer class="resume-footer"><span>${safe(profile.englishName || profile.name)}</span><span>RESUME</span></footer></article>`;
}
