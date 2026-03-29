// ===== GLOBAL STATE =====
let chart = null;
let currentCoin = "bitcoin";
let currentInterval = 1;

// ===== COIN SWITCH (GLOBAL) =====
window.changeCoin = function (coin) {
  console.log("Switch coin:", coin);
  currentCoin = coin;
  loadAll();
};

// ===== INTERVAL SWITCH =====
window.changeInterval = function (mins) {
  console.log("Switch interval:", mins);
  currentInterval = mins;
  loadChart();
};

// ===== LOAD EVERYTHING =====
async function loadAll() {
  await Promise.all([
    loadStats(),
    loadChart()
  ]);
}

// ===== LOAD STATS (REAL DATA) =====
async function loadStats() {
  try {
    let res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${currentCoin}`
    );
    let data = await res.json();

    // Price
    document.getElementById("btc-price").innerText =
      "$" + data.market_data.current_price.usd.toLocaleString();

    // Market Cap
    document.getElementById("tnx").innerText =
      data.market_data.market_cap.usd.toLocaleString();

    // Volume
    document.getElementById("volume").innerText =
      data.market_data.total_volume.usd.toLocaleString();

    // Top coin display
    document.getElementById("btc").innerText =
      data.market_data.current_price.usd.toLocaleString();

  } catch (err) {
    console.error("Stats error:", err);
  }
}

// ===== LOAD CHART =====
async function loadChart() {
  try {
    let res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${currentCoin}/market_chart?vs_currency=usd&days=1`
    );
    let data = await res.json();

    let prices = data.prices.map(p => p[1]);
    let timestamps = data.prices.map(p =>
      new Date(p[0]).toLocaleTimeString()
    );

    // Slice data based on interval (smooth zoom effect)
    let sliceSize;
    if (currentInterval === 1) sliceSize = 60;
    else if (currentInterval === 5) sliceSize = 300;
    else sliceSize = 900;

    prices = prices.slice(-sliceSize);
    timestamps = timestamps.slice(-sliceSize);

    renderChart(timestamps, prices);
    generateAI(prices);

  } catch (err) {
    console.error("Chart error:", err);
  }
}

// ===== RENDER CHART =====
function renderChart(labels, dataPoints) {
  let ctx = document.getElementById("chart").getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: currentCoin.toUpperCase(),
        data: dataPoints,
        borderColor: "#22c55e",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.35
      }]
    },
    options: {
      responsive: true,
      animation: {
        duration: 400
      },
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          display: false
        },
        y: {
          ticks: {
            color: "#94a3b8"
          }
        }
      }
    }
  });
}

// ===== AI LOGIC =====
function generateAI(prices) {
  let first = prices[0];
  let last = prices[prices.length - 1];

  let change = ((last - first) / first) * 100;

  let prediction = "HOLD 🤝";
  if (change > 0.2) prediction = "UP 📈";
  if (change < -0.2) prediction = "DOWN 📉";

  let confidence = Math.min(Math.abs(change * 12), 95).toFixed(0);

  document.getElementById("prediction").innerText = prediction;
  document.getElementById("confidence").innerText =
    "Confidence: " + confidence + "%";

  // Dynamic sentiment
  let bull = change > 0 ? 65 + Math.random() * 20 : 30;
  let bear = 100 - bull;

  document.getElementById("bull").style.width = bull + "%";
  document.getElementById("bull").innerText = Math.round(bull) + "%";

  document.getElementById("bear").style.width = bear + "%";
  document.getElementById("bear").innerText = Math.round(bear) + "%";
}

// ===== AUTO REFRESH (SMOOTH) =====
function startAutoUpdate() {
  setInterval(() => {
    loadStats();   // faster updates
  }, 8000);

  setInterval(() => {
    loadChart();   // slower redraw (better performance)
  }, 15000);
}

// ===== INIT =====
function init() {
  console.log("🚀 Insight Engine Started");

  loadAll();
  startAutoUpdate();
}

init();
