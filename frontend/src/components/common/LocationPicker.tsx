import { useEffect, useRef, useState } from "react";
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
  label = "Job Location",
}: LocationPickerProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);

  const map = useRef<any>(null);

  const currentLocationMarker = useRef<any>(null);

  const jobLocationMarker = useRef<any>(null);

  const watchIdRef = useRef<number | null>(null);

  const fetchTimeoutRef = useRef<any>(null);

  const searchTimeoutRef = useRef<any>(null);

  const lastMapUpdateAtRef = useRef(0);

  const lastAutofillRef = useRef({
    locationLine1: "",
    city: "",
    landmarkArea: "",
  });

  // LIVE JOB LOCATION REFS
  const jobLatRef = useRef(latitude || 20.5937);

  const jobLngRef = useRef(longitude || 78.9629);

  const [loading, setLoading] = useState(false);

  const [locationError, setLocationError] = useState<string>();

  const [jobLatitude, setJobLatitude] = useState(jobLatRef.current);

  const [jobLongitude, setJobLongitude] = useState(jobLngRef.current);

  const [locationName, setLocationName] = useState("Fetching location...");

  const [fetchingAddress, setFetchingAddress] = useState(false);

  // UPDATE LOCATION DATA
  const updateLocationData = async (lat: number, lng: number) => {
    jobLatRef.current = lat;
    jobLngRef.current = lng;

    lastMapUpdateAtRef.current = Date.now();

    setJobLatitude(lat);
    setJobLongitude(lng);

    onLocationChange(lat, lng);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    fetchTimeoutRef.current = setTimeout(async () => {
      setFetchingAddress(true);

      try {
        const address = await getAddressFromCoordinates(lat, lng);

        setLocationName(address.fullAddress);

        const nextLocationLine1 = address.locationLine1 || "";
        const nextCity = address.city || "";
        const nextLandmarkArea = address.landmarkArea || "";

        lastAutofillRef.current = {
          locationLine1: nextLocationLine1,
          city: nextCity,
          landmarkArea: nextLandmarkArea,
        };

        onLocationLine1Change(nextLocationLine1);
        onCityChange(nextCity);
        onLandmarkAreaChange(nextLandmarkArea);
      } catch (err) {
        setLocationName(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      } finally {
        setFetchingAddress(false);
      }
    }, 300);
  };

  // SEARCH LOCATION FROM CITY/LANDMARK
  const searchLocation = async () => {
    if (!locationLine1 && !city && !landmarkArea) return;

    try {
      const query = `${locationLine1} ${landmarkArea} ${city}`.trim();

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
          query,
        )}&limit=1`,
      );

      const data = await response.json();

      if (data?.length > 0) {
        const lat = parseFloat(data[0].lat);

        const lng = parseFloat(data[0].lon);

        setLocationName(
          data[0].display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        );

        jobLatRef.current = lat;
        jobLngRef.current = lng;

        setJobLatitude(lat);
        setJobLongitude(lng);

        onLocationChange(lat, lng);

        // MOVE MARKER
        if (jobLocationMarker.current) {
          jobLocationMarker.current.setLatLng([lat, lng]);
        }

        // MOVE MAP
        map.current?.setView([lat, lng], 16);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!locationLine1 && !city && !landmarkArea) return;

    const now = Date.now();
    const lastAutofill = lastAutofillRef.current;
    const isAutofillMatch =
      lastAutofill.locationLine1 === locationLine1 &&
      lastAutofill.city === city &&
      lastAutofill.landmarkArea === landmarkArea;

    if (isAutofillMatch && now - lastMapUpdateAtRef.current < 1500) {
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocation();
    }, 450);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [locationLine1, city, landmarkArea]);

  // INITIALIZE MAP
  useEffect(() => {
    if (!mapContainer.current) return;

    let handleResize: () => void;

    const loadLeaflet = async () => {
      try {
        if ((window as any).L) {
          initializeMap();
        } else {
          // CSS
          const link = document.createElement("link");

          link.rel = "stylesheet";

          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

          document.head.appendChild(link);

          // JS
          const script = document.createElement("script");

          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

          script.onload = () => {
            initializeMap();
          };

          document.body.appendChild(script);
        }
      } catch (err) {
        setLocationError("Map initialization failed");
      }
    };

    const initializeMap = () => {
      const L = (window as any).L;

      if (!L || !mapContainer.current || map.current) {
        return;
      }

      // CREATE MAP
      map.current = L.map(mapContainer.current, {
        zoomControl: true,
      }).setView([jobLatRef.current, jobLngRef.current], 15);

      // TILE
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
      }).addTo(map.current);

      // RED ICON
      const redMarkerIcon = L.icon({
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",

        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",

        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      // RED MARKER
      jobLocationMarker.current = L.marker(
        [jobLatRef.current, jobLngRef.current],
        {
          draggable: true,
          icon: redMarkerIcon,
        },
      ).addTo(map.current);

      // BLUE DOT
      currentLocationMarker.current = L.circleMarker(
        [jobLatRef.current, jobLngRef.current],
        {
          radius: 8,
          fillColor: "#2563eb",
          color: "#ffffff",
          weight: 3,
          fillOpacity: 1,
        },
      ).addTo(map.current);

      // DRAG END
      jobLocationMarker.current.on("dragend", () => {
        const newLatLng = jobLocationMarker.current.getLatLng();

        updateLocationData(newLatLng.lat, newLatLng.lng);
      });

      // MAP CLICK
      map.current.on("click", (e: any) => {
        const { lat, lng } = e.latlng;

        // IMPORTANT
        // DO NOT UPDATE STATE FIRST

        jobLatRef.current = lat;
        jobLngRef.current = lng;

        // MOVE MARKER FIRST
        if (jobLocationMarker.current) {
          jobLocationMarker.current.setLatLng([lat, lng]);
        }

        // THEN UPDATE STATE
        updateLocationData(lat, lng);
      });

      // LIVE GPS
      if (navigator.geolocation) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            const lat = position.coords.latitude;

            const lng = position.coords.longitude;

            // ONLY MOVE BLUE DOT
            if (currentLocationMarker.current) {
              currentLocationMarker.current.setLatLng([lat, lng]);
            }
          },
          console.error,
          {
            enableHighAccuracy: false,
            timeout: 20000,
            maximumAge: 30000,
          },
        );
      }

      // INITIAL DATA
      updateLocationData(jobLatRef.current, jobLngRef.current);

      // RESIZE FIX
      handleResize = () => {
        setTimeout(() => {
          map.current?.invalidateSize();
        }, 200);
      };

      window.addEventListener("resize", handleResize);

      setTimeout(() => {
        map.current?.invalidateSize();
      }, 500);
    };

    loadLeaflet();

    return () => {
      if (handleResize) {
        window.removeEventListener("resize", handleResize);
      }

      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  // USE CURRENT LOCATION
  const handleUseCurrentLocation = async () => {
    setLoading(true);

    try {
      const location = await getCurrentLocation();

      updateLocationData(location.latitude, location.longitude);

      // MOVE RED MARKER
      if (jobLocationMarker.current) {
        jobLocationMarker.current.setLatLng([
          location.latitude,
          location.longitude,
        ]);
      }

      // MOVE BLUE DOT
      if (currentLocationMarker.current) {
        currentLocationMarker.current.setLatLng([
          location.latitude,
          location.longitude,
        ]);
      }

      map.current?.setView([location.latitude, location.longitude], 16);
    } catch (err) {
      setLocationError("Failed to get location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          {label}
        </span>

        {/* MAP */}
        <div ref={mapContainer} className="h-72 w-full rounded-lg border" />

        {/* LOCATION */}
        <div className="rounded-lg bg-slate-50 p-3">
          <div className="break-words text-sm font-semibold">
            📍 {locationName}
          </div>

          <div className="mt-1 text-xs text-slate-500">
            {jobLatitude.toFixed(6)}, {jobLongitude.toFixed(6)}
          </div>
        </div>

        {/* BUTTON */}
        <Button
          type="button"
          variant="outline"
          fullWidth
          loading={loading}
          onClick={handleUseCurrentLocation}
        >
          📍 Use My Current Location
        </Button>

        {/* ERROR */}
        {(error || locationError) && (
          <p className="text-xs text-red-600">{error || locationError}</p>
        )}
      </label>
    </div>
  );
};
