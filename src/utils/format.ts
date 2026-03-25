import type { AvailabilityStatus } from "@/types";

export function formatMiles(mi: number) {
  return `${mi.toFixed(mi < 10 ? 1 : 0)} mi`;
}

export function formatAvailability(status: AvailabilityStatus) {
  switch (status) {
    case "available":
      return { label: "Available", tone: "mint" as const };
    case "limited":
      return { label: "Limited", tone: "brand" as const };
    case "not_available":
      return { label: "Not available", tone: "slate" as const };
  }
}

export function formatTimeRange(startIso: string, endIso: string) {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const date = start.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
  const startTime = start.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit"
  });
  const endTime = end.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit"
  });
  return `${date} · ${startTime}–${endTime}`;
}

