// Set the API key for Maptiler SDK
maptilersdk.config.apiKey = mapTilerKey;

console.log('MapTiler API Key:', maptilerApiKey);
console.log('Campgrounds data:', campgrounds);

try {
    // Create a new map instance
    const map = new maptilersdk.Map({
        container: 'cluster-map',
        style: maptilersdk.MapStyle.STREETS,
        center: [-103.5917, 40.6699],
        zoom: 3
    });

    console.log('Map instance created successfully');

    // When the map is loaded, add data and interactivity
    map.on('load', function () {
        console.log('Map loaded');
        // Add a new source from our GeoJSON data and
        // set the 'cluster' option to true. GL-JS will
        // add the point_count property to your source data.
        map.addSource('campgrounds', {
            type: 'geojson',
            data: campgrounds,
            cluster: true,
            clusterMaxZoom: 14, // Max zoom to cluster points on
            clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
        });

        // Add a layer for clustered points
        map.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'campgrounds',
            filter: ['has', 'point_count'],
            paint: {
                // Color circles by amount of points
                'circle-color': [
                    'step',
                    ['get', 'point_count'],
                    '#00BCD4', // Color for clusters with < 10 points
                    10,
                    '#2196F3', // Color for clusters with 10-29 points
                    30,
                    '#3F51B5' // Color for clusters with >= 30 points
                ],
                // Size circles by amount of points
                'circle-radius': [
                    'step',
                    ['get', 'point_count'],
                    15, // Size for clusters with < 10 points
                    10,
                    20, // Size for clusters with 10-29 points
                    30,
                    25 // Size for clusters with >= 30 points
                ]
            }
        });

        // Add a layer for the cluster count labels
        map.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'campgrounds',
            filter: ['has', 'point_count'],
            layout: {
                'text-field': '{point_count_abbreviated}',
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12
            }
        });

        // Add a layer for unclustered points
        map.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'campgrounds',
            filter: ['!', ['has', 'point_count']],
            paint: {
                'circle-color': '#11b4da',
                'circle-radius': 4,
                'circle-stroke-width': 1,
                'circle-stroke-color': '#fff'
            }
        });

        // Handle click events on clusters
        map.on('click', 'clusters', async (e) => {
            const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
            const clusterId = features[0].properties.cluster_id;
            const zoom = await map.getSource('campgrounds').getClusterExpansionZoom(clusterId);

            // Zoom in to the clicked cluster
            map.easeTo({
                center: features[0].geometry.coordinates,
                zoom
            });
        });

        // Handle click events on unclustered points
        map.on('click', 'unclustered-point', function (e) {
            const { popUpMarkup } = e.features[0].properties;
            const coordinates = e.features[0].geometry.coordinates.slice();

            // Ensure correct popup positioning when zoomed out
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            // Create and display a popup for the clicked point
            new maptilersdk.Popup()
                .setLngLat(coordinates)
                .setHTML(popUpMarkup)
                .addTo(map);
        });

        // Change cursor to pointer when hovering over clusters
        map.on('mouseenter', 'clusters', () => {
            map.getCanvas().style.cursor = 'pointer';
        });

        // Change cursor back to default when not hovering over clusters
        map.on('mouseleave', 'clusters', () => {
            map.getCanvas().style.cursor = '';
        });
    });

    map.on('error', function (e) {
        console.error('Map error:', e);
    });
} catch (error) {
    console.error('Error creating map:', error);
}