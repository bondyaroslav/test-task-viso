import React, {useCallback, useEffect, useState} from "react"
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
    time: number
}

const Map: React.FC = () => {
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: "AIzaSyB6G2zZnAoeL-DOW4WcVIyslHWi2iYzjfY"
    })

    const [markers, setMarkers] = useState<MarkerData[]>([])

    const loadMarkers = async () => {
        const querySnapshot = await firebase.firestore().collection("quests").get()
        const loadedMarkers: MarkerData[] = []
        querySnapshot.forEach((doc) => {
            const marker = doc.data() as MarkerData
            loadedMarkers.push(marker)
        })
        setMarkers(loadedMarkers)
        console.log(markers)
    }

    const onMapClick = useCallback((event: google.maps.MapMouseEvent) => {
        if (!event.latLng) return
        const newMarker: MarkerData = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng(),
            time: new Date().getTime()
        }
        addMarker(newMarker)
        setMarkers((current) => [...current, newMarker])
    }, [])

    const addMarker = async (marker: MarkerData) => {
        try {
            await firebase.firestore().collection("quests").add(marker)
        } catch (e) {
            console.error("Error adding document: ", e)
        }
    }

    const deleteAllMarkers = async () => {
        try {
            const querySnapshot = await firebase.firestore().collection("quests").get()
            querySnapshot.forEach(async (doc) => {
                await firebase.firestore().collection("quests").doc(doc.id).delete()
            })
            setMarkers([])
        } catch (e) {
            console.error("Error deleting all documents: ", e)
        }
    }

    const handleMarkerDrag = async (index: number, newPosition: google.maps.LatLngLiteral | null) => {
        if (!newPosition) return
        const updatedMarkers = [...markers]
        updatedMarkers[index] = {
            ...updatedMarkers[index],
            lat: newPosition.lat,
            lng: newPosition.lng
        }
        setMarkers(updatedMarkers)

        try {
            await firebase.firestore().collection("quests").doc(updatedMarkers[index].time.toString()).update({
                lat: newPosition.lat,
                lng: newPosition.lng
            })
        } catch (e) {
            console.error("Error updating marker position: ", e)
        }
    }

    useEffect(() => {
        loadMarkers()
    }, [])

    if (loadError) return <div>Error loading maps</div>
    if (!isLoaded) return <div>Loading Maps</div>

    console.log(markers)

    return (
        <div>
            <button onClick={deleteAllMarkers}>delete all markers</button>
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
                                    draggable={true} // Дозволяємо перетягування маркерів
                                    onDragEnd={(e) => handleMarkerDrag(index, e.latLng ? e.latLng.toJSON() : null)}
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
