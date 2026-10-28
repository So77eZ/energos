import { ACCENT_MAP, DEFAULT_PREFS, GFX_STORAGE_KEY, STORAGE_KEY } from './constants'
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
// Слабая графика (gfx.ts): WebGL с failIfMajorPerformanceCaveat не создаётся, если браузер рисует
// без видеокарты, — тогда data-gfx="low" ещё до первой отрисовки, тяжёлые эффекты не мелькают.
// С видеокартой создание контекста стоит 20–110 мс и блокирует отрисовку, поэтому «есть» ('full')
// запоминаем и больше не проверяем (пропадёт ускорение — поймает замер кадров). Без видеокарты
// проверка — 3–5 мс, её повторяем: включат ускорение — режим снимется сам.
// Анимации, если пользователь не выбирал, при этом выключены — как при системном reduce.
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
var gv=localStorage.getItem('${GFX_STORAGE_KEY}');
var lo=gv==='low';
if(!gv){var gl=document.createElement('canvas').getContext('webgl',{failIfMajorPerformanceCaveat:true});lo=!gl;var lc=gl&&gl.getExtension('WEBGL_lose_context');if(lc)lc.loseContext();if(gl)localStorage.setItem('${GFX_STORAGE_KEY}','full');}
if(lo)h.setAttribute('data-gfx','low');
var mo=p.motion==='on'||p.motion==='always'?'on':p.motion==='off'?'off':(lo||matchMedia('(prefers-reduced-motion: reduce)').matches?'off':'on');
h.setAttribute('data-motion',mo);
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
