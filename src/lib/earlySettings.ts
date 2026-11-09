/**
 * A tiny script that runs in <head>, while the page is still being read and
 * before anything is drawn. It puts the Person's saved Text size, colour theme
 * and dark mode on straight away, so the page never shows the defaults first
 * and then jumps. (See Next's "Preventing flash before hydration" guide.)
 *
 * It has to be plain old JavaScript in a string, so it can't import anything.
 * Keep its keys and allowed values in step with textSize.ts and theme.ts;
 * SavedSettings applies the same choices again once React has loaded.
 */
export const EARLY_SETTINGS_SCRIPT = `(function(){try{
var h=document.documentElement,s=localStorage;
var size=s.getItem("textSize");
if(size==="normal"||size==="extra-large")h.setAttribute("data-text-size",size);
var theme=s.getItem("colorTheme");
if(theme==="green"||theme==="blue")h.classList.add("theme-blue");
if(theme==="high-contrast")h.classList.add("theme-high-contrast");
var dark=s.getItem("darkMode");
if(dark==="dark"||(dark===null&&window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches))h.classList.add("dark");
}catch(e){}})()`;
