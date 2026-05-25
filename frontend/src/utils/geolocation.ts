/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Get user's current location
 */
export const getCurrentLocation = (): Promise<{
  latitude: number;
  longitude: number;
}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      {
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 30000,
      },
    );
  });
};

/**
 * Reverse geocoding - get address from coordinates (using a simple API)
 * You can integrate with Google Maps API for better results
 */
export const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number,
) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    const data = await response.json();

    const address = data.address || {};

    const normalize = (value?: string) => (value || "").trim();

    const sanitizeCity = (value: string) => {
      return value
        .replace(/\s+city\s+subdistrict$/i, "")
        .replace(/\s+subdistrict$/i, "")
        .replace(/\s+district$/i, "")
        .replace(/\s+taluka$/i, "")
        .replace(/\s+tehsil$/i, "")
        .trim();
    };

    const dedupeParts = (
      parts: Array<string | undefined>,
      excludes: string[],
    ) => {
      const excludeSet = new Set(excludes.map((item) => item.toLowerCase()));
      const unique: string[] = [];

      for (const part of parts) {
        const clean = normalize(part);
        if (!clean) continue;
        const lower = clean.toLowerCase();
        if (excludeSet.has(lower)) continue;
        if (unique.some((item) => item.toLowerCase() === lower)) continue;
        unique.push(clean);
      }

      return unique;
    };

    const cityCandidateRaw = normalize(
      address.city || address.town || address.village,
    );

    const tooSpecificParts = dedupeParts(
      [
        address.neighbourhood,
        address.residential,
        address.road,
        address.hamlet,
        address.quarter,
        address.locality,
      ],
      [],
    ).map((item) => item.toLowerCase());

    const fallbackCityRaw = normalize(
      address.city_district ||
        address.state_district ||
        address.county ||
        address.municipality,
    );

    const suburbCandidate = normalize(address.suburb);
    const neighbourhoodCandidate = normalize(address.neighbourhood);
    const residentialCandidate = normalize(address.residential);

    const cityCandidate = sanitizeCity(cityCandidateRaw);
    const fallbackCity = sanitizeCity(fallbackCityRaw);

    const city =
      cityCandidate &&
      !tooSpecificParts.includes(cityCandidate.toLowerCase()) &&
      cityCandidate.toLowerCase() !== suburbCandidate.toLowerCase() &&
      cityCandidate.toLowerCase() !== neighbourhoodCandidate.toLowerCase() &&
      cityCandidate.toLowerCase() !== residentialCandidate.toLowerCase()
        ? cityCandidate
        : fallbackCity && !tooSpecificParts.includes(fallbackCity.toLowerCase())
          ? fallbackCity
          : suburbCandidate &&
              !tooSpecificParts.includes(suburbCandidate.toLowerCase())
            ? suburbCandidate
            : cityCandidate || fallbackCity || "";

    const nameCandidate = normalize(
      data.name ||
        address.amenity ||
        address.building ||
        address.office ||
        address.shop ||
        address.tourism ||
        address.leisure ||
        address.man_made,
    );

    const streetCandidate = normalize(
      address.road || address.pedestrian || address.footway,
    );

    const locationLine1Parts = dedupeParts(
      [nameCandidate, streetCandidate, address.hamlet, address.locality],
      [city],
    );

    if (locationLine1Parts.length === 0) {
      locationLine1Parts.push(
        ...dedupeParts([address.neighbourhood, address.residential], [city]),
      );
    }

    const locationLine1 = locationLine1Parts.join(", ");

    const primaryLandmarkParts = dedupeParts(
      [address.suburb, address.neighbourhood, address.residential],
      [city, locationLine1],
    );

    const secondaryLandmarkParts = dedupeParts(
      [address.quarter, address.locality, address.road],
      [city, locationLine1],
    );

    const landmarkArea =
      primaryLandmarkParts.length > 0
        ? primaryLandmarkParts.join(", ")
        : secondaryLandmarkParts.join(", ");

    return {
      fullAddress:
        data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,

      locationLine1,

      city,

      landmarkArea,
    };
  } catch (error) {
    return {
      fullAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
      locationLine1: "",
      city: "",
      landmarkArea: "",
    };
  }
};

/**
 * Format coordinates for display
 */
export const formatCoordinates = (lat: number, lon: number): string => {
  return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
};
