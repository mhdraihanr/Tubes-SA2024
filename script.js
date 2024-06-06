// Struktur graf jalur kereta antar kota dengan informasi tambahan
const graph = {
    'Jakarta': {
        'Bandung': {distance: 3, time: '3 jam', price: 'Rp150.000'},
        'Semarang': {distance: 6, time: '6 jam', price: 'Rp300.000'}
    },
    'Bandung': {
        'Jakarta': {distance: 3, time: '3 jam', price: 'Rp150.000'},
        'Yogyakarta': {distance: 5, time: '5 jam', price: 'Rp250.000'}
    },
    'Semarang': {
        'Jakarta': {distance: 6, time: '6 jam', price: 'Rp300.000'},
        'Surabaya': {distance: 4, time: '4 jam', price: 'Rp200.000'}
    },
    'Yogyakarta': {
        'Bandung': {distance: 5, time: '5 jam', price: 'Rp250.000'},
        'Surabaya': {distance: 2, time: '2 jam', price: 'Rp100.000'}
    },
    'Surabaya': {
        'Semarang': {distance: 4, time: '4 jam', price: 'Rp200.000'},
        'Yogyakarta': {distance: 2, time: '2 jam', price: 'Rp100.000'}
    }
};

// Algoritma Dijkstra
function dijkstra(graph, start, end) {
    let distances = {};
    let prev = {};
    let pq = new PriorityQueue();
    let routeInfo = {};

    // Inisialisasi
    for (let vertex in graph) {
        distances[vertex] = Infinity;
        prev[vertex] = null;
    }
    distances[start] = 0;
    pq.enqueue(start, 0);

    while (!pq.isEmpty()) {
        let {element: u} = pq.dequeue();

        for (let neighbor in graph[u]) {
            let alt = distances[u] + graph[u][neighbor].distance;
            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                prev[neighbor] = u;
                routeInfo[neighbor] = {
                    from: u,
                    distance: graph[u][neighbor].distance,
                    time: graph[u][neighbor].time,
                    price: graph[u][neighbor].price
                };
                pq.enqueue(neighbor, alt);
            }
        }
    }

    // Rekonstruksi jalur terpendek
    let path = [];
    for (let at = end; at != null; at = prev[at]) {
        path.push(at);
    }
    path.reverse();

    return {distance: distances[end], path, routeInfo};
}

// Priority Queue untuk algoritma Dijkstra
class PriorityQueue {
    constructor() {
        this.items = [];
    }

    enqueue(element, priority) {
        let newItem = {element, priority};
        let added = false;

        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].priority > newItem.priority) {
                this.items.splice(i, 0, newItem);
                added = true;
                break;
            }
        }

        if (!added) {
            this.items.push(newItem);
        }
    }

    dequeue() {
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }
}

// Event listener untuk form
document.getElementById('form').addEventListener('submit', function(event) {
    event.preventDefault();

    let start = document.getElementById('start').value;
    let end = document.getElementById('end').value;

    if (graph[start] && graph[end]) {
        let result = dijkstra(graph, start, end);
        document.getElementById('result').innerHTML = `Jarak Terpendek: ${result.distance} km<br> Jalur: ${result.path.join(' -> ')}`;
        
        let routeInfoDiv = document.getElementById('route-info');
        routeInfoDiv.innerHTML = '<h2>Informasi Jalur</h2>';
        for (let i = 1; i < result.path.length; i++) {
            let from = result.path[i-1];
            let to = result.path[i];
            let info = result.routeInfo[to];
            routeInfoDiv.innerHTML += `<p>Dari: ${from} ke ${to} <br> Jarak: ${info.distance} km <br> Waktu: ${info.time} <br> Harga: ${info.price}</p>`;
        }

        // Menampilkan jalur pada peta
        drawPathOnMap(result.path);
    } else {
        document.getElementById('result').innerHTML = 'Kota tidak ditemukan!';
        document.getElementById('route-info').innerHTML = '';
    }
});

// Peta menggunakan Leaflet.js
var map = L.map('map').setView([-6.200000, 106.816666], 5);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Menandai kota-kota pada peta
const locations = {
    'Jakarta': [-6.200000, 106.816666],
    'Bandung': [-6.914744, 107.609810],
    'Semarang': [-6.966667, 110.416664],
    'Yogyakarta': [-7.797068, 110.370529],
    'Surabaya': [-7.250445, 112.768845]
};

for (let city in locations) {
    L.marker(locations[city]).addTo(map).bindPopup(city).openPopup();
}

// Fungsi untuk menggambar jalur pada peta
function drawPathOnMap(path) {
    // Hapus semua layer jalur yang ada
    map.eachLayer(function (layer) {
        if (layer instanceof L.Polyline) {
            map.removeLayer(layer);
        }
    });

    // Tambahkan layer jalur baru
    for (let i = 1; i < path.length; i++) {
        let from = locations[path[i-1]];
        let to = locations[path[i]];
        let latlngs = [from, to];
        L.polyline(latlngs, {color: 'blue'}).addTo(map);
    }

    // Zoom ke jalur
    let bounds = new L.LatLngBounds(latlngs);
    map.fitBounds(bounds);
}
