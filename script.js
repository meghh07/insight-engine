let chart;
let candleSeries;
let volumeSeries;
let currentCoin = "bitcoin";
let interval;

// ===== INIT AFTER PAGE LOAD =====
window.onload = () => {
  initChart();
  loadData("bitcoin");
};

// ===== CREATE CHART =====
function initChart() {
  const container = document.getElementById("chart");

  chart = LightweightCharts.createChart(container, {
    width: container.clientWidth,
    height: 500,
    layout: {
      background: { color: "#020617" },
      textColor: "#DDD"
    },
    grid: {
      vertLines: { color: "#111" },
      horzLines: { color: "#111" }
    }
  });

  candleSeries = chart.addCandlestickSeries();

  volumeSeries = chart.addHistogramSeries({
    priceFormat: { type: 'volume' },
    priceScaleId: '',
    scaleMargins: { top: 0.8, bottom: 0 }
  });
}

// ===== LOAD DATA =====
async function loadData(coin) {
  currentCoin = coin;

  document.getElementById("coinTitle").innerText = coin.toUpperCase();

  const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coin}`);
  const data = await res.json();

  const price = data.market_data.current_price.usd;

  document.getElementById("price").innerText = "$" + price;

  // RESET CHART (IMPORTANT FIX)
  candleSeries.setData([]);
  volumeSeries.setData([]);

  let candles = [];
  let volumes = [];

  let time = Math.floor(Date.now() / 1000) - 100 * 60;
  let lastClose = price;

  for (let i = 0; i < 100; i++) {
    let open = lastClose;
    let close = open + (Math.random() - 0.5) * 200;

    candles.push({
      time: time,
      open: open,
      high: open + 100,
      low: open - 100,
      close: close
    });

    volumes.push({
      time: time,
      value: Math.random() * 1000
    });

    lastClose = close;
    time += 60;
  }

  candleSeries.setData(candles);
  volumeSeries.setData(volumes);

  startRealtime(lastClose);
}

// ===== REALTIME =====
function startRealtime(lastPrice) {
  clearInterval(interval);

  interval = setInterval(() => {
    let time = Math.floor(Date.now() / 1000);

    let newPrice = lastPrice + (Math.random() - 0.5) * 50;

    candleSeries.update({
      time: time,
      open: lastPrice,
      high: Math.max(lastPrice, newPrice),
      low: Math.min(lastPrice, newPrice),
      close: newPrice
    });

    volumeSeries.update({
      time: time,
      value: Math.random() * 1000
    });

    lastPrice = newPrice;
  }, 1000);
}

// ===== BUTTON SWITCH =====
function changeCoin(coin) {
  loadData(coin);
}

// ===== AI =====
setInterval(() => {
  document.getElementById("prediction").innerText =
    Math.random() > 0.5 ? "UP 📈" : "DOWN 📉";
}, 3000);
