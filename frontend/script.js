let trafficData = [
  { road: "A", vehicles: 30 },
  { road: "B", vehicles: 60 },
  { road: "C", vehicles: 10 }
];

let autoRefresh = false;
let intervalId = null;

// Parking system data
let parkingData = {
  zones: [
    { id: "P1", name: "Zone A", totalSpots: 30, availableSpots: 15, rate: "$2/hour" },
    { id: "P2", name: "Zone B", totalSpots: 40, availableSpots: 25, rate: "$3/hour" },
    { id: "P3", name: "Zone C", totalSpots: 20, availableSpots: 5, rate: "$4/hour" },
    { id: "P4", name: "Zone D", totalSpots: 25, availableSpots: 20, rate: "$2.50/hour" }
  ],
  totalSpots: 115,
  availableSpots: 65
};

function calculateTrafficStats() {
  const totalVehicles = trafficData.reduce((sum, road) => sum + road.vehicles, 0);
  const avgWaitTime = Math.round((totalVehicles / 3) * 0.5);
  const peakTraffic = Math.max(...trafficData.map(road => road.vehicles));
  const flowRate = Math.round(totalVehicles / 5);

  document.getElementById("avg-wait-time").textContent = `${avgWaitTime} min`;
  document.getElementById("peak-traffic").textContent = `${peakTraffic} vehicles`;
  document.getElementById("flow-rate").textContent = `${flowRate} vehicles/min`;
}

function updateTrafficAlerts() {
  const alertsContainer = document.getElementById("alerts-container");
  alertsContainer.innerHTML = "";

  trafficData.forEach(road => {
    if (road.vehicles > 70) {
      addAlert(`High traffic on Road ${road.road}`, "warning");
    }
  });

  const totalVehicles = trafficData.reduce((sum, road) => sum + road.vehicles, 0);
  if (totalVehicles > 150) {
    addAlert("Heavy traffic across all roads", "error");
  } else if (totalVehicles < 30) {
    addAlert("Light traffic conditions", "success");
  }
}

function addAlert(message, type) {
  const alertsContainer = document.getElementById("alerts-container");
  const alert = document.createElement("div");
  
  const bgColor = type === "error" ? "bg-red-100 dark:bg-red-900" :
                 type === "warning" ? "bg-yellow-100 dark:bg-yellow-900" :
                 "bg-green-100 dark:bg-green-900";
  
  const textColor = type === "error" ? "text-red-800 dark:text-red-200" :
                   type === "warning" ? "text-yellow-800 dark:text-yellow-200" :
                   "text-green-800 dark:text-green-200";

  alert.className = `p-3 rounded-lg ${bgColor} ${textColor} text-sm`;
  alert.textContent = message;
  alertsContainer.appendChild(alert);
}

function assignGreenTimes() {
  const totalVehicles = trafficData.reduce((sum, road) => sum + road.vehicles, 0);
  trafficData.forEach(road => {
    road.green_time = totalVehicles ? Math.round((road.vehicles / totalVehicles) * 120) : 0;
  });
  document.getElementById("total-count").textContent = totalVehicles;
}

function updateParkingStats() {
  // Update total and available spots
  document.getElementById("total-spots").textContent = parkingData.totalSpots;
  document.getElementById("available-spots").textContent = parkingData.availableSpots;
  
  // Calculate and update occupancy rate
  const occupancyRate = ((parkingData.totalSpots - parkingData.availableSpots) / parkingData.totalSpots * 100).toFixed(1);
  document.getElementById("occupancy-rate").textContent = `${occupancyRate}%`;

  // Update parking zones display
  const zonesContainer = document.getElementById("parking-zones");
  zonesContainer.innerHTML = "";

  parkingData.zones.forEach(zone => {
    const occupancy = ((zone.totalSpots - zone.availableSpots) / zone.totalSpots * 100).toFixed(1);
    const statusColor = occupancy > 80 ? "text-red-600 dark:text-red-400" :
                       occupancy > 50 ? "text-orange-600 dark:text-orange-400" :
                       "text-green-600 dark:text-green-400";

    const zoneCard = document.createElement("div");
    zoneCard.className = "bg-white dark:bg-dark-card p-4 rounded-lg shadow-md";
    zoneCard.innerHTML = `
      <div class="flex justify-between items-center mb-2">
        <h4 class="font-semibold">${zone.name}</h4>
        <span class="text-sm ${statusColor}">${occupancy}% Full</span>
      </div>
      <div class="flex justify-between text-sm text-gray-600 dark:text-gray-300">
        <span>Available: ${zone.availableSpots}/${zone.totalSpots}</span>
        <span>Rate: ${zone.rate}</span>
      </div>
      <div class="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
        <div class="h-full rounded-full ${occupancy > 80 ? 'bg-red-500' : occupancy > 50 ? 'bg-orange-500' : 'bg-green-500'}"
             style="width: ${occupancy}%"></div>
      </div>
    `;
    zonesContainer.appendChild(zoneCard);
  });

  // Update parking guidance
  updateParkingGuidance();
}

function updateParkingGuidance() {
  const guidanceContainer = document.getElementById("parking-guidance");
  guidanceContainer.innerHTML = "";

  // Find the zone with the most available spots
  const bestZone = parkingData.zones.reduce((a, b) => 
    (b.availableSpots / b.totalSpots) > (a.availableSpots / a.totalSpots) ? b : a
  );

  // Add guidance messages
  if (bestZone.availableSpots > 0) {
    addGuidanceMessage(`Best parking option: ${bestZone.name} (${bestZone.availableSpots} spots available)`, "success");
  }

  // Check for zones that are almost full
  parkingData.zones.forEach(zone => {
    const occupancy = (zone.totalSpots - zone.availableSpots) / zone.totalSpots;
    if (occupancy > 0.9) {
      addGuidanceMessage(`${zone.name} is almost full (${zone.availableSpots} spots left)`, "warning");
    }
  });

  // Check overall parking availability
  const totalOccupancy = (parkingData.totalSpots - parkingData.availableSpots) / parkingData.totalSpots;
  if (totalOccupancy > 0.8) {
    addGuidanceMessage("Overall parking is limited. Consider alternative transportation.", "warning");
  }
}

function addGuidanceMessage(message, type) {
  const guidanceContainer = document.getElementById("parking-guidance");
  const messageDiv = document.createElement("div");
  
  const bgColor = type === "warning" ? "bg-yellow-100 dark:bg-yellow-900" : "bg-green-100 dark:bg-green-900";
  const textColor = type === "warning" ? "text-yellow-800 dark:text-yellow-200" : "text-green-800 dark:text-green-200";

  messageDiv.className = `p-3 rounded-lg ${bgColor} ${textColor} text-sm`;
  messageDiv.textContent = message;
  guidanceContainer.appendChild(messageDiv);
}

function simulateParkingChanges() {
  // Randomly change parking availability
  parkingData.zones.forEach(zone => {
    const change = Math.random() > 0.5 ? 1 : -1;
    const newSpots = Math.max(0, Math.min(zone.totalSpots, zone.availableSpots + change));
    zone.availableSpots = newSpots;
  });

  // Update total available spots
  parkingData.availableSpots = parkingData.zones.reduce((sum, zone) => sum + zone.availableSpots, 0);
  
  updateParkingStats();
}

function updateUI() {
  assignGreenTimes();
  const container = document.getElementById("traffic-container");
  container.innerHTML = "";

  const maxRoad = trafficData.reduce((a, b) => a.vehicles > b.vehicles ? a : b);

  trafficData.forEach(road => {
    const lightColor = road.road === maxRoad.road ? "green" : "red";
    const barWidth = Math.min(road.green_time * 2, 240);

    const card = document.createElement("div");
    card.className = `bg-white dark:bg-dark-card p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-lg ${
      road.road === maxRoad.road ? "ring-2 ring-green-500 dark:ring-green-400" : ""
    }`;

    card.innerHTML = `
      <h2 class="text-xl font-bold mb-3 text-gray-800 dark:text-white">🛣️ Road ${road.road}</h2>
      <p class="mb-2 text-gray-600 dark:text-gray-300">🚗 Vehicles: <span id="vehicle-count-${road.road}" class="font-semibold">${road.vehicles}</span></p>
      <input type="range" min="0" max="100" value="${road.vehicles}"
        oninput="updateVehicle('${road.road}', this.value)" class="w-full mb-3">
      <p class="mb-2 text-gray-600 dark:text-gray-300">🟢 Green Time: <span class="font-semibold">${road.green_time} seconds</span></p>
      <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded-full mb-3">
        <div class="h-full bg-green-500 dark:bg-green-400 rounded-full transition-all duration-300" style="width: ${barWidth}px;"></div>
      </div>
      <div class="flex items-center justify-between">
        <div class="w-5 h-5 rounded-full ${lightColor === 'green' ? 'bg-green-600 dark:bg-green-400' : 'bg-red-600 dark:bg-red-400'}"></div>
        <span class="text-sm text-gray-500 dark:text-gray-400">${lightColor === 'green' ? 'Active' : 'Waiting'}</span>
      </div>
    `;

    container.appendChild(card);
  });

  calculateTrafficStats();
  updateTrafficAlerts();
  updateParkingStats();
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

document.getElementById("auto-refresh-toggle").addEventListener("click", () => {
  autoRefresh = !autoRefresh;
  const btn = document.getElementById("auto-refresh-toggle");
  btn.textContent = autoRefresh ? "⏸️ Auto-Refresh: On" : "▶️ Auto-Refresh: Off";

  if (autoRefresh) {
    intervalId = setInterval(() => {
      trafficData.forEach(road => {
        road.vehicles = Math.floor(Math.random() * 100);
      });
      simulateParkingChanges();
      updateUI();
    }, 3000);
  } else {
    clearInterval(intervalId);
  }
});

document.getElementById("dark-mode-toggle").addEventListener("click", () => {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
});

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'true' || 
    (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
}

// Initial render
updateUI();