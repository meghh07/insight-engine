window.onload = () => {
  initChart();
  loadData("bitcoin");
};

let chart, candleSeries;

function initChart() {
  const container = document.getElementById("chart");

  chart = LightweightCharts.createChart(container, {
    width: container.clientWidth,
    height: 400,
    layout: {
      background: { color: "#020617" },
      textColor: "#fff"
    }
  });

  candleSeries = chart.addCandlestickSeries();
}

// ===== SAFE FETCH (WITH ERROR HANDLING) =====
async function loadData(coin) {
  try {
    document.getElementById("coinTitle").innerText = coin.toUpperCase();

    const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coin}`);

    if (!res.ok) throw new Error("API blocked");

    const data = await res.json();

    const price = data.market_data.current_price.usd;
    document.getElementById("price").innerText = "$" + price;

    generateFakeChart(price);

  } catch (err) {
    console.log("⚠️ API failed → using fallback");

    document.getElementById("price").innerText = "$" + (Math.random()*50000).toFixed(2);

    generateFakeChart(50000);
  }
}

// ===== ALWAYS SHOW CHART =====
function generateFakeChart(base) {
  let candles = [];
  let time = Math.floor(Date.now() / 1000) - 100 * 60;

  let last = base;

  for (let i = 0; i < 100; i++) {
    let open = last;
    let close = open + (Math.random() - 0.5) * 200;

    candles.push({
      time,
      open,
      high: open + 50,
      low: open - 50,
      close
    });

    last = close;
    time += 60;
  }

  candleSeries.setData(candles);
}

// ===== BUTTON FIX =====
function changeCoin(coin) {
  loadData(coin);
}
