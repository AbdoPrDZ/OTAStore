export const radius = {
  control: 8,
  button: 10,
  card: 14,
  sheet: 20,
  pill: 999,
} as const;

export type RadiusKey = keyof typeof radius;
