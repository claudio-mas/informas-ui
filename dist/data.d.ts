export type FileKind = 'doc' | 'sheet' | 'slides' | 'note';
export interface FileRecord {
    id: string;
    name: string;
    location: string;
    owner: string;
    type: FileKind;
    openedAt: string;
}
export type FileSort = 'name' | 'openedAt' | 'owner';
export interface FileQuery {
    query?: string;
    kinds?: readonly FileKind[];
    sort?: FileSort;
    direction?: 'asc' | 'desc';
}
export declare function getVisibleFiles(files: readonly FileRecord[], { query, kinds, sort, direction }?: FileQuery): FileRecord[];
export declare function toggleVisibleSelection(selected: ReadonlySet<string>, visibleIds: readonly string[]): Set<string>;
