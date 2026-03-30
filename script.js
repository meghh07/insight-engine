/* ============================================
   Insight Engine — app.js
============================================ */

document.addEventListener('DOMContentLoaded', function () {

  // ── COIN CONFIGS ──────────────────────────
  const COINS = {
    BTC: { name: 'BITCOIN',  base: 67700, spread: 2800, change: '+2.41%', vol: '$38.2B' },
    ETH: { name: 'ETHEREUM', base: 3520,  spread: 180,  change: '+1.78%', vol: '$18.6B' },
    SOL: { name: 'SOLANA',   base: 148,   spread: 18,   change: '-0.94%', vol: '$4.1B'  },
  };

  // ── STATE ─────────────────────────────────
  let activeCoin      = 'BTC';
  let activeTimeframe = '1H';
  let priceChart      = null;
  let liveInterval    = null;

  // ── DOM ───────────────────────────────────
  const coinNameEl    = document.getElementById('coinName');
  const coinPriceEl   = document.getElementById('coinPrice');
  const coinChangeEl  = document.getElementById('coinChange');
  const stat24hHigh   = document.getElementById('stat24hHigh');
  const stat24hLow    = document.getElementById('stat24hLow');
  const statVol       = document.getElementById('statVol');
  const chartPriceTag = document.getElementById('chartPriceTag');
  const verdictArrow  = document.getElementById('verdictArrow');
  const verdictLabel  = document.getElementById('verdictLabel');
  const confBar       = document.getElementById('confBar');
  const confPct       = document.getElementById('confPct');
  const aiReason      = document.getElementById('aiReason');
  const refreshBtn    = document.getElementById('refreshBtn');
  const btnIcon       = document.getElementById('btnIcon');
  const clockEl       = document.getElementById('clock');
  const canvas        = document.getElementById('priceChart');

  // ── UTILS ─────────────────────────────────
  function rand(min, max) { return Math.random() * (max - min) + min; }

  function fmtPrice(n) {
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // ── PRICE DATA GENERATION ─────────────────
  function generatePrices(coin, points) {
    points = points || 80;
    var cfg   = COINS[coin];
    var data  = [];
    var price = cfg.base + rand(-cfg.spread * 0.4, cfg.spread * 0.4);
    for (var i = 0; i < points; i++) {
      price += rand(-cfg.spread * 0.014, cfg.spread * 0.016);
      price  = Math.max(cfg.base - cfg.spread * 0.9, price);
      data.push(Math.round(price * 100) / 100);
    }
    return data;
  }

  function generateLabels(points, tf) {
    var labels   = [];
    var now      = Date.now();
    var msPerStep = { '1H': 60000, '4H': 240000, '1D': 900000, '1W': 3600000 };
    var step     = msPerStep[tf] || 60000;
    for (var i = points - 1; i >= 0; i--) {
      var t = new Date(now - i * step);
      var h = t.getHours().toString().padStart(2, '0');
      var m = t.getMinutes().toString().padStart(2, '0');
      labels.push(h + ':' + m);
    }
    return labels;
  }

  // ── AI PREDICTION ─────────────────────────
  var REASONS_UP = [
    'Strong bullish momentum. RSI above 60, MACD bullish crossover observed.',
    'Price consolidating above key support. Volume surge indicates accumulation.',
    'Fibonacci 0.618 retracement held. Breakout pattern forming on 4H chart.',
    'On-chain data shows whale accumulation. Exchange outflows at 3-month high.',
    'Golden cross confirmed on daily chart. Institutional buy signals detected.',
  ];
  var REASONS_DOWN = [
    'Bearish divergence on RSI. Distribution pattern visible on hourly timeframe.',
    'Resistance rejected multiple times. Sell pressure increasing from shorts.',
    'Volume declining on recent pumps. Classic bull trap pattern identified.',
    'Funding rates elevated. Over-leveraged long positions at risk.',
    'Death cross forming on 4H chart. Macro uncertainty adds downward pressure.',
  ];

  function runAIPrediction() {
    if (!priceChart) return;
    var prices = priceChart.data.datasets[0].data;
    if (!prices || prices.length < 2) return;

    var last  = prices[prices.length - 1];
    var prev  = prices[Math.max(0, prices.length - 10)];
    var up    = last >= prev;

    var confidence = Math.floor(rand(58, 92));
    var reasons    = up ? REASONS_UP : REASONS_DOWN;
    var reason     = reasons[Math.floor(Math.random() * reasons.length)];

    verdictArrow.textContent  = up ? '▲' : '▼';
    verdictArrow.className    = 'verdict-arrow ' + (up ? 'up' : 'down');
    verdictLabel.textContent  = up ? 'UP' : 'DOWN';
    verdictLabel.className    = 'verdict-label ' + (up ? 'up' : 'down');
    confBar.style.width       = confidence + '%';
    confPct.textContent       = confidence + '%';
    aiReason.textContent      = reason;

    // flash
    verdictLabel.style.opacity = '0.1';
    setTimeout(function () { verdictLabel.style.opacity = '1'; }, 120);
  }

  // ── BUILD CHART ───────────────────────────
  function buildChart(prices, labels) {
    // Destroy old chart properly
    if (priceChart) {
      priceChart.destroy();
      priceChart = null;
    }

    var ctx  = canvas.getContext('2d');
    var grad = ctx.createLinearGradient(0, 0, 0, canvas.parentElement.offsetHeight || 340);
    grad.addColorStop(0,   'rgba(0,255,204,0.20)');
    grad.addColorStop(0.6, 'rgba(0,255,204,0.04)');
    grad.addColorStop(1,   'rgba(0,255,204,0.00)');

    priceChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          data:                     prices,
          borderColor:              '#00ffcc',
          borderWidth:              1.8,
          pointRadius:              0,
          pointHoverRadius:         4,
          pointHoverBackgroundColor:'#00ffcc',
          pointHoverBorderColor:    '#00ffcc',
          fill:                     true,
          backgroundColor:          grad,
          tension:                  0.4,
        }],
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        animation:           { duration: 500 },
        interaction:         { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(8,15,26,0.95)',
            borderColor:     'rgba(0,255,204,0.3)',
            borderWidth:     1,
            titleColor:      '#7a9ab8',
            bodyColor:       '#00ffcc',
            titleFont:       { family: 'Space Mono', size: 10 },
            bodyFont:        { family: 'Space Mono', size: 12 },
            padding:         10,
            callbacks: {
              label: function (ctx) { return ' ' + fmtPrice(ctx.parsed.y); },
            },
          },
        },
        scales: {
          x: {
            grid:   { color: 'rgba(15,34,53,0.9)', drawTicks: false },
            ticks:  { color: '#3d5a72', font: { family: 'Space Mono', size: 9 }, maxTicksLimit: 7, maxRotation: 0 },
            border: { color: '#0f2235' },
          },
          y: {
            position: 'right',
            grid:   { color: 'rgba(15,34,53,0.9)', drawTicks: false },
            ticks:  {
              color: '#3d5a72',
              font:  { family: 'Space Mono', size: 9 },
              maxTicksLimit: 7,
              callback: function (v) { return fmtPrice(v); },
            },
            border: { color: '#0f2235' },
          },
        },
      },
    });
  }

  // ── UPDATE STATS ──────────────────────────
  function updateStats(prices) {
    var high = Math.max.apply(null, prices);
    var low  = Math.min.apply(null, prices);
    var last = prices[prices.length - 1];
    coinPriceEl.textContent   = fmtPrice(last);
    chartPriceTag.textContent = fmtPrice(last);
    stat24hHigh.textContent   = fmtPrice(high);
    stat24hLow.textContent    = fmtPrice(low);
  }

  // ── LOAD COIN ─────────────────────────────
  function loadCoin(coin) {
    activeCoin = coin;
    var cfg    = COINS[coin];
    var prices = generatePrices(coin, 80);
    var labels = generateLabels(80, activeTimeframe);

    coinNameEl.textContent = cfg.name;
    statVol.textContent    = cfg.vol;

    var isDown = cfg.change.charAt(0) === '-';
    coinChangeEl.textContent = cfg.change;
    coinChangeEl.className   = 'change' + (isDown ? ' down' : '');

    updateStats(prices);
    buildChart(prices, labels);
    runAIPrediction();
    startLiveTick();
  }

  // ── LIVE TICK ─────────────────────────────
  function startLiveTick() {
    if (liveInterval) {
      clearInterval(liveInterval);
      liveInterval = null;
    }
    liveInterval = setInterval(function () {
      if (!priceChart) return;
      var cfg     = COINS[activeCoin];
      var dataset = priceChart.data.datasets[0];
      var labels  = priceChart.data.labels;

      // Work on copies to avoid mutation issues
      var newData   = dataset.data.slice();
      var newLabels = labels.slice();

      var last  = newData[newData.length - 1];
      var drift = rand(-cfg.spread * 0.011, cfg.spread * 0.013);
      var next  = Math.round((last + drift) * 100) / 100;

      newData.push(next);
      var now = new Date();
      newLabels.push(now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0'));

      if (newData.length > 100) { newData.shift(); newLabels.shift(); }

      priceChart.data.datasets[0].data = newData;
      priceChart.data.labels           = newLabels;
      priceChart.update('none');

      updateStats(newData);
    }, 1500);
  }

  // ── CLOCK ─────────────────────────────────
  function updateClock() {
    var now = new Date();
    clockEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
  }
  updateClock();
  setInterval(updateClock, 1000);

  // ── COIN BUTTONS ──────────────────────────
  document.querySelectorAll('.coin-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.coin-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      loadCoin(btn.getAttribute('data-coin'));
    });
  });

  // ── TIMEFRAME BUTTONS ─────────────────────
  document.querySelectorAll('.tf-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tf-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activeTimeframe = btn.getAttribute('data-tf');
      loadCoin(activeCoin);
    });
  });

  // ── REFRESH PREDICTION ────────────────────
  refreshBtn.addEventListener('click', function () {
    btnIcon.classList.add('spinning');
    setTimeout(function () { btnIcon.classList.remove('spinning'); }, 500);
    runAIPrediction();
  });

  // ── INIT ──────────────────────────────────
  loadCoin('BTC');

}); // end DOMContentLoaded
