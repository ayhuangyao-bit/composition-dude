export type Point = { x: number; y: number };
export type Person = Point & { id: string; role: '妈妈' | '爸爸' | '男孩' | '女孩'; height: number };
export type BrandLogo = Point & { enabled: boolean; mode: 'design' | 'blank'; width: number; height: number; text: string; image?: string; filename?: string };
export type Product = Point & { id: string; ordinal: number; height: number; width: number; occupancy: number };
export type Scene = {
  id: string; group: '主图' | 'A+图' | '自定义'; ordinal: number; presetIndex: number; width: number; height: number; description: string;
  products: Product[]; childRatio: number; people: Person[]; interaction: string; logo: BrandLogo;
};
export const PERSON_FRAME_WIDTH = 7.2;
export const defaultX = [10, 22, 33, 67, 78, 90];
export const interactions = [
  '牵手一起看向产品', '牵手微笑看向镜头', '抬头欣赏产品',
  '孩子指向产品，家长回应', '家长蹲下与孩子对视微笑', '家长蹲下与孩子一起观察产品',
  '家长轻搭孩子肩膀', '家长从侧面轻抱孩子', '孩子贴靠在家长身边',
  '亲子相互击掌', '一起拍手欢笑', '孩子张开双臂表达惊喜',
  '家长与孩子一起挥手', '亲子轻靠在一起合影', '孩子转头向家长分享发现',
  '家长弯腰听孩子说话', '家长指向产品，孩子顺着看', '孩子模仿产品姿势',
  '孩子做出俏皮表情，家长微笑', '亲子并肩坐下欣赏产品',
  '家长陪伴孩子绕到产品侧旁', '亲子站在产品两侧相视微笑',
  '家长示范摆放位置，孩子在旁观察', '家长与孩子一起做爱心手势',
];
export const NO_INTERACTION = '不指定互动';
const familyPatterns: [Person['role'][], number[]][] = [
  [['妈妈', '女孩'], [0, 2]], [['爸爸', '妈妈', '男孩'], [0, 1, 2]],
  [['爸爸', '男孩', '女孩'], [5, 3, 4]], [['妈妈', '爸爸', '女孩', '男孩'], [0, 5, 2, 4]],
  [['妈妈', '爸爸', '女孩', '女孩', '男孩'], [0, 5, 1, 3, 4]], [['爸爸', '男孩'], [5, 3]],
  [['妈妈', '女孩', '男孩'], [5, 4, 3]], [['妈妈', '爸爸', '女孩'], [0, 5, 2]],
  [['爸爸', '妈妈', '男孩', '男孩'], [0, 5, 1, 3]], [['妈妈', '爸爸', '男孩', '女孩', '女孩'], [5, 0, 1, 2, 4]],
];
export const isChild = (p: Person) => p.role === '男孩' || p.role === '女孩';
export function familyFor(index: number, variation = 0): Person[] {
  const [roles, slots] = familyPatterns[(index + variation) % familyPatterns.length];
  return roles.map((role, i) => ({ id: `p${i}`, role, height: role === '爸爸' ? 175 : 165, x: defaultX[variation % 2 ? 5 - slots[i] : slots[i]], y: 77 }));
}
export const sceneLabel = (s: Scene) => `${s.group} ${s.ordinal}`;
export type Dimensions = { width: number; height: number };
export function validateDimensions(width: number, height: number): string {
  if (![width, height].every(n => Number.isInteger(n) && n >= 200 && n <= 4096)) return '宽高均需为 200–4096px 的整数。';
  if (Math.max(width, height) / Math.min(width, height) > 4) return '最长边不能超过最短边的 4 倍。';
  return '';
}
export function aspectRatioLabel(s: Dimensions): string {
  const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
  const divisor = gcd(s.width, s.height);
  return `${s.width / divisor}:${s.height / divisor}`;
}
export function createScene(group: Scene['group'], id: string, ordinal = 1, presetIndex = 0, dimensions?: Dimensions): Scene {
  const main = group === '主图';
  const size = group === '自定义' ? dimensions ?? { width: 1200, height: 900 } : main ? { width: 1500, height: 1500 } : { width: 970, height: 600 };
  if (validateDimensions(size.width, size.height)) throw new Error(validateDimensions(size.width, size.height));
  return {
    id, group, ordinal, presetIndex, ...size,
    description: group === '自定义' ? '自由比例画面，安排产品与人物构图' : main ? '方形画面，安排产品、人物比例与品牌位置' : '横向画面，为家庭互动留出更多构图空间',
    products: [{ id: 'product', ordinal: 1, height: 210, width: 18, occupancy: 55, x: 50, y: 77 }], childRatio: 48,
    people: [], interaction: interactions[main ? 0 : 3],
    logo: { enabled: false, mode: 'design', x: 82, y: 15, width: main ? 180 : 150, height: main ? 70 : 60, text: '' },
  };
}
export function initialScenes(): Scene[] {
  return [createScene('主图', 'main', 1, 0), createScene('A+图', 'a', 1, 2)];
}
export function appendScene(scenes: Scene[], group: Scene['group'], id: string, dimensions?: Dimensions): Scene[] {
  const ordinal = Math.max(0, ...scenes.filter(s => s.group === group).map(s => s.ordinal)) + 1;
  const presetIndex = Math.max(-1, ...scenes.map(s => s.presetIndex)) + 1;
  return [...scenes, createScene(group, id, ordinal, presetIndex, dimensions)];
}
export const productLabel = (p: Product) => `产品 ${p.ordinal}`;
export const personFrameHeight = (s: Scene, p: Person) => s.products[0].occupancy * (isChild(p) ? s.childRatio / 100 : p.height / s.products[0].height);
export function maxProductOccupancy(s: Scene, product = s.products[0]): number {
  if (product.id !== s.products[0].id) return 95;
  const tallestRatio = Math.max(1, ...s.people.filter(p => !isChild(p)).map(p => p.height / product.height));
  return Math.max(.1, Math.min(95, Math.floor(1000 / tallestRatio)/10));
}
export const logoFrame = (s: Scene) => ({ width: s.logo.width / s.width * 100, height: s.logo.height / s.height * 100 });
const rounded = (n: number) => Math.round(n * 10) / 10;
export function clampPoint(point: Point, height: number, width: number): Point {
  // Round the limits inward so fractional box dimensions never cross the canvas edge.
  const minX = Math.ceil(width / 2 * 10) / 10, maxX = Math.floor((100 - width / 2) * 10) / 10;
  return {
    x: Math.min(maxX, Math.max(minX, rounded(Number.isFinite(point.x) ? point.x : 50))),
    y: Math.min(100, Math.max(Math.ceil(height * 10) / 10, rounded(Number.isFinite(point.y) ? point.y : 77))),
  };
}
export function normalizeScene(s: Scene): Scene {
  const normalized = { ...s, products: s.products.map(p => ({ ...p, occupancy: Math.min(maxProductOccupancy(s, p), Math.max(.1, p.occupancy)) })) };
  const frame = logoFrame(normalized);
  return { ...normalized, products: normalized.products.map(p => ({ ...p, ...clampPoint(p, p.occupancy, p.width) })), people: normalized.people.map(p => ({ ...p, ...clampPoint(p, personFrameHeight(normalized, p), PERSON_FRAME_WIDTH) })), logo: { ...normalized.logo, ...clampPoint(normalized.logo, frame.height, frame.width) } };
}
export function moveItem(s: Scene, id: string, point: Point): Scene {
  if (s.products.some(p => p.id === id)) return { ...s, products: s.products.map(p => p.id === id ? { ...p, ...clampPoint(point, p.occupancy, p.width) } : p) };
  if (id === 'logo' && s.logo.enabled) { const frame = logoFrame(s); return { ...s, logo: { ...s.logo, ...clampPoint(point, frame.height, frame.width) } }; }
  return { ...s, people: s.people.map(p => p.id === id ? { ...p, ...clampPoint(point, personFrameHeight(s, p), PERSON_FRAME_WIDTH) } : p) };
}
export function addProduct(s: Scene, id: string, source = s.products[0]): Scene {
  const ordinal = Math.max(...s.products.map(p => p.ordinal)) + 1;
  const product = { ...source, id, ordinal, x: source.x <= 50 ? source.x + source.width + 5 : source.x - source.width - 5 };
  return normalizeScene({ ...s, products: [...s.products, product] });
}
export function removeProduct(s: Scene, id: string): Scene {
  return s.products.length < 2 ? s : normalizeScene({ ...s, products: s.products.filter(p => p.id !== id) });
}
export function alignBottom(s: Scene, targetId: string): Scene {
  if (targetId === 'logo') return s;
  const target = s.products.find(p => p.id === targetId) ?? s.people.find(p => p.id === targetId);
  if (!target) return s;
  const y = Math.max(target.y, ...s.products.map(p => p.occupancy), ...s.people.map(p => personFrameHeight(s, p)));
  return normalizeScene({ ...s, products: s.products.map(p => ({ ...p, y })), people: s.people.map(p => ({ ...p, y })) });
}
export function resizeFamily(s: Scene, adults: number, children: number): Person[] {
  const adultList = s.people.filter(p => !isChild(p)), childList = s.people.filter(isChild);
  const selected: Person[] = [];
  const freeX = (preferred: number) => [preferred, ...[10, 90, 33, 67, 22, 78]].find(x => !selected.some(p => Math.abs(p.x - x) < 8)) ?? preferred;
  for (let i = 0; i < Math.max(0, Math.min(2, adults)); i++) {
    const old = adultList[i];
    selected.push(old ? { ...old } : { id: `adult${i}`, role: i ? '爸爸' : '妈妈', height: i ? 175 : 165, x: freeX(i ? 90 : 10), y: s.products[0].y });
  }
  for (let i = 0; i < Math.max(0, Math.min(3, children)); i++) {
    const old = childList[i];
    selected.push(old ? { ...old } : { id: `child${i}`, role: i % 2 ? '男孩' : '女孩', height: 100, x: freeX([33, 67, 78][i]), y: s.products[0].y });
  }
  return selected;
}
export function signature(s: Scene): string { return s.people.map(p => `${p.role}@${rounded(p.x)},${rounded(p.y)}`).sort().join('|'); }
export function duplicateScenes(scenes: Scene[], s: Scene) { return s.people.length ? scenes.filter(x => x.id !== s.id && signature(x) === signature(s)) : []; }
export function placement(point: Point): string {
  const horizontal = point.x < 35 ? '左侧' : point.x > 65 ? '右侧' : '中央';
  const vertical = point.y < 60 ? '偏上' : point.y > 75 ? '偏下' : '中部';
  return `画面${horizontal}${vertical}`;
}
export function overlapWarnings(s: Scene): string[] {
  const boxes = [...s.products.map(p => ({ ...p, label: productLabel(p), height: p.occupancy })), ...s.people.map((p, i) => ({ ...p, label: `人物${i + 1}`, width: PERSON_FRAME_WIDTH, height: personFrameHeight(s, p) })), ...(s.logo.enabled ? [{ id: 'logo', label: s.logo.mode === 'blank' ? 'Logo留白区域' : 'Logo', ...s.logo, ...logoFrame(s) }] : [])];
  const warnings: string[] = [];
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    if (Math.abs(a.x - b.x) < (a.width + b.width) / 2 && Math.min(a.y, b.y) - Math.max(a.y - a.height, b.y - b.height) > .5) warnings.push(`${a.label}与${b.label}重叠`);
  }
  return warnings;
}
export function summary(s: Scene): string {
  const adults = s.people.filter(p => !isChild(p)), children = s.people.filter(isChild);
  const lines = [
    `${sceneLabel(s)}｜${s.width}×${s.height}px · ${aspectRatioLabel(s)}`,
    ...s.products.map(p => `${productLabel(p)}：比例参考高度 ${p.height}cm；画面宽度 ${p.width}%（约 ${Math.round(s.width * p.width / 100)}px），画面高度 ${p.occupancy}%（${Math.round(s.height * p.occupancy / 100)}px）；底部中心 X=${p.x}%，Y=${p.y}%，位于${placement(p)}。`),
  ];
  if (s.people.length) {
    const members = [...(adults.length ? [`${adults.length}位成人`] : []), ...(children.length ? [`${children.length}位儿童`] : [])];
    lines.push(`人物：${members.join(' + ')}，共${s.people.length}人。`);
    lines.push(...s.people.map((p, i) => `人物${i + 1}·${p.role}：脚底中心 X=${p.x}%，Y=${p.y}%，位于${placement(p)}；${isChild(p) ? `参考身高约 ${Math.round(s.products[0].height * s.childRatio / 100)}cm，占${productLabel(s.products[0])}高度 ${s.childRatio}%` : `参考身高 ${p.height}cm`}。`));
  }
  if (adults.length && children.length && s.interaction && s.interaction !== NO_INTERACTION) lines.push(`亲子互动：${s.interaction}。`);
  if (s.logo.enabled) {
    const position = `区域 ${s.logo.width}×${s.logo.height}px；底部中心 X=${s.logo.x}%，Y=${s.logo.y}%，位于${placement(s.logo)}。`;
    if (s.logo.mode === 'blank') {
      lines.push(`品牌Logo区域：留空，预留干净、无图文的区域，供后期排版；${position}`);
    } else {
      const content = s.logo.image ? `使用品牌素材「${s.logo.filename || 'Logo图片'}」` : s.logo.text.trim() ? `品牌文字「${s.logo.text.trim()}」` : 'Logo占位区域，制作时需提供真实品牌素材';
      lines.push(`品牌Logo：设计，${content}；${position}${s.logo.image ? '图片在区域内等比显示。' : ''}`);
    }
  }
  const anchors = ['产品底部中心', ...(s.people.length ? ['人物脚底中心'] : []), ...(s.logo.enabled ? [s.logo.mode === 'blank' ? '留白区域底部中心' : 'Logo区域底部中心'] : [])];
  lines.push(`坐标说明：画面左上角为原点，X向右增加，Y向下增加；定位点为${anchors.join('、')}。`);
  return lines.join('\n\n');
}
