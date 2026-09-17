import test from 'node:test';
import assert from 'node:assert/strict';
import { createResume, parseResume, moveSection, templates } from '../src/model.js';
import { resumeMarkup } from '../src/resume.js';

test('backup preserves content, photo and customized style when imported', () => {
  const original = createResume();
  original.profile.name = '王小明';
  original.profile.photo = 'data:image/png;base64,aGVsbG8=';
  original.style.fontSize = 15;
  original.style.layout = 'right';
  original.sections[0].items[0].description = '第一项成果\n第二项成果';
  const restored = parseResume(JSON.stringify(original));
  assert.equal(restored.profile.name, '王小明');
  assert.equal(restored.profile.photo, original.profile.photo);
  assert.equal(restored.style.fontSize, 15);
  assert.equal(restored.style.layout, 'right');
  assert.equal(restored.sections[0].items[0].description, '第一项成果\n第二项成果');
});

test('import rejects malformed data, remote images and duplicate section identifiers', () => {
  assert.throws(() => parseResume('{}'));
  assert.throws(() => parseResume('{broken'));
  const data = createResume();
  data.profile.photo = 'https://tracking.example.com/photo.png';
  assert.throws(() => parseResume(JSON.stringify(data)), /头像/);
  data.profile.photo = '';
  data.sections.push(data.sections[0]);
  assert.throws(() => parseResume(JSON.stringify(data)), /标识/);
});

test('untrusted imported styles are constrained and content is escaped in the document', () => {
  const data = createResume();
  data.style.fontSize = 10000;
  data.style.padding = -40;
  data.style.accent = 'red;background:url(https://evil.example)';
  data.style.font = 'injected-font';
  data.profile.name = '<img src=x onerror=alert(1)>';
  data.sections[0].items[0].description = '<script>alert(1)</script>';
  const imported = parseResume(JSON.stringify(data));
  assert.equal(imported.style.fontSize, 18);
  assert.equal(imported.style.padding, 20);
  assert.equal(imported.style.accent, '#53675b');
  assert.equal(imported.style.font, 'sans');
  const markup = resumeMarkup(imported);
  assert.ok(markup.includes('&lt;img'));
  assert.ok(!markup.includes('<script>'));
  assert.ok(!markup.includes('https://evil.example'));
});

test('sections move without losing entries and cannot move outside the list', () => {
  const data = createResume();
  const originalDescription = data.sections[0].items[0].description;
  assert.equal(moveSection(data, 'experience', -1), false);
  assert.equal(moveSection(data, 'experience', 1), true);
  assert.equal(data.sections[1].id, 'experience');
  assert.equal(data.sections[1].items[0].description, originalDescription);
  assert.equal(moveSection(data, 'missing', 1), false);
});

test('single-column layout follows section order regardless of original column', () => {
  const data = createResume();
  data.style.layout = 'single';
  moveSection(data, 'education', -1);
  moveSection(data, 'education', -1);
  const markup = resumeMarkup(data);
  assert.ok(markup.indexOf('data-section="education"') < markup.indexOf('data-section="experience"'));
  assert.ok(!markup.includes('class="resume-sidebar"'));
});

test('import rejects reserved and unsafe editable identifiers', () => {
  const data = createResume();
  data.sections[0].id = 'profile';
  assert.throws(() => parseResume(JSON.stringify(data)), /标识/);
  data.sections[0].id = 'experience';
  data.sections[0].items[0].id = 'work.1';
  assert.throws(() => parseResume(JSON.stringify(data)), /标识/);
});

test('all templates retain resume text, while hiding a module removes only its preview', () => {
  for (const template of templates) {
    const data = createResume();
    data.style.template = template.id;
    data.style.layout = template.layout;
    data.sections[0].visible = false;
    const markup = resumeMarkup(data);
    assert.ok(markup.includes('林予安'));
    assert.ok(markup.includes('精选项目'));
    assert.ok(!markup.includes('资深品牌设计师'));
    assert.equal(data.sections[0].items.length, 2);
  }
});
