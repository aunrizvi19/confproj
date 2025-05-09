let trafficData = [
  { road: "A", vehicles: 30 },
  { road: "B", vehicles: 60 },
  { road: "C", vehicles: 10 }
];

//Calculate Green Time 
function assignGreenTimes() {
  const totalVehicles = trafficData.reduce((sum, road) => sum + road.vehicles, 0);
  trafficData.forEach(road => {
    road.green_time = Math.round((road.vehicles / totalVehicles) * 120);
  });
}

function updateUI() {
  assignGreenTimes();
  const container = document.getElementById("traffic-container");
  container.innerHTML = "";

  const maxRoad = trafficData.reduce((a, b) => a.vehicles > b.vehicles ? a : b);

  trafficData.forEach(road => {
    const lightColor = road.road === maxRoad.road ? "green" : "red";
    const barWidth = Math.min(road.green_time * 2, 240); //Scale for Screen

    const card = document.createElement("div");
    card.className = "bg-white p-4 rounded shadow";

    card.innerHTML = `
      <h2 class="text-xl font-bold mb-2">Road ${road.road}</h2>
      <p class="mb-1">Vehicles: <span id="vehicle-count-${road.road}">${road.vehicles}</span></p>
      <input type="range" min="0" max="100" value="${road.vehicles}"
        oninput="updateVehicle('${road.road}', this.value)" class="w-full mb-2">
      <p class="mb-1">Green Time: ${road.green_time} seconds</p>
      <div class="h-4 bg-green-500 rounded mb-2" style="width: ${barWidth}px;"></div>
      <div class="w-5 h-5 rounded-full ${lightColor === 'green' ? 'bg-green-600' : 'bg-red-600'}"></div>
    `;

    container.appendChild(card);
  });
}

function updateVehicle(roadName, value) {
  const road = trafficData.find(r => r.road === roadName);
  road.vehicles = parseInt(value);
  document.getElementById(`vehicle-count-${roadName}`).textContent = value;
  updateUI();
}

document.getElementById("refresh-btn").addEventListener("click", () => {
  trafficData.forEach(road => {
    road.vehicles = Math.floor(Math.random() * 100);
  });
  updateUI();
});

// Initial render
updateUI();
