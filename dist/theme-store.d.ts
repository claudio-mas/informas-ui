export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
export interface ThemeState {
    preference: ThemePreference;
    resolvedTheme: ResolvedTheme;
}
export declare const THEME_STORAGE_KEY = "cloudscape.theme";
interface SystemTheme {
    matches: boolean;
    addEventListener(type: 'change', listener: () => void): void;
    removeEventListener(type: 'change', listener: () => void): void;
}
export interface ThemeEnvironment {
    system?: SystemTheme;
    storage?: Pick<Storage, 'getItem' | 'setItem'>;
    storageKey?: string;
    apply?: (theme: ResolvedTheme, preference: ThemePreference) => void;
}
export declare function createThemeStore({ system, storage, storageKey, apply }?: ThemeEnvironment): {
    getSnapshot: () => ThemeState;
    subscribe(listener: () => void): () => void;
    setPreference(value: ThemePreference): void;
    start(): () => void | undefined;
};
export {};
