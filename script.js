// ===== GLOBAL =====
let chart, candleSeries, volumeSeries;
let socket;
let currentSymbol = "btcusdt";

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

// ===== INIT CHART =====
function initChart() {
  const container = document.getElementById("chart");

  chart = LightweightCharts.createChart(container, {
    width: container.clientWidth,
    height: 400,
    layout: {
      background: { color: "#020617" },
      textColor: "#94a3b8"
    },
    grid: {
      vertLines: { color: "#0f172a" },
      horzLines: { color: "#0f172a" }
    }
  });

  candleSeries = chart.addCandlestickSeries({
    upColor: "#22c55e",
    downColor: "#ef4444",
    borderVisible: false,
    wickUpColor: "#22c55e",
    wickDownColor: "#ef4444"
  });

  volumeSeries = chart.addHistogramSeries({
    color: "#38bdf8",
    priceFormat: { type: "volume" },
    priceScaleId: ""
  });

  volumeSeries.priceScale().applyOptions({
    scaleMargins: {
      top: 0.8,
      bottom: 0
    }
  });
}

// ===== FETCH HISTORICAL DATA =====
async function loadCandles() {
  let res = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=${currentSymbol}&interval=1m&limit=100`
  );

  let data = await res.json();

  let candles = data.map(c => ({
    time: c[0] / 1000,
    open: parseFloat(c[1]),
    high: parseFloat(c[2]),
    low: parseFloat(c[3]),
    close: parseFloat(c[4])
  }));

  let volumes = data.map(c => ({
    time: c[0] / 1000,
    value: parseFloat(c[5]),
    color: c[4] > c[1] ? "#22c55e" : "#ef4444"
  }));

  candleSeries.setData(candles);
  volumeSeries.setData(volumes);
}

// ===== LIVE STREAM =====
function startSocket() {
  socket = new WebSocket(
    `wss://stream.binance.com:9443/ws/${currentSymbol}@kline_1m`
  );

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    const k = msg.k;

    const candle = {
      time: k.t / 1000,
      open: parseFloat(k.o),
      high: parseFloat(k.h),
      low: parseFloat(k.l),
      close: parseFloat(k.c)
    };

    candleSeries.update(candle);

    volumeSeries.update({
      time: k.t / 1000,
      value: parseFloat(k.v),
      color: k.c > k.o ? "#22c55e" : "#ef4444"
    });

    updatePrice(k.c);
  };
}

// ===== PRICE UPDATE =====
function updatePrice(price) {
  document.getElementById("btc-price").innerText =
    "$" + parseFloat(price).toFixed(2);
}

// ===== CHANGE COIN =====
window.changeCoin = function (coin) {
  currentSymbol = coinMap[coin];

  // Update title
  const title = document.querySelector(".left-panel h2");
  title.innerText = coinNames[coin];
  title.style.color = coinColors[coin];

  if (socket) socket.close();

  loadCandles();
  startSocket();
};

// ===== INIT =====
function init() {
  initChart();
  loadCandles();
  startSocket();
}

init();
