import type { SVGProps } from 'react';
const paths = {
  search: 'm20 20-5-5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  plus: 'M12 4v16M4 12h16', close: 'm6 6 12 12M6 18 18 6',
  home: 'm3 10 9-7 9 7v11h-6v-7H9v7H3Z',
  folder: 'M3 6h7l2 3h9v11H3ZM3 6V4h7l2 3',
  people: 'M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8M18 4a4 4 0 0 1 0 8M22 21v-3a4 4 0 0 0-3-3.87',
  trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7',
  person: 'M20 21a8 8 0 0 0-16 0M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10',
  settings: 'm9 3-1 3-3 1-2 3 2 2v3l2 3h3l2 3 3-1 1-3 3-1 2-3-2-2V8l-2-3h-3l-2-3ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  diamond: 'm3 8 4-5h10l4 5-9 13ZM3 8h18M7 3l5 18 5-18',
  chevron: 'm7 10 5 5 5-5', check: 'm5 12 4 4L19 6',
  arrow: 'M12 19V5m-5 5 5-5 5 5',
  menu: 'M4 6h16M4 12h16M4 18h16', more: 'M5 12h.01M12 12h.01M19 12h.01',
  info: 'M12 11v6m0-10h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  upload: 'M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5',
  file: 'M6 2h8l5 5v15H6ZM14 2v6h5M9 12h7M9 16h7',
  grid: 'M4 4h5v5H4ZM15 4h5v5h-5ZM4 15h5v5H4ZM15 15h5v5h-5Z',
  sparkles: 'm12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3ZM20 2v4M18 4h4',
  download: 'M12 3v13m-5-5 5 5 5-5M4 17v4h16v-4',
} as const;
export type IconName = keyof typeof paths;
export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}><path d={paths[name]} /></svg>;
}
export function CloudMark() {
  return <svg width="36" height="30" viewBox="0 0 40 32" aria-hidden="true"><path fill="#0f6cbd" d="M10 27a9 9 0 0 1-2-18 11 11 0 0 1 20 0 9 9 0 0 1 2 18Z"/><path fill="#42b5f5" d="M20 6a11 11 0 0 1 8 3 9 9 0 0 1 2 18H12Z"/><path fill="#2457ad" d="M10 27a9 9 0 0 1-2-18l12 7Z"/></svg>;
}
