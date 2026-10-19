// Digital ECG paper: square 1 mm boxes at 25 mm/s and 10 mm/mV.
// These are diagram coordinates, not physical millimetres on a user's screen.
export const STRIP_WIDTH = 800;
export const STRIP_HEIGHT = 100;
export const STRIP_SECONDS = 6;
export const BASELINE = 60;
export const PAPER_SPEED = 25;
export const GAIN = 10;
export const UNITS_PER_SECOND = STRIP_WIDTH / STRIP_SECONDS;
export const SMALL_BOX_UNITS = UNITS_PER_SECOND / PAPER_SPEED;
export const LARGE_BOX_UNITS = SMALL_BOX_UNITS * 5;
export const UNITS_PER_MV = SMALL_BOX_UNITS * GAIN;
export const secondsToUnits = (seconds: number) => seconds * UNITS_PER_SECOND;
export const unitsToSeconds = (units: number) => units / UNITS_PER_SECOND;
