import React, { useEffect, useRef, useState } from 'react'
import './MapComponent.css'

// We'll use Leaflet directly for better control
declare global {
  interface Window {
    L: any;
  }
}

interface MapComponentProps {
  onLocationSelect: (lat: number, lng: number) => void;
  selectedLocation?: { lat: number; lng: number } | null;
}

const MapComponent: React.FC<MapComponentProps> = ({ onLocationSelect, selectedLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [isMapReady, setIsMapReady] = useState(false)

  useEffect(() => {
    // Load Leaflet CSS and JS dynamically
    const loadLeaflet = async () => {
      // Load CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
        link.crossOrigin = ''
        document.head.appendChild(link)
      }

      // Load JavaScript
      if (!window.L) {
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo='
        script.crossOrigin = ''
        document.head.appendChild(script)
        
        script.onload = () => {
          setIsMapReady(true)
        }
      } else {
        setIsMapReady(true)
      }
    }

    loadLeaflet()
  }, [])

  useEffect(() => {
    if (!isMapReady || !mapRef.current || mapInstanceRef.current) return

    // Initialize map centered on Switzerland
    const map = window.L.map(mapRef.current).setView([46.8182, 8.2275], 8)

    // Add OpenStreetMap tiles
    window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map)

    // Add click handler
    map.on('click', (e: any) => {
      const { lat, lng } = e.latlng
      onLocationSelect(lat, lng)
      
      // Remove existing marker
      if (markerRef.current) {
        map.removeLayer(markerRef.current)
      }
      
      // Add new marker
      markerRef.current = window.L.marker([lat, lng]).addTo(map)
        .bindPopup(`Selected location:<br>Lat: ${lat.toFixed(4)}<br>Lng: ${lng.toFixed(4)}`)
        .openPopup()
    })

    // Add some popular Swiss location markers
    const popularLocations = [
      { name: 'Zermatt', lat: 46.0207, lng: 7.7491 },
      { name: 'Interlaken', lat: 46.6863, lng: 7.8632 },
      { name: 'Grindelwald', lat: 46.6246, lng: 8.0382 },
      { name: 'Lucerne', lat: 47.0502, lng: 8.3093 },
      { name: 'St. Moritz', lat: 46.4908, lng: 9.8355 },
      { name: 'Chamonix', lat: 45.9237, lng: 6.8694 }
    ]

    popularLocations.forEach(location => {
      window.L.marker([location.lat, location.lng])
        .addTo(map)
        .bindPopup(`<b>${location.name}</b><br>Popular hiking destination`)
    })

    mapInstanceRef.current = map

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [isMapReady, onLocationSelect])

  // Update marker when selectedLocation prop changes
  useEffect(() => {
    if (selectedLocation && mapInstanceRef.current && window.L) {
      // Remove existing marker
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current)
      }
      
      // Add new marker
      markerRef.current = window.L.marker([selectedLocation.lat, selectedLocation.lng])
        .addTo(mapInstanceRef.current)
        .bindPopup(`Selected location:<br>Lat: ${selectedLocation.lat.toFixed(4)}<br>Lng: ${selectedLocation.lng.toFixed(4)}`)
        .openPopup()
    }
  }, [selectedLocation])

  if (!isMapReady) {
    return (
      <div className="map-loading">
        <div className="loading-spinner"></div>
        <p>Loading interactive map...</p>
      </div>
    )
  }

  return (
    <div className="map-wrapper">
      <div 
        ref={mapRef} 
        className="leaflet-map"
        style={{ height: '400px', width: '100%', borderRadius: '12px' }}
      />
    </div>
  )
}

export default MapComponent