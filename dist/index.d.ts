import { type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from 'react';
import { type IconName } from './Icon.js';
import { type FileKind, type FileRecord, type FileSort } from './data.js';
export * from './Icon.js';
export * from './data.js';
export * from './Theme.js';
export * from './theme-store.js';
export declare function Button({ variant, icon, children, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost' | 'soft';
    icon?: IconName;
}): import("react").JSX.Element;
export declare function IconButton({ label, icon, ...props }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
    label: string;
    icon: IconName;
}): import("react").JSX.Element;
export declare function Avatar({ initials, name, onClick }: {
    initials: string;
    name: string;
    onClick?: () => void;
}): import("react").JSX.Element;
export declare function SearchField({ label, value, onChange, className }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    className?: string;
}): import("react").JSX.Element;
export interface Segment {
    value: string;
    label: string;
    accessibleLabel?: string;
}
export declare function SegmentedControl({ label, options, value, onChange }: {
    label: string;
    options: readonly Segment[];
    value: string;
    onChange: (value: string) => void;
}): import("react").JSX.Element;
export declare function Notice({ children, actions, onDismiss, label }: {
    children: ReactNode;
    actions?: ReactNode;
    onDismiss?: () => void;
    label?: string;
}): import("react").JSX.Element;
export declare const FILE_LABELS: Record<FileKind, string>;
export declare function FileBadge({ kind, small }: {
    kind: FileKind;
    small?: boolean;
}): import("react").JSX.Element;
export declare function QuickCard({ kind, title, description, onClick }: {
    kind: FileKind;
    title: string;
    description: string;
    onClick?: () => void;
}): import("react").JSX.Element;
export declare function FilterChips({ value, onChange }: {
    value: readonly FileKind[];
    onChange: (value: FileKind[]) => void;
}): import("react").JSX.Element;
export declare function UsageMeter({ value, max, label, detail }: {
    value: number;
    max: number;
    label: string;
    detail?: string;
}): import("react").JSX.Element;
export declare function SidebarLink({ children, icon, href, active, onClick }: {
    children: ReactNode;
    icon: IconName;
    href?: string;
    active?: boolean;
    onClick?: () => void;
}): import("react").JSX.Element;
export interface MenuItem {
    label: string;
    icon?: IconName;
    onSelect?: () => void;
    disabled?: boolean;
}
export declare function ActionMenu({ label, items, icon, variant }: {
    label: string;
    items: readonly MenuItem[];
    icon?: IconName;
    variant?: 'primary' | 'secondary' | 'ghost';
}): import("react").JSX.Element;
export interface FileTableProps {
    files: readonly FileRecord[];
    selection?: ReadonlySet<string>;
    onSelectionChange?: (value: Set<string>) => void;
    sort?: FileSort;
    direction?: 'asc' | 'desc';
    onSort?: (key: FileSort) => void;
    onOpen?: (file: FileRecord) => void;
    formatDate?: (value: string) => string;
}
export declare function FileTable({ files, selection, onSelectionChange, sort, direction, onSort, onOpen, formatDate }: FileTableProps): import("react").JSX.Element;
export declare function EmptyState({ title, description, action }: {
    title?: string;
    description?: string;
    action?: ReactNode;
}): import("react").JSX.Element;
export declare function Skeleton({ rows }: {
    rows?: number;
}): import("react").JSX.Element;
export declare function AppShell({ header, sidebar, children, style }: {
    header: ReactNode;
    sidebar: ReactNode;
    children: ReactNode;
    style?: CSSProperties;
}): import("react").JSX.Element;
