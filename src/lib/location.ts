/**
 * Attempts to retrieve the user's location using the browser's Geolocation API.
 * If that fails (e.g., permission denied or timeout), it falls back to an IP-based API.
 */
export const getUserLocation = async (): Promise<string> => {
  // Try using the browser's Geolocation API first
  try {
    const geo = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
      });
    });

    const { latitude, longitude } = geo.coords;
    return `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`;
  } catch (geoErr) {
    console.warn("Geolocation failed, falling back to IP-based location:", geoErr);

    // Fallback to IP-based location
    try {
      const res = await fetch("https://ipapi.co/json/");
      if (!res.ok) throw new Error("IP API response error");

      const data = await res.json();
      return `${data.city}, ${data.region}, ${data.country_name}`;
    } catch (ipErr) {
      console.warn("IP API also failed:", ipErr);
      return 'Unknown';
    }
  }
};
