//Inisialisasi graf berisi informasi kota
const graph = {
    'Jakarta': {
        'Bandung': {distance: 30, time: 1, price: 150000},
        'Semarang': {distance: 60, time: 3, price: 300000},
        'Surabaya': {distance: 90, time: 5, price: 450000},
        'Yogyakarta': {distance: 80, time: 4, price: 400000}
    },
    'Bandung': {
        'Jakarta': {distance: 30, time: 1, price: 150000},
        'Semarang': {distance: 50, time: 2.5, price: 250000},
        'Yogyakarta': {distance: 60, time: 3, price: 300000},
        'Surabaya': {distance: 100, time: 5.5, price: 500000}
    },
    'Semarang': {
        'Jakarta': {distance: 60, time: 3, price: 300000},
        'Bandung': {distance: 50, time: 2.5, price: 250000},
        'Surabaya': {distance: 40, time: 2, price: 200000},
        'Yogyakarta': {distance: 30, time: 1.5, price: 150000}
    },
    'Yogyakarta': {
        'Jakarta': {distance: 80, time: 4, price: 400000},
        'Bandung': {distance: 60, time: 3, price: 300000},
        'Semarang': {distance: 30, time: 1.5, price: 150000},
        'Surabaya': {distance: 20, time: 0.5, price: 100000},
        'Malang': {distance: 40, time: 2, price: 200000}
    },
    'Surabaya': {
        'Jakarta': {distance: 90, time: 5, price: 450000},
        'Bandung': {distance: 100, time: 5.5, price: 500000},
        'Semarang': {distance: 40, time: 2, price: 200000},
        'Yogyakarta': {distance: 20, time: 0.5, price: 100000},
        'Malang': {distance: 30, time: 1.5, price: 150000}
    },
    'Malang': {
        'Surabaya': {distance: 30, time: 1.5, price: 150000},
        'Yogyakarta': {distance: 40, time: 2, price: 200000}
    }
};

// Algoritma Dijkstra
function dijkstra(graph, start, end) {
    // Inisialisasi variabel untuk menyimpan jarak terpendek, node sebelumnya, priority queue, dan informasi rute
    let distances = {};
    let prev = {};
    let pq = new PriorityQueue();
    let routeInfo = {};

    // Inisialisasi jarak untuk setiap vertex dengan nilai Infinity, node sebelumnya dengan null
    for (let vertex in graph) {
        distances[vertex] = Infinity;
        prev[vertex] = null;
    }
    
    // Jarak dari start ke start adalah 0, enqueue start dengan priority 0
    distances[start] = 0;
    pq.enqueue(start, 0);

    // Proses utama algoritma Dijkstra
    while (!pq.isEmpty()) {
        // Ambil vertex dengan jarak terpendek dari priority queue
        let {element: u} = pq.dequeue();

        // Iterasi semua tetangga dari vertex u
        for (let neighbor in graph[u]) {
            // Hitung alternatif jarak ke tetangga
            let alt = distances[u] + graph[u][neighbor].distance;

            // Jika alternatif lebih pendek, update jarak, node sebelumnya, dan informasi rute
            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                prev[neighbor] = u;
                routeInfo[neighbor] = {
                    from: u,
                    distance: graph[u][neighbor].distance,
                    time: graph[u][neighbor].time,
                    price: graph[u][neighbor].price
                };
                // Enqueue tetangga dengan jarak baru sebagai priority
                pq.enqueue(neighbor, alt);
            }
        }
    }

    // Rekonstruksi jalur terpendek dari start ke end
    let path = [];
    let totalDistance = 0;
    let totalTime = 0;
    let totalPrice = 0;
    for (let at = end; at != null; at = prev[at]) {
        // Jika ada node sebelumnya, tambahkan detail jarak, waktu, dan harga
        if (prev[at] !== null) {
            totalDistance += graph[prev[at]][at].distance;
            totalTime += graph[prev[at]][at].time;
            totalPrice += graph[prev[at]][at].price;
        }
        path.push(at);
    }
    // Balikkan path karena kita memulai dari end ke start
    path.reverse();

    // Kembalikan hasil jarak, waktu, harga, path, dan informasi rute
    return {distance: totalDistance, time: totalTime, price: totalPrice, path, routeInfo};
}

// Algoritma Branch and Bound
function branchAndBound(graph, start, end) {
    // Inisialisasi queue, jalur terbaik, jarak terbaik, waktu terbaik, harga terbaik
    let queue = [];
    let bestPath = null;
    let bestDistance = Infinity;
    let bestTime = 0;
    let bestPrice = 0;

    // Enqueue dengan path awal yang hanya berisi start
    queue.push({path: [start], distance: 0, time: 0, price: 0});

    // Proses utama algoritma Branch and Bound
    while (queue.length > 0) {
        // Ambil node dari queue
        let node = queue.shift();
        let last = node.path[node.path.length - 1];

        // Jika sampai ke end, update jalur terbaik jika ditemukan jalur lebih pendek
        if (last === end) {
            if (node.distance < bestDistance) {
                bestDistance = node.distance;
                bestPath = node.path;
                bestTime = node.time;
                bestPrice = node.price;
            }
        } else {
            // Iterasi tetangga dari last
            for (let neighbor in graph[last]) {
                // Jika tetangga belum ada di path, tambahkan ke queue dengan detail baru
                if (!node.path.includes(neighbor)) {
                    let newPath = node.path.concat(neighbor);
                    let newDistance = node.distance + graph[last][neighbor].distance;
                    let newTime = node.time + graph[last][neighbor].time;
                    let newPrice = node.price + graph[last][neighbor].price;

                    // Jika jarak baru lebih pendek dari jarak terbaik, enqueue dengan detail baru
                    if (newDistance < bestDistance) {
                        queue.push({path: newPath, distance: newDistance, time: newTime, price: newPrice});
                    }
                }
            }
        }
    }

    // Buat objek routeInfo untuk menyimpan informasi rute terbaik
    let routeInfo = {};
    for (let i = 1; i < bestPath.length; i++) {
        let from = bestPath[i-1];
        let to = bestPath[i];
        routeInfo[to] = {
            from: from,
            distance: graph[from][to].distance,
            time: graph[from][to].time,
            price: graph[from][to].price
        };
    }

    // Kembalikan hasil jarak terbaik, waktu terbaik, harga terbaik, path terbaik, dan informasi rute terbaik
    return {distance: bestDistance, time: bestTime, price: bestPrice, path: bestPath, routeInfo};
}

// Priority Queue untuk algoritma Dijkstra
class PriorityQueue {
    constructor() {
        this.items = [];
    }

    // Enqueue element dengan priority tertentu
    enqueue(element, priority) {
        let newItem = {element, priority};
        let added = false;

        // Menyisipkan element sesuai dengan priority
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].priority > newItem.priority) {
                this.items.splice(i, 0, newItem);
                added = true;
                break;
            }
        }

        // Jika tidak ada priority yang lebih tinggi, push ke akhir
        if (!added) {
            this.items.push(newItem);
        }
    }

    // Dequeue element dengan priority tertinggi
    dequeue() {
        return this.items.shift();
    }

    // Cek apakah priority queue kosong
    isEmpty() {
        return this.items.length === 0;
    }
}

// Event listener untuk form
document.getElementById('form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Ambil nilai input dari form
    let start = document.getElementById('start').value;
    let end = document.getElementById('end').value;

    // Tentukan jenis algoritma berdasarkan tombol yang ditekan
    let buttonText = event.submitter.textContent;
    let startTime, endTime, result;

    // Validasi input dan jalankan algoritma yang dipilih
    if (graph[start] && graph[end]) {
        if (buttonText.includes('Dijkstra')) {
            startTime = performance.now();
            result = dijkstra(graph, start, end);
            endTime = performance.now();
        } else if (buttonText.includes('BnB')) {
            startTime = performance.now();
            result = branchAndBound(graph, start, end);
            endTime = performance.now();
        }

        // Hitung waktu eksekusi
        let runningTime = (endTime - startTime).toFixed(4);

        // Tampilkan hasil jarak, waktu, harga, path, dan waktu eksekusi di HTML
        document.getElementById('result').innerHTML = `
            Jarak Terpendek: ${result.distance} km<br> 
            Total Waktu: ${result.time} jam<br>
            Total Harga: Rp${result.price}<br>
            Jalur: ${result.path.join(' -> ')}<br>
            Waktu Eksekusi: ${runningTime} ms
        `;

        // Tampilkan informasi rute detail di HTML
        let routeInfoDiv = document.getElementById('route-info');
        routeInfoDiv.innerHTML = '<h2>Informasi Jalur</h2>';
        for (let i = 1; i < result.path.length; i++) {
            let from = result.path[i-1];
            let to = result.path[i];
            let info = result.routeInfo[to];
            routeInfoDiv.innerHTML += `<p>Dari: ${from} ke ${to} <br> Jarak: ${info.distance} km <br> Waktu: ${info.time} jam <br> Harga: Rp${info.price}</p>`;
        }

        // Gambar jalur pada peta
        drawPathOnMap(result.path);
    } else {
        // Tampilkan pesan jika kota tidak ditemukan
        document.getElementById('result').innerHTML = 'Kota tidak ditemukan!';
        document.getElementById('route-info').innerHTML = '';
    }
});

// Peta menggunakan Leaflet.js
var map = L.map('map').setView([-6.200000, 106.816666], 5);

// Tile layer menggunakan OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Menandai kota-kota pada peta
const locations = {
    'Jakarta': [-6.200000, 106.816666],
    'Bandung': [-6.914744, 107.609810],
    'Semarang': [-6.966667, 110.416664],
    'Yogyakarta': [-7.797068, 110.370529],
    'Surabaya': [-7.250445, 112.768845],
    'Malang': [-7.979740, 112.630416]
};

// Tambahkan marker untuk setiap kota pada peta
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

    // Tambahkan layer jalur baru berdasarkan path yang diberikan
    for (let i = 1; i < path.length; i++) {
        let from = locations[path[i - 1]];
        let to = locations[path[i]];
        let latlngs = [from, to];
        L.polyline(latlngs, { color: 'blue' }).addTo(map);
    }

    // Zoom ke jalur yang ditambahkan
    let bounds = new L.LatLngBounds(latlngs);
    map.fitBounds(bounds);
}

