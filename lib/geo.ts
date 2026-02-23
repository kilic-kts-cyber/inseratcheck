// lib/geo.ts

// Haversine-Formel: Entfernung zwischen zwei Koordinaten in km
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371 // Erdradius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

// Koordinaten aus PLZ (Deutsche PLZ-Grobzuordnung)
// TODO: Für Prod → Geocoding API (OpenStreetMap Nominatim kostenlos)
const ZIP_COORDS: Record<string, [number, number]> = {
  '10': [52.520, 13.405], // Berlin
  '20': [53.551, 9.993],  // Hamburg
  '30': [52.370, 9.735],  // Hannover
  '40': [51.228, 6.773],  // Düsseldorf
  '50': [50.938, 6.960],  // Köln
  '60': [50.110, 8.682],  // Frankfurt
  '67': [49.354, 8.161],  // Neustadt/Weinstraße
  '68': [49.488, 8.469],  // Mannheim
  '70': [48.775, 9.182],  // Stuttgart
  '80': [48.137, 11.576], // München
  '90': [49.453, 11.077], // Nürnberg
}

export function getApproxCoords(zip: string): [number, number] {
  const prefix2 = zip.slice(0, 2)
  return ZIP_COORDS[prefix2] || [51.165, 10.451] // Deutschland-Mitte als Fallback
}

// PLZ-basierte Näherungssuche ohne externe API
export function findNearbyWorkshops<T extends { zip: string; lat: number | null; lng: number | null }>(
  workshops: T[],
  customerZip: string,
  maxDistanceKm: number = 100
): (T & { distanceKm: number })[] {
  const [cLat, cLon] = getApproxCoords(customerZip)

  return workshops
    .map(ws => {
      const [wsLat, wsLon] = ws.lat && ws.lng
        ? [ws.lat, ws.lng]
        : getApproxCoords(ws.zip)
      const distanceKm = haversineDistance(cLat, cLon, wsLat, wsLon)
      return { ...ws, distanceKm }
    })
    .filter(ws => ws.distanceKm <= maxDistanceKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
}
