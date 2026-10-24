import { type ReactNode } from 'react';
import { type ThemePreference } from './theme-store.js';
/** One provider at the application root controls document theme and saved preference. */
export declare function ThemeProvider({ children, storageKey }: {
    children: ReactNode;
    storageKey?: string;
}): import("react").JSX.Element;
export declare function useTheme(): {
    preference: ThemePreference;
    resolvedTheme: import("./theme-store.js").ResolvedTheme;
    setPreference: (value: ThemePreference) => void;
};
export declare function ThemeSwitcher(): import("react").JSX.Element;
