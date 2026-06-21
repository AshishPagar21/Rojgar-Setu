import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./Button";
import {
  getCurrentLocation,
  getAddressFromCoordinates,
} from "../../utils/geolocation";

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  locationLine1: string;
  city: string;
  landmarkArea: string;
  onLocationChange: (latitude: number, longitude: number) => void;
  onLocationLine1Change: (locationLine1: string) => void;
  onCityChange: (city: string) => void;
  onLandmarkAreaChange: (landmarkArea: string) => void;
  error?: string;
  label?: string;
}

export const LocationPicker = ({
  latitude,
  longitude,
  locationLine1,
  city,
  landmarkArea,
  onLocationChange,
  onLocationLine1Change,
  onCityChange,
  onLandmarkAreaChange,
  error,
  label,
}: LocationPickerProps) => {
  const { t } = useTranslation();
  const displayLabel = label || t("jobs.jobLocationLabel");

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const currentLocationMarker = useRef<any>(null);
  const jobLocationMarker = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const fetchTimeoutRef = useRef<any>(null);
  const searchTimeoutRef = useRef<any>(null);
  const lastMapUpdateAtRef = useRef(0);

  // Request guard tracking reference to prevent out-of-order async responses
  const latestRequestRef = useRef(0);

  // Tracks if field changes came from explicit text input vs automated map updates
  const isUserTextSearchRef = useRef(false);

  const lastAutofillRef = useRef({
    locationLine1: "",
    city: "",
    landmarkArea: "",
  });

  // LIVE LOCATION REFS
  const jobLatRef = useRef(latitude || 20.5937);
  const jobLngRef = useRef(longitude || 78.9629);

  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState<string>();
  const [jobLatitude, setJobLatitude] = useState(jobLatRef.current);
  const [jobLongitude, setJobLongitude] = useState(jobLngRef.current);

  // Initialize string coordinates immediately instead of a static placeholder
  const [locationName, setLocationName] = useState(
    `${jobLatRef.current.toFixed(6)}, ${jobLngRef.current.toFixed(6)}`
  );
  const [fetchingAddress, setFetchingAddress] = useState(false);

  // Sync state and map markers if parent coordinates change externally
  useEffect(() => {
    if (latitude && longitude && (latitude !== jobLatRef.current || longitude !== jobLngRef.current)) {
      jobLatRef.current = latitude;
      jobLngRef.current = longitude;
      setJobLatitude(latitude);
      setJobLongitude(longitude);
      jobLocationMarker.current?.setLatLng([latitude, longitude]);
      map.current?.setView([latitude, longitude], map.current.getZoom());
    }
  }, [latitude, longitude]);

  // Monitor text fields to check if edits match up with the latest reverse-geocode autofill values
  useEffect(() => {
    const lastAutofill = lastAutofillRef.current;
    if (
      locationLine1 !== lastAutofill.locationLine1 ||
      city !== lastAutofill.city ||
      landmarkArea !== lastAutofill.landmarkArea
    ) {
      isUserTextSearchRef.current = true;
    }
  }, [locationLine1, city, landmarkArea]);

  // REVERSE GEOCODING: Coordinates -> Address Strings
  const updateLocationData = async (lat: number, lng: number) => {
    const requestId = ++latestRequestRef.current;
    isUserTextSearchRef.current = false; // Lower flag since mutation originated from map event

    jobLatRef.current = lat;
    jobLngRef.current = lng;
    lastMapUpdateAtRef.current = Date.now();

    setJobLatitude(lat);
    setJobLongitude(lng);
    onLocationChange(lat, lng);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);

    fetchTimeoutRef.current = setTimeout(async () => {
      setFetchingAddress(true);

      try {
        const address = await getAddressFromCoordinates(lat, lng);

        if (requestId !== latestRequestRef.current) {
          return; // Newer interaction took over
        }

        const nextLocationLine1 = address.locationLine1 || "";
        const nextCity = address.city || "";
        const nextLandmarkArea = address.landmarkArea || "";

        lastAutofillRef.current = {
          locationLine1: nextLocationLine1,
          city: nextCity,
          landmarkArea: nextLandmarkArea,
        };

        isUserTextSearchRef.current = false;

        setLocationName(address.fullAddress);
        onLocationLine1Change(nextLocationLine1);
        onCityChange(nextCity);
        onLandmarkAreaChange(nextLandmarkArea);
      } catch (err) {
        if (requestId === latestRequestRef.current) {
          setLocationName(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
      } finally {
        if (requestId === latestRequestRef.current) {
          setFetchingAddress(false);
        }
      }
    }, 300);
  };

  // FORWARD GEOCODING: Address Strings -> Coordinates
  const searchLocation = async () => {
    if (!locationLine1 && !city && !landmarkArea) return;

    try {
      const query = `${locationLine1} ${landmarkArea} ${city}`.trim();
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
          query
        )}&limit=1`
      );
      const data = await response.json();

      if (data?.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);

        isUserTextSearchRef.current = false;

        setLocationName(data[0].display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        jobLatRef.current = lat;
        jobLngRef.current = lng;
        setJobLatitude(lat);
        setJobLongitude(lng);
        onLocationChange(lat, lng);

        if (jobLocationMarker.current) {
          jobLocationMarker.current.setLatLng([lat, lng]);
        }
        map.current?.setView([lat, lng], 16);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Run the forward-geocode logic ONLY if input elements were modified directly by typing
  useEffect(() => {
    if (!locationLine1 && !city && !landmarkArea) return;
    if (!isUserTextSearchRef.current) return;

    const now = Date.now();
    if (now - lastMapUpdateAtRef.current < 1500) {
      return;
    }

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
      if (isUserTextSearchRef.current) {
        searchLocation();
      }
    }, 600);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [locationLine1, city, landmarkArea]);

  // INITIALIZE LEAFLET MAP
  useEffect(() => {
    if (!mapContainer.current) return;
    let handleResize: () => void;

    const loadLeaflet = async () => {
      try {
        if ((window as any).L) {
          initializeMap();
        } else {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);

          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = () => initializeMap();
          document.body.appendChild(script);
        }
      } catch (err) {
        setLocationError(t("jobs.mapInitFailed"));
      }
    };

    const initializeMap = () => {
      const L = (window as any).L;
      if (!L || !mapContainer.current || map.current) return;

      map.current = L.map(mapContainer.current, {
        zoomControl: true,
      }).setView([jobLatRef.current, jobLngRef.current], 15);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
      }).addTo(map.current);

      const redMarkerIcon = L.icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      jobLocationMarker.current = L.marker([jobLatRef.current, jobLngRef.current], {
        draggable: true,
        icon: redMarkerIcon,
      }).addTo(map.current);

      currentLocationMarker.current = L.circleMarker([jobLatRef.current, jobLngRef.current], {
        radius: 8,
        fillColor: "#2563eb",
        color: "#ffffff",
        weight: 3,
        fillOpacity: 1,
      }).addTo(map.current);

      jobLocationMarker.current.on("dragend", () => {
        const newLatLng = jobLocationMarker.current.getLatLng();
        updateLocationData(newLatLng.lat, newLatLng.lng);
      });

      map.current.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        jobLatRef.current = lat;
        jobLngRef.current = lng;

        if (jobLocationMarker.current) {
          jobLocationMarker.current.setLatLng([lat, lng]);
        }
        updateLocationData(lat, lng);
      });

      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            if (currentLocationMarker.current) {
              currentLocationMarker.current.setLatLng([lat, lng]);
            }
          },
          console.error,
          { enableHighAccuracy: false, timeout: 20000, maximumAge: 30000 }
        );
      }

      handleResize = () => {
        setTimeout(() => map.current?.invalidateSize(), 200);
      };

      window.addEventListener("resize", handleResize);
      setTimeout(() => map.current?.invalidateSize(), 500);
    };

    loadLeaflet();

    return () => {
      if (handleResize) window.removeEventListener("resize", handleResize);
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // MANUAL GPS TRIGGER
  const handleUseCurrentLocation = async () => {
    setLoading(true);
    try {
      const location = await getCurrentLocation();

      isUserTextSearchRef.current = false;
      updateLocationData(location.latitude, location.longitude);

      if (jobLocationMarker.current) {
        jobLocationMarker.current.setLatLng([location.latitude, location.longitude]);
      }
      if (currentLocationMarker.current) {
        currentLocationMarker.current.setLatLng([location.latitude, location.longitude]);
      }

      map.current?.setView([location.latitude, location.longitude], 16);
    } catch (err) {
      setLocationError(t("jobs.failedToGetLocation"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Standalone label element prevents phantom click propagation events */}
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {displayLabel}
      </span>

      {/* MAP CONTROLLER */}
      <div ref={mapContainer} className="h-72 w-full rounded-lg border" />

      {/* RENDERED ADDRESS DETAILS */}
      <div className="rounded-lg bg-slate-50 p-3">
        <div className="break-words text-sm font-semibold">📍 {locationName}</div>
        {fetchingAddress && (
          <div className="mt-1 text-xs text-slate-500">
            {t("jobs.resolvingAddress")}
          </div>
        )}
        <div className="mt-1 text-xs text-slate-500">
          {jobLatitude.toFixed(6)}, {jobLongitude.toFixed(6)}
        </div>
      </div>

      {/* GEOLOCATION TRIGGER */}
      <Button
        type="button"
        variant="outline"
        fullWidth
        loading={loading}
        onClick={handleUseCurrentLocation}
      >
        📍 {t("jobs.useCurrentLocation")}
      </Button>

      {/* ERROR HANDLERS */}
      {(error || locationError) && (
        <p className="text-xs text-red-600">{error || locationError}</p>
      )}
    </div>
  );
};