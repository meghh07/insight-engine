let chart, candleSeries, interval;

// ===== INIT =====
window.onload = () => {
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
      textColor: "#fff"
    }
  });

  candleSeries = chart.addCandlestickSeries();
}

// ===== LOAD COIN =====
async function loadCoin(coin) {
  document.getElementById("coin").innerText = coin.toUpperCase();

  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coin}`);
    const data = await res.json();

    const price = data.market_data.current_price.usd;
    document.getElementById("price").innerText = "$" + price;

    generateChart(price);

  } catch {
    console.log("API failed → fallback");
    generateChart(50000);
  }
}

// ===== GENERATE DATA =====
function generateChart(base) {
  let data = [];
  let time = Math.floor(Date.now() / 1000) - 100 * 60;
  let last = base;

  for (let i = 0; i < 100; i++) {
    let open = last;
    let close = open + (Math.random() - 0.5) * 100;

    data.push({
      time,
      open,
      high: open + 50,
      low: open - 50,
      close
    });

    last = close;
    time += 60;
  }

  candleSeries.setData(data);
  startRealtime(last);
}

// ===== REALTIME =====
function startRealtime(last) {
  clearInterval(interval);

  interval = setInterval(() => {
    let time = Math.floor(Date.now() / 1000);
    let newPrice = last + (Math.random() - 0.5) * 50;

    candleSeries.update({
      time,
      open: last,
      high: Math.max(last, newPrice),
      low: Math.min(last, newPrice),
      close: newPrice
    });

    last = newPrice;
  }, 1000);
}

// ===== SWITCH =====
function changeCoin(c) {
  loadCoin(c);
}

// ===== AI =====
setInterval(() => {
  document.getElementById("prediction").innerText =
    Math.random() > 0.5 ? "UP 📈" : "DOWN 📉";
}, 3000);
