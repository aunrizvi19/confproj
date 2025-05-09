let trafficData = [
  { road: "A", vehicles: 30 },
  { road: "B", vehicles: 60 },
  { road: "C", vehicles: 10 }
];

let autoRefresh = false;
let intervalId = null;
let trafficHistory = [];
let trafficChart = null;

// Initialize traffic history with some sample data
for (let i = 0; i < 24; i++) {
  trafficHistory.push({
    hour: i,
    vehicles: Math.floor(Math.random() * 100)
  });
}

function calculateTrafficStats() {
  const totalVehicles = trafficData.reduce((sum, road) => sum + road.vehicles, 0);
  const avgWaitTime = Math.round((totalVehicles / 3) * 0.5); // Simple calculation
  const peakTraffic = Math.max(...trafficHistory.map(h => h.vehicles));
  const flowRate = Math.round(totalVehicles / 5); // Simple calculation

  document.getElementById("avg-wait-time").textContent = `${avgWaitTime} min`;
  document.getElementById("peak-traffic").textContent = `${peakTraffic} vehicles`;
  document.getElementById("flow-rate").textContent = `${flowRate} vehicles/min`;
}

function updateTrafficAlerts() {
  const alertsContainer = document.getElementById("alerts-container");
  alertsContainer.innerHTML = "";

  // Check for high traffic conditions
  trafficData.forEach(road => {
    if (road.vehicles > 70) {
      addAlert(`High traffic on Road ${road.road}`, "warning");
    }
  });

  // Check for traffic flow issues
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

function updateTrafficChart() {
  const ctx = document.getElementById("traffic-trends-chart").getContext("2d");
  
  if (trafficChart) {
    trafficChart.destroy();
  }

  trafficChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: trafficHistory.map(h => `${h.hour}:00`),
      datasets: [{
        label: "Traffic Volume",
        data: trafficHistory.map(h => h.vehicles),
        borderColor: "#4CAF50",
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0, 0, 0, 0.1)"
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

function assignGreenTimes() {
  const totalVehicles = trafficData.reduce((sum, road) => sum + road.vehicles, 0);
  trafficData.forEach(road => {
    road.green_time = totalVehicles ? Math.round((road.vehicles / totalVehicles) * 120) : 0;
  });
  document.getElementById("total-count").textContent = totalVehicles;
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

  // Update additional information
  calculateTrafficStats();
  updateTrafficAlerts();
  updateTrafficChart();
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
  // Update traffic history
  const currentHour = new Date().getHours();
  trafficHistory[currentHour].vehicles = trafficData.reduce((sum, road) => sum + road.vehicles, 0);
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
      // Update traffic history
      const currentHour = new Date().getHours();
      trafficHistory[currentHour].vehicles = trafficData.reduce((sum, road) => sum + road.vehicles, 0);
      updateUI();
    }, 3000);
  } else {
    clearInterval(intervalId);
  }
});

document.getElementById("dark-mode-toggle").addEventListener("click", () => {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
  // Update chart colors for dark mode
  if (trafficChart) {
    trafficChart.options.scales.y.grid.color = document.documentElement.classList.contains('dark') 
      ? "rgba(255, 255, 255, 0.1)" 
      : "rgba(0, 0, 0, 0.1)";
    trafficChart.update();
  }
});

// Check for saved dark mode preference
if (localStorage.getItem('darkMode') === 'true' || 
    (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  document.documentElement.classList.add('dark');
}

// Initial render
updateUI();



  
