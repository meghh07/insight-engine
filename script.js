let chart;

async function loadCoins() {
  let res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd");
  let data = await res.json();

  document.getElementById("btc").innerText = data.bitcoin.usd;
  document.getElementById("eth").innerText = data.ethereum.usd;
  document.getElementById("sol").innerText = data.solana.usd;

  document.getElementById("btc-price").innerText = "$" + data.bitcoin.usd;
}

async function loadChart(mins = 1) {
  let res = await fetch("https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1");
  let data = await res.json();

  let prices = data.prices.map(p => p[1]);

  let ctx = document.getElementById("chart").getContext("2d");

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: prices.map((_, i) => i),
      datasets: [{
        data: prices,
        borderColor: "#22c55e",
        borderWidth: 2,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { display: false },
        y: { display: true }
      }
    }
  });

  generateAI(prices);
}

function generateAI(prices) {
  let change = prices[prices.length - 1] - prices[0];

  let prediction = change > 0 ? "UP 📈" : "DOWN 📉";
  let confidence = Math.min(Math.abs(change), 95).toFixed(0);

  document.getElementById("prediction").innerText = prediction;
  document.getElementById("confidence").innerText = "Confidence: " + confidence + "%";

  // fake data for now
  document.getElementById("volume").innerText = Math.floor(Math.random() * 100000);
  document.getElementById("tnx").innerText = Math.floor(Math.random() * 5000);

  document.getElementById("bull").style.width = "70%";
  document.getElementById("bear").style.width = "30%";
}

function init() {
  loadCoins();
  loadChart();

  setInterval(() => {
    loadCoins();
    loadChart();
  }, 15000);
}

init();
