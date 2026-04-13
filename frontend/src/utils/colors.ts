// Deterministic palette for categories & clusters
const PALETTE = [
  '#6e8efb', '#a777e3', '#f6a623', '#50e3c2', '#f55e5e',
  '#4ee4a6', '#fc83d2', '#63c5f5', '#f9e94e', '#b8ff8a',
  '#ff9f7e', '#c6a0f6', '#7ee8fa', '#ffb347', '#85e89d',
];

const COLOR_MAP: Record<string, string> = {};
let colorIdx = 0;

export function getColor(key: string): string {
  if (!COLOR_MAP[key]) {
    COLOR_MAP[key] = PALETTE[colorIdx % PALETTE.length];
    colorIdx++;
  }
  return COLOR_MAP[key];
}

export function resetColors() {
  Object.keys(COLOR_MAP).forEach((k) => delete COLOR_MAP[k]);
  colorIdx = 0;
}

export { PALETTE };
