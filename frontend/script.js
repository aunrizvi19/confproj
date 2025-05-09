const trafficData = [
  { road: "A", vehicles: 30 },
  { road: "B", vehicles: 60 },
  { road: "C", vehicles: 10 }
];

const totalVehicles = trafficData.reduce((sum, road) => sum + road.vehicles, 0);

trafficData.forEach(road => {
  road.green_time = Math.round((road.vehicles / totalVehicles) * 120);
});

const container = document.getElementById("traffic-container");

trafficData.forEach(road => {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <h3>Road ${road.road}</h3>
    <p>Vehicles: ${road.vehicles}</p>
    <p>Green Time: ${road.green_time} seconds</p>
    <div class="bar" style="width:${road.green_time}px; background-color:green;"></div>
  `;
  container.appendChild(card);
});
