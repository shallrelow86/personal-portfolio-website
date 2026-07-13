export const FULLPAGE_ACTIVE = "fullpage:active";
export const FULLPAGE_SCROLL = "fullpage:scroll";

export function emitFullPageScroll(index: number) {
  window.dispatchEvent(new CustomEvent(FULLPAGE_SCROLL, { detail: index }));
}
