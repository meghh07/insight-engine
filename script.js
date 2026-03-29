let chart;

async function loadCoins() {
  let res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd");
  let data = await res.json();

  document.getElementById("btc").innerText = "$" + data.bitcoin.usd;
  document.getElementById("eth").innerText = "$" + data.ethereum.usd;
  document.getElementById("sol").innerText = "$" + data.solana.usd;
}

async function loadChart(minutes = 1) {
  let res = await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1`);
  let data = await res.json();

  let prices = data.prices.map(p => p[1]).slice(-minutes * 10);

  let labels = prices.map((_, i) => i);

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("chart"), {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        data: prices,
        borderColor: "#22c55e",
        tension: 0.3
      }]
    }
  });

  generateAI(prices);
}

function generateAI(prices) {
  let first = prices[0];
  let last = prices[prices.length - 1];

  let change = ((last - first) / first) * 100;

  let prediction = "";
  let confidence = Math.abs(change * 10).toFixed(0);

  if (change > 0.5) {
    prediction = "UP 📈";
  } else if (change < -0.5) {
    prediction = "DOWN 📉";
  } else {
    prediction = "HOLD 🤝";
  }

  document.getElementById("prediction").innerText = prediction;
  document.getElementById("confidence").innerText = "Confidence: " + confidence + "%";

  document.getElementById("volume").innerText = Math.floor(Math.random() * 10000);
  document.getElementById("tnx").innerText = Math.floor(Math.random() * 500);
}

loadCoins();
loadChart();

setInterval(() => {
  loadCoins();
  loadChart();
}, 30000);
