// ===== GLOBAL STATE =====
let chart = null;
let socket = null;
let dataPoints = [];
let currentCoin = "bitcoin";
let currentSymbol = "btcusdt";

// ===== MAPS =====
const coinMap = {
  bitcoin: "btcusdt",
  ethereum: "ethusdt",
  solana: "solusdt"
};

const coinNames = {
  bitcoin: "BTC",
  ethereum: "ETH",
  solana: "SOL"
};

const coinColors = {
  bitcoin: "#f7931a",
  ethereum: "#627eea",
  solana: "#22c55e"
};

// ===== CHANGE COIN =====
window.changeCoin = function (coin) {
  console.log("Switching:", coin);

  currentCoin = coin;
  currentSymbol = coinMap[coin];
  dataPoints = [];

  // 🔥 Update title
  const title = document.querySelector(".left-panel h2");
  title.innerText = coinNames[coin];
  title.style.color = coinColors[coin];

  // 🔥 Active button highlight
  document.querySelectorAll(".coin-buttons button").forEach(btn => {
    btn.classList.remove("active");
  });

  event.target.classList.add("active");

  // 🔥 Restart socket
  if (socket) socket.close();

  startSocket();
};

// ===== START WEBSOCKET =====
function startSocket() {
  socket = new WebSocket(
    `wss://stream.binance.com:9443/ws/${currentSymbol}@trade`
  );

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const price = parseFloat(data.p);

    updateChart(price);
    updateStats(price);
  };

  socket.onerror = (err) => {
    console.error("Socket error:", err);
  };
}

// ===== UPDATE CHART =====
function updateChart(price) {
  if (dataPoints.length > 60) dataPoints.shift();
  dataPoints.push(price);

  if (!chart) {
    renderChart();
  } else {
    chart.data.labels.push("");
    chart.data.datasets[0].data.push(price);

    if (chart.data.labels.length > 60) {
      chart.data.labels.shift();
      chart.data.datasets[0].data.shift();
    }

    chart.update("none");
  }

  generateAI();
}

// ===== RENDER CHART =====
function renderChart() {
  const ctx = document.getElementById("chart").getContext("2d");

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: dataPoints.map(() => ""),
      datasets: [{
        data: dataPoints,
        borderColor: coinColors[currentCoin],
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.35,
        fill: false
      }]
    },
    options: {
      animation: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: {
          ticks: { color: "#94a3b8" }
        }
      }
    }
  });
}

// ===== UPDATE STATS =====
function updateStats(price) {
  document.getElementById("btc-price").innerText =
    "$" + price.toLocaleString();

  document.getElementById("btc").innerText =
    price.toLocaleString();

  // Simulated realistic variation
  document.getElementById("volume").innerText =
    (Math.random() * 10000000000).toFixed(0);

  document.getElementById("tnx").innerText =
    (Math.random() * 1000000).toFixed(0);
}

// ===== AI ENGINE =====
function generateAI() {
  if (dataPoints.length < 10) return;

  const first = dataPoints[0];
  const last = dataPoints[dataPoints.length - 1];

  const change = ((last - first) / first) * 100;

  let prediction = "HOLD 🤝";
  if (change > 0.15) prediction = "UP 📈";
  if (change < -0.15) prediction = "DOWN 📉";

  const confidence = Math.min(Math.abs(change * 15), 95).toFixed(0);

  document.getElementById("prediction").innerText = prediction;
  document.getElementById("confidence").innerText =
    "Confidence: " + confidence + "%";

  // Dynamic sentiment bar
  let bull = change > 0 ? 60 + Math.random() * 25 : 30;
  let bear = 100 - bull;

  document.getElementById("bull").style.width = bull + "%";
  document.getElementById("bull").innerText = Math.round(bull) + "%";

  document.getElementById("bear").style.width = bear + "%";
  document.getElementById("bear").innerText = Math.round(bear) + "%";
}

// ===== INIT =====
function init() {
  console.log("🚀 PRO DASHBOARD STARTED");

  startSocket();
}

init();
