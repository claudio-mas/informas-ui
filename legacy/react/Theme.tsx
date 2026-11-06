import { createContext, useContext, useEffect, useLayoutEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createThemeStore, type ThemeEnvironment, type ThemePreference } from './theme-store.js';

const ThemeContext=createContext<ReturnType<typeof createThemeStore>|null>(null);
const serverState={preference:'system',resolvedTheme:'light'} as const;
const useBrowserEffect=typeof window==='undefined'?useEffect:useLayoutEffect;
function browserEnvironment(storageKey?:string):ThemeEnvironment {
  if(typeof window==='undefined')return {};
  let storage:Storage|undefined;
  try{storage=window.localStorage;}catch{/* Rendering must not depend on storage permissions. */}
  return {storage,storageKey,system:window.matchMedia?.('(prefers-color-scheme: dark)'),apply(theme,preference){
    document.documentElement.dataset.csTheme=theme;
    document.documentElement.dataset.csThemeMode=preference;
    document.documentElement.style.colorScheme=theme;
  }};
}
/** One provider at the application root controls document theme and saved preference. */
export function ThemeProvider({children,storageKey}:{children:ReactNode;storageKey?:string}) {
  const [store]=useState(()=>createThemeStore(browserEnvironment(storageKey)));
  useBrowserEffect(()=>store.start(),[store]);
  return <ThemeContext.Provider value={store}>{children}</ThemeContext.Provider>;
}
export function useTheme() {
  const store=useContext(ThemeContext);
  if(!store)throw new Error('useTheme must be used inside ThemeProvider.');
  const state=useSyncExternalStore(store.subscribe,store.getSnapshot,()=>serverState);
  return {...state,setPreference:store.setPreference};
}
export function ThemeSwitcher() {
  const {preference,setPreference}=useTheme();
  return <div className="cs-theme-switcher"><span>Aparência</span><div className="cs-segmented" role="group" aria-label="Tema da interface">{([{value:'light',label:'Claro'},{value:'dark',label:'Escuro'},{value:'system',label:'Sistema'}] as const).map(option=><button type="button" key={option.value} aria-pressed={preference===option.value} onClick={()=>setPreference(option.value as ThemePreference)}>{option.label}</button>)}</div></div>;
}
