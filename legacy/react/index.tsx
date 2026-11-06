import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { Icon, type IconName } from './Icon.js';
import { toggleVisibleSelection, type FileKind, type FileRecord, type FileSort } from './data.js';
export * from './Icon.js';
export * from './data.js';
export * from './Theme.js';
export * from './theme-store.js';

export function Button({ variant = 'secondary', icon, children, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'soft'; icon?: IconName }) {
  return <button type="button" className={`cs-button cs-button--${variant} ${className}`} {...props}>{icon && <Icon name={icon}/>}<span>{children}</span></button>;
}
export function IconButton({ label, icon, ...props }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & { label: string; icon: IconName }) {
  return <button type="button" className="cs-icon-button" aria-label={label} title={label} {...props}><Icon name={icon}/></button>;
}
export function Avatar({ initials, name, onClick }: { initials: string; name: string; onClick?: () => void }) {
  return onClick ? <button type="button" className="cs-avatar" aria-label={name} onClick={onClick}>{initials}</button> : <span className="cs-avatar" role="img" aria-label={name}>{initials}</span>;
}
export function SearchField({ label, value, onChange, className = '' }: { label: string; value: string; onChange: (value: string) => void; className?: string }) {
  return <label className={`cs-search ${className}`}><Icon name="search"/><span className="cs-sr-only">{label}</span><input type="search" placeholder={label} value={value} onChange={event => onChange(event.target.value)}/>{value && <button type="button" className="cs-search-clear" aria-label={`Limpar ${label}`} onClick={() => onChange('')}><Icon name="close" width="16" height="16"/></button>}</label>;
}
export interface Segment { value: string; label: string; accessibleLabel?: string; }
export function SegmentedControl({ label, options, value, onChange }: { label: string; options: readonly Segment[]; value: string; onChange: (value: string) => void }) {
  return <div className="cs-segmented" role="group" aria-label={label}>{options.map(option => <button type="button" key={option.value} aria-label={option.accessibleLabel} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}</button>)}</div>;
}
export function Notice({ children, actions, onDismiss, label = 'Aviso de armazenamento' }: { children: ReactNode; actions?: ReactNode; onDismiss?: () => void; label?: string }) {
  return <section className="cs-notice" aria-label={label}><Icon name="info" width="16" height="16"/><div className="cs-notice-content">{children}</div>{actions && <div className="cs-notice-actions">{actions}</div>}{onDismiss && <IconButton label="Fechar aviso" icon="close" onClick={onDismiss}/>}</section>;
}
export const FILE_LABELS: Record<FileKind, string> = { doc: 'Documento', sheet: 'Planilha', slides: 'Apresentação', note: 'Anotação' };
export function FileBadge({ kind, small = false }: { kind: FileKind; small?: boolean }) {
  return <span className={`cs-file-badge cs-file-badge--${kind} ${small ? 'cs-file-badge--small' : ''}`} role="img" aria-label={FILE_LABELS[kind]}><span className="cs-file-page"/><span className="cs-file-letter" aria-hidden="true">{{doc:'D', sheet:'P', slides:'A', note:'N'}[kind]}</span></span>;
}
export function QuickCard({ kind, title, description, onClick }: { kind: FileKind; title: string; description: string; onClick?: () => void }) {
  return <button type="button" className="cs-quick-card" onClick={onClick}><FileBadge kind={kind}/><span><strong>{title}</strong><small>{description}</small></span></button>;
}
const kinds: FileKind[] = ['doc', 'sheet', 'slides', 'note'];
const pluralLabels = { doc: 'Documentos', sheet: 'Planilhas', slides: 'Apresentações', note: 'Anotações' };
export function FilterChips({ value, onChange }: { value: readonly FileKind[]; onChange: (value: FileKind[]) => void }) {
  return <div className="cs-filter-chips" role="group" aria-label="Tipos de arquivo">{kinds.map(kind => <button type="button" title={pluralLabels[kind]} key={kind} aria-label={pluralLabels[kind]} aria-pressed={value.includes(kind)} onClick={() => onChange(value.includes(kind) ? value.filter(item => item !== kind) : [...value, kind])}><FileBadge kind={kind} small/></button>)}</div>;
}
export function UsageMeter({ value, max, label, detail }: { value: number; max: number; label: string; detail?: string }) {
  const percent = max > 0 ? Math.max(0, Math.min(100, value / max * 100)) : 0;
  return <div className="cs-usage"><strong>{label}</strong><div role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)} aria-valuetext={detail} className="cs-usage-track"><span style={{ width: `${percent}%` }}/></div>{detail && <small>{detail}</small>}</div>;
}
export function SidebarLink({ children, icon, href = '#', active = false, onClick }: { children: ReactNode; icon: IconName; href?: string; active?: boolean; onClick?: () => void }) {
  return <a className={`cs-sidebar-link ${active ? 'is-active' : ''}`} href={href} aria-current={active ? 'page' : undefined} onClick={onClick ? event => { event.preventDefault(); onClick(); } : undefined}><Icon name={icon}/><span>{children}</span></a>;
}
export interface MenuItem { label: string; icon?: IconName; onSelect?: () => void; disabled?: boolean; }
export function ActionMenu({ label, items, icon = 'plus', variant = 'primary' }: { label: string; items: readonly MenuItem[]; icon?: IconName; variant?: 'primary' | 'secondary' | 'ghost' }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const id = useId();
  const restore = () => { setOpen(false); trigger.current?.focus(); };
  useEffect(() => {
    if (!open) return;
    menu.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') { event.preventDefault(); restore(); return; }
    if (event.key === 'Tab') { setOpen(false); return; }
    if (!['ArrowDown','ArrowUp','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const buttons = [...(menu.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)') ?? [])];
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next]?.focus();
  };
  return <div ref={root} className="cs-action-menu"><button ref={trigger} type="button" className={`cs-button cs-button--${variant}`} aria-haspopup="menu" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen(!open)} onKeyDown={event => { if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); } }}><Icon name={icon}/><span>{label}</span></button>{open && <div id={id} ref={menu} className="cs-menu" role="menu" aria-label={label} onKeyDown={handleKey}>{items.map(item => <button type="button" key={item.label} role="menuitem" disabled={item.disabled} onClick={() => { item.onSelect?.(); restore(); }}>{item.icon && <Icon name={item.icon}/>}<span>{item.label}</span></button>)}</div>}</div>;
}
function BulkCheckbox({ checked, mixed, onChange }: { checked: boolean; mixed: boolean; onChange: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = mixed; }, [mixed]);
  return <input ref={ref} type="checkbox" checked={checked} aria-label="Selecionar arquivos visíveis" onChange={onChange}/>;
}
export interface FileTableProps {
  files: readonly FileRecord[]; selection?: ReadonlySet<string>; onSelectionChange?: (value: Set<string>) => void;
  sort?: FileSort; direction?: 'asc' | 'desc'; onSort?: (key: FileSort) => void; onOpen?: (file: FileRecord) => void;
  formatDate?: (value: string) => string;
}
const defaultDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? 'Data indisponível' : new Intl.DateTimeFormat('pt-BR', { day:'numeric', month:'short', timeZone:'UTC' }).format(date);
};
export function FileTable({ files, selection = new Set(), onSelectionChange, sort, direction = 'asc', onSort, onOpen, formatDate = defaultDate }: FileTableProps) {
  const all = files.length > 0 && files.every(file => selection.has(file.id));
  const some = files.some(file => selection.has(file.id));
  const headers: { key: FileSort; label: string }[] = [{key:'name',label:'Nome'},{key:'openedAt',label:'Aberto'},{key:'owner',label:'Proprietário'}];
  return <div className="cs-table-wrap" tabIndex={0} role="region" aria-label="Arquivos recentes, tabela com rolagem horizontal"><table className="cs-file-table"><thead><tr>{onSelectionChange && <th className="cs-selection-cell"><BulkCheckbox checked={all} mixed={some && !all} onChange={() => onSelectionChange(toggleVisibleSelection(selection,files.map(file => file.id)))}/></th>}{headers.map(header => <th key={header.key} scope="col" aria-sort={sort === header.key ? direction === 'asc' ? 'ascending' : 'descending' : undefined}>{onSort ? <button type="button" onClick={() => onSort(header.key)} aria-label={`${header.label} Ordenar`}>{header.label}{sort === header.key && <Icon name="arrow" className={direction === 'desc' ? 'cs-arrow-down' : ''} width="14" height="14"/>}</button> : header.label}</th>)}</tr></thead><tbody>{files.map(file => <tr key={file.id} className={selection.has(file.id) ? 'is-selected' : ''}>{onSelectionChange && <td className="cs-selection-cell"><input type="checkbox" aria-label={`Selecionar ${file.name}`} checked={selection.has(file.id)} onChange={() => { const next = new Set(selection); next.has(file.id) ? next.delete(file.id) : next.add(file.id); onSelectionChange(next); }}/></td>}<td className="cs-name-cell"><div className="cs-file-name"><FileBadge kind={file.type}/><span>{onOpen ? <button type="button" className="cs-file-open" onClick={() => onOpen(file)} title={file.name}>{file.name}</button> : <strong title={file.name}>{file.name}</strong>}<small>{file.location}</small></span></div></td><td><time dateTime={file.openedAt}>{formatDate(file.openedAt)}</time></td><td><span className="cs-owner" title={file.owner}>{file.owner}</span></td></tr>)}</tbody></table></div>;
}
export function EmptyState({ title = 'Nenhum arquivo encontrado', description = 'Tente outro nome ou ajuste os filtros.', action }: { title?: string; description?: string; action?: ReactNode }) {
  return <div className="cs-empty" role="status"><span className="cs-empty-icon"><Icon name="search" width="28" height="28"/></span><h3>{title}</h3><p>{description}</p>{action}</div>;
}
export function Skeleton({ rows = 3 }: { rows?: number }) {
  return <div className="cs-skeleton" role="status"><span className="cs-sr-only">Carregando arquivos</span>{Array.from({length:rows}, (_,i) => <div key={i} aria-hidden="true"><span/><span/><span/></div>)}</div>;
}
export function AppShell({ header, sidebar, children, style }: { header: ReactNode; sidebar: ReactNode; children: ReactNode; style?: CSSProperties }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const aside = useRef<HTMLElement>(null);
  const close = () => { setOpen(false); trigger.current?.focus(); };
  useEffect(() => { if (open) aside.current?.querySelector<HTMLButtonElement>('button')?.focus(); }, [open]);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 761px)');
    const releaseDrawer = () => {
      if (!desktop.matches) return;
      setOpen(false);
      if (aside.current?.querySelector('.cs-mobile-close')?.contains(document.activeElement)) {
        aside.current.querySelector<HTMLElement>('.cs-sidebar-create button, nav a[href]')?.focus();
      }
    };
    desktop.addEventListener('change', releaseDrawer);
    return () => desktop.removeEventListener('change', releaseDrawer);
  }, []);
  const navKey = (event: KeyboardEvent<HTMLElement>) => {
    if (!open) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    if (event.key === 'Tab') {
      const controls = [...(aside.current?.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),input') ?? [])];
      const first = controls[0], last = controls[controls.length-1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  };
  return <div className="cs-ui cs-app" style={style}><a href="#cs-main" className="cs-skip-link">Pular para o conteúdo</a><header className="cs-topbar"><button type="button" ref={trigger} className="cs-icon-button cs-mobile-toggle" aria-label="Abrir navegação" aria-expanded={open} onClick={() => setOpen(true)}><Icon name="menu"/></button>{header}</header>{open && <button type="button" className="cs-backdrop" aria-label="Fechar menu lateral" onClick={close}/>}<aside ref={aside} className={`cs-sidebar ${open ? 'is-open' : ''}`} role={open ? 'dialog' : undefined} aria-modal={open || undefined} aria-label="Navegação principal" onKeyDown={navKey}><div className="cs-mobile-close"><IconButton label="Fechar navegação" icon="close" onClick={close}/></div>{sidebar}</aside><main id="cs-main" className="cs-main" tabIndex={-1}>{children}</main></div>;
}
