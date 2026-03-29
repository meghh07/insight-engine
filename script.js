let chart;

async function loadCoins() {
  try {
    let res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd");
    let data = await res.json();

    document.getElementById("btc").innerText = "$" + data.bitcoin.usd;
    document.getElementById("eth").innerText = "$" + data.ethereum.usd;
    document.getElementById("sol").innerText = "$" + data.solana.usd;

  } catch (e) {
    console.log("Coin fetch error", e);
  }
}

async function loadChart(minutes = 1) {
  try {
    let res = await fetch("https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1");
    let data = await res.json();

    let prices = data.prices.map(p => p[1]);

    // simulate timeframe
    let sliceSize = Math.floor(prices.length / (1440 / minutes));
    prices = prices.slice(-sliceSize);

    let labels = prices.map((_, i) => i);

    let ctx = document.getElementById("chart").getContext("2d");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          label: "BTC",
          data: prices,
          borderColor: "#22c55e",
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3
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

  } catch (e) {
    console.log("Chart error", e);
  }
}

function generateAI(prices) {
  let first = prices[0];
  let last = prices[prices.length - 1];

  let change = ((last - first) / first) * 100;

  let prediction = "";
  let confidence = Math.min(Math.abs(change * 10), 95).toFixed(0);

  if (change > 0.3) {
    prediction = "UP 📈";
  } else if (change < -0.3) {
    prediction = "DOWN 📉";
  } else {
    prediction = "HOLD 🤝";
  }

  document.getElementById("prediction").innerText = prediction;
  document.getElementById("confidence").innerText = "Confidence: " + confidence + "%";

  // temp fake metrics
  document.getElementById("volume").innerText = Math.floor(Math.random() * 100000);
  document.getElementById("tnx").innerText = Math.floor(Math.random() * 1000);
}

function init() {
  console.log("Starting dashboard...");

  loadCoins();
  loadChart();

  setInterval(() => {
    loadCoins();
    loadChart();
  }, 15000); // refresh every 15 sec
}

init();
