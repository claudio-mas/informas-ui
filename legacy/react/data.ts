export type FileKind = 'doc' | 'sheet' | 'slides' | 'note';
export interface FileRecord { id: string; name: string; location: string; owner: string; type: FileKind; openedAt: string; }
export type FileSort = 'name' | 'openedAt' | 'owner';
export interface FileQuery { query?: string; kinds?: readonly FileKind[]; sort?: FileSort; direction?: 'asc' | 'desc'; }
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
export function getVisibleFiles(files: readonly FileRecord[], { query = '', kinds = [], sort, direction = 'asc' }: FileQuery = {}): FileRecord[] {
  const term = normalize(query);
  const visible = files.filter(file => (!kinds.length || kinds.includes(file.type)) && (!term || normalize(`${file.name} ${file.owner} ${file.location}`).includes(term)));
  if (!sort) return visible;
  return visible.sort((a,b) => {
    const comparison = sort === 'openedAt' ? (Date.parse(a.openedAt) || 0) - (Date.parse(b.openedAt) || 0) : a[sort].localeCompare(b[sort], 'pt-BR', { sensitivity: 'base', numeric: true });
    return direction === 'desc' ? -comparison : comparison;
  });
}
export function toggleVisibleSelection(selected: ReadonlySet<string>, visibleIds: readonly string[]): Set<string> {
  const next = new Set(selected);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selected.has(id));
  visibleIds.forEach(id => allVisibleSelected ? next.delete(id) : next.add(id));
  return next;
}
