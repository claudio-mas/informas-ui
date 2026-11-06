// Conversão de cores CSS para sRGB e cálculo de contraste WCAG 2.x.
// Formatos aceitos: #rgb, #rgba, #rrggbb, #rrggbbaa, rgb()/rgba(), hsl()/hsla(),
// oklch() e as palavras white, black e transparent.

const NAMED = { white: [1, 1, 1, 1], black: [0, 0, 0, 1], transparent: [0, 0, 0, 0] };
const clamp01 = x => Math.min(1, Math.max(0, x));

function component(text, percentScale) {
  if (text === 'none') return 0;
  if (text.endsWith('%')) return (parseFloat(text) / 100) * percentScale;
  return parseFloat(text);
}
function hue(text) {
  if (text === 'none') return 0;
  const value = parseFloat(text);
  if (text.endsWith('turn')) return value * 360;
  if (text.endsWith('rad')) return (value * 180) / Math.PI;
  if (text.endsWith('grad')) return value * 0.9;
  return value;
}
function hslToRgb(h, s, l) {
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  return [f(0), f(8), f(4)];
}
function oklchToRgb(L, C, h) {
  const a = C * Math.cos((h * Math.PI) / 180);
  const b = C * Math.sin((h * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  return linear.map(x => clamp01(x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055));
}

/** Retorna [r, g, b, a] com valores entre 0 e 1, ou null se o formato não for suportado. */
export function parseColor(input) {
  const value = String(input).trim().toLowerCase();
  if (NAMED[value]) return [...NAMED[value]];
  const hex = value.match(/^#([0-9a-f]+)$/);
  if (hex) {
    let digits = hex[1];
    if (![3, 4, 6, 8].includes(digits.length)) return null;
    if (digits.length <= 4) digits = [...digits].map(d => d + d).join('');
    return [0, 2, 4, 6].map(i => (i < digits.length ? parseInt(digits.slice(i, i + 2), 16) / 255 : 1));
  }
  const fn = value.match(/^(rgba?|hsla?|oklch)\((.*)\)$/);
  if (!fn) return null;
  const parts = fn[2].replace(/\//g, ' / ').split(/[\s,]+/).filter(Boolean);
  let alpha = 1;
  let channels = parts;
  const slash = parts.indexOf('/');
  if (slash >= 0) { alpha = component(parts[slash + 1] ?? '1', 1); channels = parts.slice(0, slash); }
  else if (parts.length === 4) { alpha = component(parts[3], 1); channels = parts.slice(0, 3); }
  if (channels.length !== 3) return null;
  let rgb;
  if (fn[1].startsWith('rgb')) rgb = channels.map(c => component(c, 255) / 255);
  else if (fn[1].startsWith('hsl')) rgb = hslToRgb(hue(channels[0]), component(channels[1], 1) / (channels[1].endsWith('%') ? 1 : 100), component(channels[2], 1) / (channels[2].endsWith('%') ? 1 : 100));
  else rgb = oklchToRgb(component(channels[0], 1), component(channels[1], 0.4), hue(channels[2]));
  const result = [...rgb.map(clamp01), clamp01(alpha)];
  return result.some(Number.isNaN) ? null : result;
}

/** Compõe uma cor com transparência sobre um fundo opaco. */
export function composite(top, bottom) {
  const a = top[3];
  return [0, 1, 2].map(i => top[i] * a + bottom[i] * (1 - a)).concat(1);
}

export function luminance([r, g, b]) {
  const lin = c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

export function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

export function toHex([r, g, b, a = 1]) {
  const hex = [r, g, b].map(c => Math.round(c * 255).toString(16).padStart(2, '0')).join('');
  return `#${hex}${a < 1 ? Math.round(a * 255).toString(16).padStart(2, '0') : ''}`;
}
