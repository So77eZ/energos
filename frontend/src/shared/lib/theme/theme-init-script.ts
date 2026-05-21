import { ACCENT_MAP, DEFAULT_PREFS, STORAGE_KEY } from './constants'

// Inline <script> injected into <head> to apply theme + accent before React
// hydrates. Prevents the flash of wrong theme on first paint.
export const THEME_INIT_SCRIPT = `(function(){try{
var M=${JSON.stringify(ACCENT_MAP)};
var raw=localStorage.getItem('${STORAGE_KEY}');
var p=raw?JSON.parse(raw):{};
var t=p.theme==='light'?'light':'${DEFAULT_PREFS.theme}';
var aK=M[p.accent]?p.accent:'${DEFAULT_PREFS.accent}';
var a=M[aK];
var h=document.documentElement;
h.setAttribute('data-theme',t);
h.style.setProperty('--accent',a.hex);
h.style.setProperty('--accent-rgb',a.rgb);
}catch(e){}})();`
