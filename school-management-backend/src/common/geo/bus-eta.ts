/** Earth-radius haversine helpers for bus stop ETAs (no external routing API). */

const EARTH_RADIUS_M = 6_371_000;
/** Urban school-bus average used when no live speed is available (~22 km/h). */
export const BUS_ETA_SPEED_MPS = 22_000 / 3_600;

export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function etaMinutesFromMeters(
  meters: number,
  speedMps = BUS_ETA_SPEED_MPS,
): number {
  if (!Number.isFinite(meters) || meters < 0) return 0;
  const speed = speedMps > 0.5 ? speedMps : BUS_ETA_SPEED_MPS;
  return Math.max(0, Math.ceil(meters / speed / 60));
}

export type EtaStop = {
  studentId: string;
  lat: number;
  lng: number;
};

export type EtaStopResult = EtaStop & {
  distance_m: number;
  eta_minutes: number;
  sequence: number;
};

/**
 * Greedy nearest-neighbor from the bus through remaining stops.
 * Cumulative drive time is used so later stops include travel between students.
 */
export function orderStopsWithEta(
  busLat: number,
  busLng: number,
  stops: EtaStop[],
  speedMps = BUS_ETA_SPEED_MPS,
): EtaStopResult[] {
  const remaining = stops.filter(
    (s) =>
      Number.isFinite(s.lat) &&
      Number.isFinite(s.lng) &&
      Math.abs(s.lat) <= 90 &&
      Math.abs(s.lng) <= 180,
  );
  const out: EtaStopResult[] = [];
  let curLat = busLat;
  let curLng = busLng;
  let cumulativeM = 0;
  let seq = 1;
  while (remaining.length) {
    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineMeters(curLat, curLng, remaining[i].lat, remaining[i].lng);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    const next = remaining.splice(bestIdx, 1)[0];
    cumulativeM += bestDist;
    out.push({
      ...next,
      distance_m: Math.round(bestDist),
      eta_minutes: etaMinutesFromMeters(cumulativeM, speedMps),
      sequence: seq++,
    });
    curLat = next.lat;
    curLng = next.lng;
  }
  return out;
}

/** Alert once when the bus is about 3–5 minutes from the stop. */
export function shouldAlertApproaching(etaMinutes: number): boolean {
  return etaMinutes >= 3 && etaMinutes <= 5;
}
