// Set the API key for Maptiler SDK
maptilersdk.config.apiKey = maptilerApiKey;

// Create a new map instance
const map = new maptilersdk.Map({
    container: 'map', // HTML element id where the map will be rendered
    style: maptilersdk.MapStyle.BRIGHT, // Map style
    center: campground.geometry.coordinates, // Center the map on the campground coordinates
    zoom: 10 // Initial zoom level
});

// Create a new marker for the campground
new maptilersdk.Marker()
    .setLngLat(campground.geometry.coordinates) // Set marker position
    .setPopup(
        new maptilersdk.Popup({ offset: 25 }) // Create a popup with an offset
            .setHTML(
                `<h3>${campground.title}</h3><p>${campground.location}</p>` // Popup content
            )
    )
    .addTo(map) // Add the marker to the map