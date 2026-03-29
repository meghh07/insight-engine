let chart;
let currentCoin = "bitcoin";

// 🔁 COIN SWITCH
function changeCoin(coin) {
  currentCoin = coin;
  loadAll();
}

// 🔥 LOAD EVERYTHING TOGETHER
async function loadAll() {
  await loadStats();
  await loadChart();
}

// 📊 REAL DATA (NO FAKE)
async function loadStats() {
  let res = await fetch(`https://api.coingecko.com/api/v3/coins/${currentCoin}`);
  let data = await res.json();

  // Price
  document.getElementById("btc-price").innerText =
    "$" + data.market_data.current_price.usd;

  // Market cap
  document.getElementById("volume").innerText =
    data.market_data.total_volume.usd.toLocaleString();

  document.getElementById("tnx").innerText =
    data.market_data.market_cap.usd.toLocaleString();

  // Coins panel
  document.getElementById("btc").innerText =
    data.market_data.current_price.usd;

  document.getElementById("eth").innerText = "...";
  document.getElementById("sol").innerText = "...";
}

// 📈 CHART FIXED
async function loadChart() {
  let res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${currentCoin}/market_chart?vs_currency=usd&days=1`
  );

  let data = await res.json();

  let prices = data.prices.map(p => p[1]);
  let labels = data.prices.map(p =>
    new Date(p[0]).toLocaleTimeString()
  );

  let ctx = document.getElementById("chart").getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: currentCoin.toUpperCase(),
        data: prices,
        borderColor: "#22c55e",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.25
      }]
    },
    options: {
      responsive: true,
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

  generateAI(prices);
}

// 🤖 AI (still basic but correct)
function generateAI(prices) {
  let first = prices[0];
  let last = prices[prices.length - 1];

  let change = ((last - first) / first) * 100;

  let prediction = change > 0 ? "UP 📈" : "DOWN 📉";
  let confidence = Math.min(Math.abs(change * 10), 95).toFixed(0);

  document.getElementById("prediction").innerText = prediction;
  document.getElementById("confidence").innerText =
    "Confidence: " + confidence + "%";

  // sentiment based on trend
  let bull = change > 0 ? 70 : 30;
  let bear = 100 - bull;

  document.getElementById("bull").style.width = bull + "%";
  document.getElementById("bear").style.width = bear + "%";
}

// 🚀 INIT
function init() {
  loadAll();

  setInterval(loadAll, 15000);
}

init();
