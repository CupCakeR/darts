import { dartLabel, type Dart } from "#engine";

const decimal = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const formatAverage = (value: number | null) => (value === null ? "–" : decimal.format(value));

export const formatRoute = (route: Dart[] | null) => route?.map(dartLabel).join(" ") ?? null;
