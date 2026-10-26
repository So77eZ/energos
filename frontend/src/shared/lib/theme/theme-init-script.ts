import { ACCENT_MAP, DEFAULT_PREFS, STORAGE_KEY } from './constants'
import {
  DEFAULT_FONT, FONT_STACKS, OPTIONAL_FONT_HREFS, PREFS_SCHEMA_VERSION, PREFS_STORAGE_KEY, fontLinkId,
} from '../fonts'

// Опциональные шрифты: id <link> общий с layout.tsx и ensureFontLoaded — не грузим дважды.
const FONT_LINKS = Object.fromEntries(
  Object.entries(OPTIONAL_FONT_HREFS).map(([font, href]) => [font, { id: fontLinkId(font), href }]),
)

// Inline <script> injected into <head> to apply theme + accent before React
// hydrates. Prevents the flash of wrong theme on first paint.
// Шрифт — тоже здесь: раньше его применял только useUserPreferences, то есть пока открыта
// панель настроек, и после перезагрузки сайт возвращался к шрифту по умолчанию.
// Логика — как в applyFont (user-preferences.ts).
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
if(p.motion==='always')h.setAttribute('data-force-motion','');
}catch(e){}
try{
var S=${JSON.stringify(FONT_STACKS)};
var L=${JSON.stringify(FONT_LINKS)};
var fr=localStorage.getItem('${PREFS_STORAGE_KEY}');
var fp=fr?JSON.parse(fr):{};
var f=fp.v===${PREFS_SCHEMA_VERSION}?fp.font:null;
if(S.hasOwnProperty(f)&&f!=='${DEFAULT_FONT}'){
var st=document.documentElement.style;
st.setProperty('--font-sans',S[f]);
st.setProperty('--font-title',S[f]);
if(L[f]&&!document.getElementById(L[f].id)){var l=document.createElement('link');l.id=L[f].id;l.rel='stylesheet';l.href=L[f].href;document.head.appendChild(l);}
}
}catch(e){}})();`
