export type Coords = { lat: number; lon: number };

export function getCurrentCoords(): Promise<Coords | null> {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        lat: position.coords.latitude,
        lon: position.coords.longitude
      }),
      () => resolve(null),
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000
      }
    );
  });
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`, {
      headers: { "Accept-Language": "nl", "User-Agent": "ReisNaarFrankrijkApp/1.0" }
    });
    if (!res.ok) return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;

    const data = await res.json();
    const city = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality || "";
    const county = data.address?.county || data.address?.state || "";

    if (city && county) return `${city}, ${county}`;
    if (city) return city;
    if (county) return county;
    return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  }
}

export function buildMapsLinks(lat: number, lon: number) {
  const q = `${lat},${lon}`;
  return {
    google: `https://www.google.com/maps?q=${encodeURIComponent(q)}`,
    osm: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`
  };
}
