/**
 * Birthday mode: the site dresses up on Fakea's birthday and goes back to the
 * monochrome palette the next day, so nobody has to remember to revert it.
 *
 * Everything themed hangs off the `birthday` class on `<html>` — the palette
 * swap in `index.css`, the confetti layer, the hero decorations — so there is
 * exactly one switch. `applyBirthdayMode()` runs before React mounts because
 * `NeuralBackground` samples the palette once at mount.
 *
 * Preview or force it on any day with `?birthday` (or `?birthday=1`); silence
 * it on the day itself with `?birthday=0`.
 */
export const BIRTHDAY = { month: 9, day: 15 } as const;

export const BIRTHDAY_CLASS = "birthday";

export function isBirthdayToday(now: Date = new Date()): boolean {
  return now.getMonth() + 1 === BIRTHDAY.month && now.getDate() === BIRTHDAY.day;
}

export function isBirthdayMode(): boolean {
  if (typeof window === "undefined") return false;
  const override = new URLSearchParams(window.location.search).get("birthday");
  if (override !== null) return override !== "0" && override !== "false";
  return isBirthdayToday();
}

export function applyBirthdayMode(): boolean {
  const on = isBirthdayMode();
  document.documentElement.classList.toggle(BIRTHDAY_CLASS, on);
  // Mobile browser chrome follows the party too (index.html ships white).
  if (on) {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", "#fdf8f2");
  }
  return on;
}

/** Name of the DOM event `BirthdayConfetti` listens for to fire a burst. */
export const CONFETTI_BURST_EVENT = "birthday:confetti-burst";

export type ConfettiBurstDetail = { x: number; y: number };

/** Pop a confetti burst at a viewport position (defaults to top-centre). */
export function popConfetti(x?: number, y?: number) {
  window.dispatchEvent(
    new CustomEvent<ConfettiBurstDetail>(CONFETTI_BURST_EVENT, {
      detail: {
        x: x ?? window.innerWidth / 2,
        y: y ?? window.innerHeight * 0.3,
      },
    }),
  );
}
