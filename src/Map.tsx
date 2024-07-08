import React, {useCallback, useEffect, useState} from "react";
import { GoogleMap, useLoadScript, Marker, MarkerClusterer } from "@react-google-maps/api"
import "firebase/firestore"
import firebase from "firebase/compat/app"

const mapContainerStyle = {
    width: "100vw",
    height: "100vh"
}
const center = {
    lat: 48.8584,
    lng: 2.2945
}

interface MarkerData {
    lat: number
    lng: number
    time: Date
}

const Map: React.FC = () => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: "AIzaSyB6G2zZnAoeL-DOW4WcVIyslHWi2iYzjfY"
    })

    const [markers, setMarkers] = useState<MarkerData[]>([]);

    const loadMarkers = async () => {
        const querySnapshot = await firebase.firestore().collection("quests").get()
        const loadedMarkers: MarkerData[] = []
        querySnapshot.forEach((doc) => {
            const marker = doc.data() as MarkerData
            loadedMarkers.push(marker)
        });
        setMarkers(loadedMarkers)
        console.log(markers)
    };

    const onMapClick = useCallback((event: google.maps.MapMouseEvent) => {
        if (!event.latLng) return
        const newMarker: MarkerData = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
            time: new Date()
        }
        saveMarker(newMarker)
        setMarkers((current) => [...current, newMarker])
    }, [])

    const saveMarker = async (marker: MarkerData) => {
        try {
            await firebase.firestore().collection("quests").add(marker);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    useEffect(() => {
        loadMarkers()
    }, [])

    if (loadError) return <div>Error loading maps</div>;
    if (!isLoaded) return <div>Loading Maps</div>;

    console.log(markers)

    return (
        <div>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={8}
                center={center}
                onClick={onMapClick}
            >
                <MarkerClusterer options={{ imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m' }}>
                    {(clusterer) => (
                        <>
                            {markers.map((marker, index) => (
                                <Marker
                                    key={index}
                                    position={{lat: marker.lat, lng: marker.lng}}
                                    label={(index + 1).toString()}
                                    // clusterer={clusterer}
                                />
                            ))}
                        </>
                    )}
                </MarkerClusterer>
            </GoogleMap>
        </div>
    )
}

export default Map
