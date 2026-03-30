/* ===========================================
   CryptoTrace — app.js
   Live price simulation + AI prediction
=========================================== */

// ─── COIN CONFIGS ─────────────────────────────
const COINS = {
  BTC: {
    name:    'BITCOIN',
    symbol:  'BTC',
    base:    67700,
    spread:  3000,
    change:  '+2.41%',
    vol:     '$38.2B',
  },
  ETH: {
    name:    'ETHEREUM',
    symbol:  'ETH',
    base:    3520,
    spread:  200,
    change:  '+1.78%',
    vol:     '$18.6B',
  },
  SOL: {
    name:    'SOLANA',
    symbol:  'SOL',
    base:    148,
    spread:  20,
    change:  '-0.94%',
    vol:     '$4.1B',
  },
};

// ─── STATE ────────────────────────────────────
let activeCoin    = 'BTC';
let activeTimeframe = '1H';
let priceChart    = null;
let chartInterval = null;
let clockInterval = null;

// ─── DOM REFS ─────────────────────────────────
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
const clockEl       = document.getElementById('clock');
const canvas        = document.getElementById('priceChart');

// ─── UTILS ────────────────────────────────────
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function fmt(num, decimals = 2) {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtPrice(num) {
  return '$' + fmt(num, num < 100 ? 2 : 2);
}

// ─── GENERATE PRICE DATA ──────────────────────
function generatePrices(coin, points = 80) {
  const cfg  = COINS[coin];
  const data = [];
  let price  = cfg.base + rand(-cfg.spread * 0.5, cfg.spread * 0.5);

  for (let i = 0; i < points; i++) {
    const drift = rand(-cfg.spread * 0.015, cfg.spread * 0.018);
    price = Math.max(cfg.base - cfg.spread, price + drift);
    data.push(parseFloat(price.toFixed(2)));
  }
  return data;
}

function generateLabels(points = 80, tf = '1H') {
  const labels = [];
  const now    = new Date();
  const intervals = { '1H': 1, '4H': 4, '1D': 15, '1W': 60 }; // minutes per step
  const step   = (intervals[tf] || 1) * 60 * 1000;

  for (let i = points - 1; i >= 0; i--) {
    const t = new Date(now - i * step);
    labels.push(t.getDate().toString().padStart(2, '0'));
  }
  return labels;
}

// ─── AI PREDICTION LOGIC ──────────────────────
const AI_REASONS_UP = [
  'Strong bullish momentum detected. RSI above 60, MACD bullish crossover observed.',
  'Price consolidating above key support. Volume surge indicates accumulation phase.',
  'Fibonacci retracement held at 0.618 level. Breakout pattern forming on 4H chart.',
  'On-chain data shows whale accumulation. Exchange outflows at 3-month high.',
  'Golden cross confirmed on daily chart. Institutional buy signals detected.',
];

const AI_REASONS_DOWN = [
  'Bearish divergence on RSI. Distribution pattern visible on the hourly timeframe.',
  'Resistance level rejected multiple times. Sell pressure increasing from shorts.',
  'Volume declining on recent pumps. Classic bull trap pattern identified.',
  'On-chain funding rates elevated. Over-leveraged long positions at risk.',
  'Death cross forming on 4H. Macro uncertainty adding downward pressure.',
];

function runAIPrediction() {
  const prices  = priceChart?.data?.datasets?.[0]?.data ?? [];
  if (!prices.length) return;

  const last  = prices[prices.length - 1];
  const prev  = prices[prices.length - 10] ?? prices[0];
  const trend = last > prev;

  const confidence = Math.floor(rand(58, 91));
  const reasons    = trend ? AI_REASONS_UP : AI_REASONS_DOWN;
  const reason     = reasons[Math.floor(Math.random() * reasons.length)];

  // Update UI
  verdictArrow.className = 'verdict-arrow ' + (trend ? 'up' : 'down');
  verdictArrow.textContent = trend ? '▲' : '▼';
  verdictLabel.textContent  = trend ? 'UP' : 'DOWN';
  verdictLabel.className    = 'verdict-label ' + (trend ? '' : 'down');

  confBar.style.width = confidence + '%';
  confPct.textContent = confidence + '%';
  aiReason.textContent = reason;

  // Flash effect
  verdictLabel.style.opacity = '0.2';
  setTimeout(() => (verdictLabel.style.transition = 'opacity 0.5s'), 10);
  setTimeout(() => (verdictLabel.style.opacity   = '1'), 50);
}

// ─── CHART SETUP ──────────────────────────────
function buildChart(prices, labels) {
  const ctx = canvas.getContext('2d');

  const grad = ctx.createLinearGradient(0, 0, 0, canvas.offsetHeight || 360);
  grad.addColorStop(0,   'rgba(0,255,204,0.18)');
  grad.addColorStop(0.5, 'rgba(0,255,204,0.04)');
  grad.addColorStop(1,   'rgba(0,255,204,0)');

  if (priceChart) {
    priceChart.destroy();
    priceChart = null;
  }

  priceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        data:            prices,
        borderColor:     '#00ffcc',
        borderWidth:     1.8,
        pointRadius:     0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: '#00ffcc',
        fill:            true,
        backgroundColor: grad,
        tension:         0.35,
      }],
    },
    options: {
      responsive:          true,
      maintainAspectRatio: false,
      animation: {
        duration: 600,
        easing:   'easeInOutQuart',
      },
      interaction: {
        mode:      'index',
        intersect: false,
      },
      plugins: {
        legend:  { display: false },
        tooltip: {
          backgroundColor: 'rgba(8,15,26,0.95)',
          borderColor:     'rgba(0,255,204,0.3)',
          borderWidth:     1,
          titleColor:      '#7a9ab8',
          bodyColor:       '#00ffcc',
          titleFont:       { family: 'Space Mono', size: 10 },
          bodyFont:        { family: 'Space Mono', size: 13 },
          padding:         10,
          callbacks: {
            label: ctx => ' $' + fmt(ctx.parsed.y, 2),
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(15,34,53,0.8)',
            drawTicks: false,
          },
          ticks: {
            color:     '#3d5a72',
            font:      { family: 'Space Mono', size: 10 },
            maxTicksLimit: 8,
            maxRotation: 0,
          },
          border: { color: '#0f2235' },
        },
        y: {
          position: 'right',
          grid: {
            color:     'rgba(15,34,53,0.8)',
            drawTicks: false,
          },
          ticks: {
            color:     '#3d5a72',
            font:      { family: 'Space Mono', size: 10 },
            callback:  v => '$' + fmt(v, 2),
            maxTicksLimit: 8,
          },
          border: { color: '#0f2235' },
        },
      },
    },
  });
}

// ─── UPDATE STATS ─────────────────────────────
function updateStats(prices) {
  const high = Math.max(...prices);
  const low  = Math.min(...prices);
  const last = prices[prices.length - 1];

  coinPriceEl.textContent   = fmtPrice(last);
  chartPriceTag.textContent = fmtPrice(last);
  stat24hHigh.textContent   = fmtPrice(high);
  stat24hLow.textContent    = fmtPrice(low);
}

// ─── LOAD COIN ────────────────────────────────
function loadCoin(coin) {
  activeCoin = coin;

  const cfg     = COINS[coin];
  const prices  = generatePrices(coin);
  const labels  = generateLabels(prices.length, activeTimeframe);

  coinNameEl.textContent = cfg.name;
  statVol.textContent    = cfg.vol;

  const isDown = cfg.change.startsWith('-');
  coinChangeEl.textContent = cfg.change;
  coinChangeEl.className   = 'change' + (isDown ? ' down' : '');

  updateStats(prices);
  buildChart(prices, labels);
  runAIPrediction();
  startLiveTick();
}

// ─── LIVE TICK ────────────────────────────────
function startLiveTick() {
  if (chartInterval) clearInterval(chartInterval);

  chartInterval = setInterval(() => {
    if (!priceChart) return;

    const dataset = priceChart.data.datasets[0];
    const labels  = priceChart.data.labels;
    const prices  = dataset.data;
    const cfg     = COINS[activeCoin];

    // Append new price
    const last  = prices[prices.length - 1];
    const drift = rand(-cfg.spread * 0.012, cfg.spread * 0.014);
    const next  = parseFloat((last + drift).toFixed(2));

    prices.push(next);
    labels.push(new Date().getDate().toString().padStart(2, '0'));

    // Keep buffer at ~100 points
    if (prices.length > 100) {
      prices.shift();
      labels.shift();
    }

    dataset.data = prices;
    priceChart.update('none'); // no animation for live ticks

    updateStats(prices);
  }, 1500);
}

// ─── CLOCK ────────────────────────────────────
function startClock() {
  function tick() {
    const now = new Date();
    clockEl.textContent =
      now.toLocaleTimeString('en-US', { hour12: false });
  }
  tick();
  clockInterval = setInterval(tick, 1000);
}

// ─── EVENT LISTENERS ──────────────────────────

// Coin buttons
document.querySelectorAll('.coin-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.coin-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadCoin(btn.dataset.coin);
  });
});

// Timeframe buttons
document.querySelectorAll('.tf-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeTimeframe = btn.dataset.tf;
    loadCoin(activeCoin);
  });
});

// Refresh prediction
refreshBtn.addEventListener('click', () => {
  const icon = refreshBtn.querySelector('.btn-icon');
  icon.style.transform    = 'rotate(360deg)';
  icon.style.transition   = 'transform 0.5s ease';
  setTimeout(() => {
    icon.style.transform  = '';
    icon.style.transition = '';
  }, 500);
  runAIPrediction();
});

// ─── INIT ─────────────────────────────────────
startClock();
loadCoin('BTC');
