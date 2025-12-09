import { useRealtimeFleet } from "@/hooks/useRealtimeFleet";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import L from "leaflet";

// Fix for default marker icons
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -32],
});

const getMarkerColor = (status: string | null, delayMinutes: number | null) => {
  if (status === 'planned') return 'hsl(199, 89%, 48%)'; // info color
  if (!delayMinutes || delayMinutes <= 0) return 'hsl(142, 76%, 36%)'; // success color
  if (delayMinutes <= 15) return 'hsl(38, 92%, 50%)'; // warning color
  return 'hsl(0, 84%, 60%)'; // danger color
};

const getStatusLabel = (status: string | null, delayMinutes: number | null) => {
  if (status === 'planned') return 'Mission planifiée';
  if (!delayMinutes || delayMinutes <= 0) return 'À l\'heure';
  if (delayMinutes <= 15) return `Léger retard (${delayMinutes} min)`;
  return `Retard important (${delayMinutes} min)`;
};

const createColoredIcon = (color: string) => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
      <path fill="${color}" stroke="white" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `;
  
  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export const FleetMap = () => {
  const { fleetData, isLoading } = useRealtimeFleet();
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [isMapReady, setIsMapReady] = useState(false);

  // Callback ref to initialize map when DOM element is ready
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  
  const initializeMap = (element: HTMLDivElement | null) => {
    if (!element || mapRef.current) return;
    
    console.log('🗺️ DOM element mounted, initializing map...');
    mapContainerRef.current = element;

    try {
      // Create map with options - Vue sur la France entière
      const map = L.map(element, {
        center: [46.603354, 1.888334],
        zoom: 6,
        zoomControl: true,
        attributionControl: true
      });

      console.log('✅ Map instance created successfully');

      // Add tile layer
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        minZoom: 3
      });
      
      tileLayer.addTo(map);
      console.log('✅ Tile layer added successfully');

      mapRef.current = map;
      setIsMapReady(true);

      // Force resize after initialization
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
          console.log('✅ Map size invalidated and fully ready');
        }
      }, 100);
    } catch (error) {
      console.error('❌ Error initializing map:', error);
      setIsMapReady(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up map...');
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setIsMapReady(false);
    };
  }, []);

  // Update markers when fleet data changes (only after map is ready)
  useEffect(() => {
    // Guard: only update if map is ready and initialized
    if (!isMapReady || !mapRef.current || isLoading) {
      console.log('⏳ Skipping marker update - map ready:', isMapReady, 'loading:', isLoading);
      return;
    }

    console.log('📍 Updating markers with', fleetData.length, 'vehicles');

    // Double-check map still exists before manipulating markers
    const currentMap = mapRef.current;
    if (!currentMap) return;

    console.log('Updating markers...');

    // Remove old markers safely
    markersRef.current.forEach(marker => {
      try {
        marker.remove();
      } catch (e) {
        console.warn('Error removing marker:', e);
      }
    });
    markersRef.current = [];

    const vehiclesWithGPS = fleetData.filter(v => v.latitude && v.longitude);

    if (vehiclesWithGPS.length === 0) {
      console.log('No vehicles with GPS data');
      return;
    }

    // Add new markers with safety checks
    vehiclesWithGPS.forEach((vehicle) => {
      if (!vehicle.latitude || !vehicle.longitude) return;
      
      // Verify map still exists before adding each marker
      if (!mapRef.current) {
        console.warn('Map disappeared during marker creation');
        return;
      }

      try {
        const color = getMarkerColor(vehicle.mission_status, vehicle.delay_minutes);
        const icon = createColoredIcon(color);

        const marker = L.marker([vehicle.latitude, vehicle.longitude], { icon })
          .addTo(mapRef.current);

        // Create popup content
        const popupContent = `
          <div style="min-width: 200px;">
            <h3 style="font-weight: bold; font-size: 1rem; margin-bottom: 0.5rem;">${vehicle.plate_number}</h3>
            <div style="font-size: 0.875rem; display: flex; flex-direction: column; gap: 0.25rem;">
              <p><strong>Chauffeur:</strong> ${vehicle.driver_name || 'N/A'}</p>
              <p><strong>Type:</strong> ${vehicle.type}</p>
              ${vehicle.origin && vehicle.destination ? `
                <p style="font-size: 0.75rem;">
                  <strong>Trajet:</strong><br />
                  ${vehicle.origin} → ${vehicle.destination}
                </p>
              ` : ''}
              <p>
                <strong>Statut:</strong> 
                <span style="color: ${color};">
                  ${getStatusLabel(vehicle.mission_status, vehicle.delay_minutes)}
                </span>
              </p>
              ${vehicle.speed ? `<p><strong>Vitesse:</strong> ${vehicle.speed} km/h</p>` : ''}
              <p style="font-size: 0.75rem; opacity: 0.7; padding-top: 0.25rem;">
                GPS: ${vehicle.latitude.toFixed(4)}, ${vehicle.longitude.toFixed(4)}
              </p>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        markersRef.current.push(marker);
      } catch (e) {
        console.error('Error creating marker for vehicle:', vehicle.plate_number, e);
      }
    });

    console.log(`Successfully updated ${markersRef.current.length} markers`);
  }, [fleetData, isLoading, isMapReady]);

  if (isLoading) {
    return <Skeleton className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg" />;
  }

  const vehiclesWithGPS = fleetData.filter(v => v.latitude && v.longitude);

  return (
    <div className="w-full space-y-3 md:space-y-4">
      <Card className="p-3 md:p-6 bg-muted/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 md:mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            <p className="text-xs md:text-sm text-muted-foreground">
              Carte interactive - {vehiclesWithGPS.length} véhicules actifs avec GPS
            </p>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4 text-[10px] md:text-xs flex-wrap">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-success" />
              <span>À l'heure</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-warning" />
              <span>Léger retard</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-danger" />
              <span>Retard important</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-info" />
              <span>Planifié</span>
            </div>
          </div>
        </div>
        
          <div 
            key="fleet-map-container"
            ref={initializeMap}
          className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden border border-border"
          style={{ 
            zIndex: 0,
            position: 'relative'
          }}
        />
      </Card>
      
      {vehiclesWithGPS.length === 0 && (
        <div className="bg-warning/10 border border-warning rounded-lg p-3 md:p-4">
          <p className="text-xs md:text-sm text-foreground">
            ⚠️ Aucun véhicule avec position GPS disponible pour le moment.
          </p>
        </div>
      )}
    </div>
  );
};
