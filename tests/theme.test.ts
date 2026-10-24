import test from 'node:test';
import assert from 'node:assert/strict';
import { createThemeStore, THEME_STORAGE_KEY } from '../react/theme-store.ts';

function media(dark=false) {
  const listeners = new Set<() => void>();
  return { matches:dark, addEventListener(_type:string, callback:()=>void){listeners.add(callback);}, removeEventListener(_type:string, callback:()=>void){listeners.delete(callback);}, change(dark:boolean){this.matches=dark;listeners.forEach(callback=>callback());}, count:()=>listeners.size };
}
function storage(initial:string|null=null) {
  const data=new Map<string,string>();if(initial!==null)data.set(THEME_STORAGE_KEY,initial);
  return {getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value);}};
}
test('system mode follows OS changes and releases its listener',()=>{
  const system=media();const applied:string[]=[];
  const store=createThemeStore({system,apply:theme=>applied.push(theme)});
  const stop=store.start();
  assert.deepEqual(store.getSnapshot(),{preference:'system',resolvedTheme:'light'});
  system.change(true);
  assert.deepEqual(store.getSnapshot(),{preference:'system',resolvedTheme:'dark'});
  assert.deepEqual(applied,['light','dark']);
  stop();assert.equal(system.count(),0);
});
test('explicit preference overrides OS and survives a new store',()=>{
  const saved=storage();const system=media(true);
  const store=createThemeStore({storage:saved,system});const stop=store.start();
  store.setPreference('light');system.change(false);system.change(true);
  assert.equal(store.getSnapshot().resolvedTheme,'light');
  assert.equal(saved.getItem(THEME_STORAGE_KEY),'light');
  assert.deepEqual(createThemeStore({storage:saved,system}).getSnapshot(),{preference:'light',resolvedTheme:'light'});
  store.setPreference('system');assert.equal(store.getSnapshot().resolvedTheme,'dark');stop();
});
test('saved dark preference is used on the first render',()=>{
  assert.deepEqual(createThemeStore({storage:storage('dark'),system:media(false)}).getSnapshot(),{preference:'dark',resolvedTheme:'dark'});
});
test('invalid storage and blocked storage fall back safely',()=>{
  assert.equal(createThemeStore({storage:storage('invalid'),system:media(true)}).getSnapshot().preference,'system');
  const blocked={getItem(){throw new Error('blocked');},setItem(){throw new Error('blocked');}};
  const store=createThemeStore({storage:blocked,system:media()});
  assert.doesNotThrow(()=>store.setPreference('dark'));
  assert.equal(store.getSnapshot().resolvedTheme,'dark');
});
test('subscribers observe changes and can unsubscribe',()=>{
  const store=createThemeStore();let calls=0;
  const unsubscribe=store.subscribe(()=>calls++);store.setPreference('dark');
  assert.equal(calls,1);unsubscribe();store.setPreference('light');assert.equal(calls,1);
});
