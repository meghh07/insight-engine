let chart, candleSeries;

// ===== INIT =====
window.onload = () => {
  console.log("JS READY");
  createChart();
  loadCoin("bitcoin");
};

// ===== CREATE CHART =====
function createChart() {
  const el = document.getElementById("chart");

  chart = LightweightCharts.createChart(el, {
    width: el.clientWidth,
    height: 500,
    layout: {
      background: { color: "#020617" },
      textColor: "#ffffff"
    },
    grid: {
      vertLines: { color: "#111" },
      horzLines: { color: "#111" }
    }
  });

  candleSeries = chart.addCandlestickSeries();
}

// ===== LOAD REAL DATA =====
async function loadCoin(coin) {
  try {
    document.getElementById("coin").innerText = coin.toUpperCase();

    // 🔥 REAL PRICE
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coin}`
    );
    const data = await res.json();

    const price = data.market_data.current_price.usd;
    document.getElementById("price").innerText = "$" + price;

    // 🔥 REAL CHART DATA (historical)
    const chartRes = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coin}/market_chart?vs_currency=usd&days=1`
    );
    const chartData = await chartRes.json();

    const candles = convertToCandles(chartData.prices);

    candleSeries.setData(candles);

  } catch (err) {
    console.error("ERROR:", err);
  }
}

// ===== CONVERT DATA =====
function convertToCandles(prices) {
  return prices.map(p => {
    return {
      time: Math.floor(p[0] / 1000),
      open: p[1],
      high: p[1],
      low: p[1],
      close: p[1]
    };
  });
}

// ===== BUTTONS FIX =====
function changeCoin(coin) {
  console.log("Switching to:", coin);
  loadCoin(coin);
}

// ===== AI =====
setInterval(() => {
  const el = document.getElementById("prediction");
  if (!el) return;

  el.innerText =
    Math.random() > 0.5 ? "UP 📈" : "DOWN 📉";
}, 3000);
