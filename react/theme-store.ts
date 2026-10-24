export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
export interface ThemeState { preference: ThemePreference; resolvedTheme: ResolvedTheme; }
export const THEME_STORAGE_KEY = 'cloudscape.theme';
interface SystemTheme {
  matches: boolean;
  addEventListener(type:'change', listener:()=>void): void;
  removeEventListener(type:'change', listener:()=>void): void;
}
export interface ThemeEnvironment {
  system?: SystemTheme;
  storage?: Pick<Storage,'getItem'|'setItem'>;
  storageKey?: string;
  apply?: (theme:ResolvedTheme, preference:ThemePreference)=>void;
}
export function createThemeStore({system,storage,storageKey=THEME_STORAGE_KEY,apply}:ThemeEnvironment={}) {
  let preference:ThemePreference='system';
  try { const saved=storage?.getItem(storageKey); if(saved==='light'||saved==='dark'||saved==='system')preference=saved; } catch { /* Storage can be unavailable in private/file contexts. */ }
  const resolve=():ResolvedTheme=>preference==='system'?(system?.matches?'dark':'light'):preference;
  let state:ThemeState={preference,resolvedTheme:resolve()};
  const listeners=new Set<()=>void>();
  const update=()=>{
    const next={preference,resolvedTheme:resolve()};
    if(next.preference===state.preference&&next.resolvedTheme===state.resolvedTheme)return;
    state=next;apply?.(state.resolvedTheme,state.preference);listeners.forEach(listener=>listener());
  };
  return {
    getSnapshot:()=>state,
    subscribe(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};},
    setPreference(value:ThemePreference){
      preference=value;
      try{storage?.setItem(storageKey,value);}catch{/* Keep the current-session choice functional. */}
      update();
    },
    start(){
      // Re-read OS state after SSR or a StrictMode effect restart.
      update();apply?.(state.resolvedTheme,state.preference);
      system?.addEventListener('change',update);
      return()=>system?.removeEventListener('change',update);
    },
  };
}
