//mapbox API_KEY
const API_KEY = "pk.eyJ1IjoibGtzaW4iLCJhIjoiY2xqaXBrNnA0MDJjbjNydXF1d2hhZGU3YiJ9.U9fxtfEaVE-Ik1V7WJBPkA"; 

// Earthquakes & Tectonic Plates GeoJSON URL
var eqlink = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var platesLink = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Layers
var earthquakes = new L.LayerGroup;
var bkline = new L.LayerGroup;

// maps
var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
});

var light = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",{
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/light-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
})

var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",{
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/outdoors-v12',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: API_KEY
})
//themes
var dark1= L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    maxZoom: 19
}); 

var dark2 = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "dark-v11",
    accessToken: API_KEY
});

// map&theme
var mapthemes = {
    "卫星图像-mapbox": satelliteMap,
    "Light-mapbox": light, 
    "Outdoors-mapbox": outdoors,
    "Dark-CartoDB": dark1,
    "Dark-mapbox": dark2,
};

// bkline
var line = {
    "板块边界": bkline
};

// map
var myMap = L.map("map", {
    center: [37.00, 121.00],
    layers: [outdoors, earthquakes],
    zoom: 3
});

//L.control.layers(mapthemes, line).addTo(myMap);

d3.json(eqlink, function(earthquakeData) {
    // color
    function chooseColor(magnitude) {
        switch (true) {
        case magnitude > 7:
            return "#673AB7CC";
        case magnitude > 6:
            return "#F44336CC";
        case magnitude > 5:
            return "#FF9800CC";
        case magnitude > 4:
            return "#FFC107CC";
        case magnitude > 3:
            return "#FFEB3BCC";
        case magnitude > 2:
            return "#4CAF50CC";
        case magnitude > 1:
            return "#DAF7A6CC";
        default:
            return "#9E9E9ECC";
        }
    }
    // bold & bug fix
    function bold(magnitude) {
        if (magnitude === 0) { 
          return 1;
        }
        return magnitude * 3.9;
    }

    // bold again
    function st(feature) {
        return {
          opacity: 1,
          fillOpacity: 1,
          fillColor: chooseColor(feature.properties.mag),
          color: "#000000",
          radius: bold(feature.properties.mag),
          stroke: true,
          weight: 0.5
        };
    }
    L.control.layers(mapthemes, line).addTo(myMap);
    //circleMarker&popup
    L.geoJSON(earthquakeData, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);   
        },
        style: st,
        // Details
        onEachFeature: function(feature, layer) {
            //layer.unquieID = Math.random();
            layer.bindPopup("<h3>位置: " + feature.properties.place + 
            "</h3><hr><p>日期 " + new Date(feature.properties.time) + 
            "</p><hr><p>震级: " + feature.properties.mag + "</p>"+
            "<p>深度: " + feature.geometry.coordinates[2] + "</p>"+
            "<p>经度: " + feature.geometry.coordinates[0] + "</p>"+
            "<p>纬度: " + feature.geometry.coordinates[1] + "</p>"+
            "<a href=\""+feature.properties.url+"\">详情</a>");
        }
    }).addTo(earthquakes);
    earthquakes.addTo(myMap);
    // bkline
    d3.json(platesLink, function(platesData) {
        L.geoJson(platesData, {
            color: "#FF5722",
            weight: 1.2
        }).addTo(bkline);
        // bkline
        bkline.addTo(myMap);
    });

    /*earthquakes.onAdd(myMap, function() {
        myMap.on("featureAdded", function(e) {
            if (e.layer.uniqueId) {
                bkline.addLayer(e.layer);
            }
        });
    });*/

    // layer control 
       var legend = L.control({ position: "bottomright" });
       legend.onAdd = function() {
           var div = L.DomUtil.create("div", "info legend"), 
           magnitudeLevels = [0, 1, 2, 3, 4, 5, 6, 7];
   
           div.innerHTML += "<h3>Magnitude</h3>"
   
           for (var i = 0; i < magnitudeLevels.length; i++) {
               div.innerHTML +=
                   '<i style="background: ' + chooseColor(magnitudeLevels[i] + 1) + '"></i> ' +
                   magnitudeLevels[i] + (magnitudeLevels[i + 1] ? '&ndash;' + magnitudeLevels[i + 1] + '<br>' : '+');
           }
           return div;
       };
       legend.addTo(myMap);
});

fetch(eqlink)
.then(response => response.json())
.then(data => {
    const earthquakes = data.features.slice(0, 5);
    let html = '<div id="earthquakeInfo">';

    earthquakes.forEach((earthquake, index) => {
        const place = earthquake.properties.place;
        const time = new Date(earthquake.properties.time).toLocaleString();
        const mag = earthquake.properties.mag;
        const coordinates = earthquake.geometry.coordinates;

        html += `
            <mdui-card id="card${index}" style="width: 100%">
                <div clickable class="mdui-card-content">
                    <p style="font-size: 10px">
                        Place: ${place}<br>
                        Time: ${time}<br>
                        Magnitude: ${mag}<br>
                        Coordinates: Longitude: ${coordinates[0]}, Latitude: ${coordinates[1]}<br>
                    </p>
                </div>
            </mdui-card>
        `;

        const earthquakesb = data.features;
        const earthquakeCount = earthquakesb.length;
        const html2 = `<p>Weekly Total Earthquakes: ${earthquakeCount}</p>`;

        document.getElementById('earthquakeCount').innerHTML = html2;

    });
    document.getElementById('earthquakeInfo').innerHTML = html;


    earthquakes.forEach((earthquake, index) => {
        const coordinates = earthquake.geometry.coordinates;
        const cardId = `card${index}`;


        (function (coords) {
            document.getElementById(cardId).addEventListener('click', function() {
                // setview
                myMap.setView([coords[1], coords[0]], 13);
            });
        })(coordinates);
    });
})
.catch(error => console.error('Error fetching earthquake data:', error));