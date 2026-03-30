/* ══════════════════════════════════════════════════════
   INSIGHT ENGINE — app.js
   Full trading dashboard logic
══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ══ COIN DATABASE ══════════════════════════════════ */
  var COINS = {
    BTC: {
      symbol: 'BTC', name: 'Bitcoin', icon: '₿',
      base: 67700, spread: 2600,
      change: '+2.41%', vol: '$38.2B', mcap: '$1.33T',
      supply: '19.7M BTC', ath: '$73,738'
    },
    ETH: {
      symbol: 'ETH', name: 'Ethereum', icon: 'Ξ',
      base: 3520, spread: 160,
      change: '+1.78%', vol: '$18.6B', mcap: '$423B',
      supply: '120.2M ETH', ath: '$4,878'
    },
    SOL: {
      symbol: 'SOL', name: 'Solana', icon: '◎',
      base: 148, spread: 16,
      change: '-0.94%', vol: '$4.1B', mcap: '$67B',
      supply: '455M SOL', ath: '$259.96'
    }
  };

  /* ══ TIMEFRAME CONFIG ═══════════════════════════════ */
  var TF = {
    '1M':  { points: 60,  intervalMs: 1000,   stepMs: 1000,    fmt: fmtSec  },
    '5M':  { points: 60,  intervalMs: 2000,   stepMs: 5000,    fmt: fmtMin  },
    '15M': { points: 60,  intervalMs: 2000,   stepMs: 15000,   fmt: fmtMin  },
    '1H':  { points: 60,  intervalMs: 2000,   stepMs: 60000,   fmt: fmtMin  },
    '4H':  { points: 60,  intervalMs: 2000,   stepMs: 240000,  fmt: fmtMin  },
    '1D':  { points: 60,  intervalMs: 2000,   stepMs: 900000,  fmt: fmtMin  },
    '1W':  { points: 56,  intervalMs: 2000,   stepMs: 3600000, fmt: fmtDay  }
  };

  function pad(n)    { return String(n).padStart(2, '0'); }
  function fmtSec(t) { return pad(t.getHours())+':'+pad(t.getMinutes())+':'+pad(t.getSeconds()); }
  function fmtMin(t) { return pad(t.getHours())+':'+pad(t.getMinutes()); }
  function fmtDay(t) { var d=['Sun','Mon','Tue','Wed','Thu','Fri','Sat']; return d[t.getDay()]+' '+pad(t.getHours())+'h'; }

  function fprice(n) {
    if (n >= 1000) return '$' + n.toLocaleString('en-US', { minimumFractionDigits:2, maximumFractionDigits:2 });
    return '$' + n.toFixed(2);
  }

  /* ══ STATE ══════════════════════════════════════════ */
  var state = {
    coin:      'BTC',
    tf:        '1M',
    chartType: 'line',
    chart:     null,
    prices:    [],
    labels:    [],
    liveTimer: null,
    tickCount: 0,
    trendUp:   true
  };

  /* ══ GENERATE PRICE SERIES ══════════════════════════ */
  function r(a, b) { return Math.random() * (b - a) + a; }

  function makePrices(coin, n) {
    var cfg = COINS[coin];
    var out = [];
    var p = cfg.base + r(-cfg.spread * 0.35, cfg.spread * 0.35);
    for (var i = 0; i < n; i++) {
      p += r(-cfg.spread * 0.013, cfg.spread * 0.016);
      p  = Math.max(cfg.base - cfg.spread * 0.95, p);
      out.push(Math.round(p * 100) / 100);
    }
    return out;
  }

  function makeLabels(n, tf) {
    var cfg = TF[tf];
    var now = Date.now();
    var out = [];
    for (var i = n - 1; i >= 0; i--) {
      out.push(cfg.fmt(new Date(now - i * cfg.stepMs)));
    }
    return out;
  }

  /* ══ THEME (GREEN / RED) ════════════════════════════ */
  function applyTheme(up) {
    state.trendUp = up;
    document.body.classList.toggle('theme-down', !up);
    document.body.classList.toggle('theme-up', up);
  }

  /* ══ AI SIGNAL DATA ═════════════════════════════════ */
  var UP_REASONS = [
    'Strong bullish momentum. RSI above 60, MACD bullish crossover observed.',
    'Price consolidating above key support. Volume surge indicates accumulation.',
    'Fibonacci 0.618 retracement held. Breakout pattern forming on chart.',
    'Whale wallet accumulation detected. Exchange outflows at 3-month high.',
    'Golden cross confirmed on daily. Institutional buy signals detected.',
    'Order book shows strong bid walls. Breakout above resistance imminent.',
    'On-chain metrics bullish. Long/short ratio favours bulls at 1.8x.'
  ];
  var DN_REASONS = [
    'Bearish RSI divergence observed. Distribution pattern on hourly visible.',
    'Resistance rejected multiple times. Short-side pressure intensifying.',
    'Volume declining on pumps. Classic bull-trap formation identified.',
    'Funding rates elevated. Over-leveraged longs face liquidation risk.',
    'Death cross forming on 4H. Macro headwinds adding sustained pressure.',
    'Large exchange inflows detected. Possible sell-off incoming.',
    'Open interest dropping with price. Bearish momentum confirmation.'
  ];

  function runAI(prices) {
    var last  = prices[prices.length - 1];
    var prev  = prices[Math.max(0, prices.length - 14)];
    var up    = last >= prev;
    var conf  = Math.floor(r(56, 95));
    var rsi   = Math.floor(r(up ? 55 : 25, up ? 80 : 50));
    var macd  = up ? +r(0.1, 0.8).toFixed(2) : -r(0.1, 0.8).toFixed(2);
    var volPc = Math.floor(r(50, 99));

    applyTheme(up);

    /* Arrow & word */
    var arrow = document.getElementById('aiArrow');
    var word  = document.getElementById('aiWord');
    arrow.textContent = up ? '▲' : '▼';
    arrow.className   = 'ai-arrow' + (up ? '' : ' down');
    word.textContent  = up ? 'BULLISH' : 'BEARISH';

    /* Confidence ring */
    var circumference = 2 * Math.PI * 24; // r=24
    var offset = circumference * (1 - conf / 100);
    var ringCircle = document.getElementById('ringCircle');
    ringCircle.setAttribute('stroke-dasharray', circumference.toFixed(1));
    ringCircle.setAttribute('stroke-dashoffset', offset.toFixed(1));
    ringCircle.style.stroke = up ? 'var(--accent)' : 'var(--danger)';
    document.getElementById('ringPct').textContent = conf + '%';

    /* Indicators */
    document.getElementById('indRsi').style.width    = rsi + '%';
    document.getElementById('indRsiVal').textContent = rsi + '.0';
    document.getElementById('indMacd').style.width   = Math.abs(macd) * 80 + '%';
    document.getElementById('indMacdVal').textContent = (macd > 0 ? '+' : '') + macd;
    document.getElementById('indMacdVal').className  = 'ind-val ' + (macd > 0 ? 'accent' : '');
    document.getElementById('indVol').style.width    = volPc + '%';
    document.getElementById('indVolVal').textContent = volPc > 75 ? 'HIGH' : volPc > 50 ? 'MED' : 'LOW';

    /* Badge */
    var badge = document.getElementById('aiBadge');
    badge.textContent = up ? 'BULLISH SIGNAL' : 'BEARISH SIGNAL';
    badge.style.background = up ? 'rgba(0,232,122,0.1)' : 'rgba(255,59,92,0.1)';
    badge.style.color      = up ? 'var(--accent)' : 'var(--danger)';
    badge.style.border     = '1px solid ' + (up ? 'rgba(0,232,122,0.35)' : 'rgba(255,59,92,0.35)');

    /* Reason */
    var reasons = up ? UP_REASONS : DN_REASONS;
    document.getElementById('aiReason').textContent = reasons[Math.floor(Math.random() * reasons.length)];

    /* Price change display */
    updateChangeDisplay(last, prev);
  }

  function updateChangeDisplay(last, first) {
    var pct   = ((last - first) / first * 100);
    var up    = pct >= 0;
    var str   = (up ? '▲ +' : '▼ ') + pct.toFixed(2) + '%';
    var cls   = 'pc-change' + (up ? '' : ' down');
    var chCls = 'ch-change' + (up ? '' : ' down');
    var el    = document.getElementById('coinChange');
    var el2   = document.getElementById('chartChange');
    if (el)  { el.textContent  = str; el.className  = cls; }
    if (el2) { el2.textContent = str; el2.className = chCls; }
  }

  /* ══ BUILD CHART ════════════════════════════════════ */
  function buildChart(prices, labels) {
    var canvas = document.getElementById('priceChart');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    if (state.chart) { state.chart.destroy(); state.chart = null; }

    var h    = canvas.parentElement.clientHeight || 400;
    var grad = ctx.createLinearGradient(0, 0, 0, h);
    var up   = state.trendUp;
    var c0   = up ? 'rgba(0,232,122,0.22)' : 'rgba(255,59,92,0.22)';
    var c1   = up ? 'rgba(0,232,122,0.04)' : 'rgba(255,59,92,0.04)';
    var line = up ? '#00e87a' : '#ff3b5c';
    grad.addColorStop(0, c0);
    grad.addColorStop(0.6, c1);
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    var isBar = state.chartType === 'bar';

    state.chart = new Chart(ctx, {
      type: isBar ? 'bar' : 'line',
      data: {
        labels: labels,
        datasets: [{
          data:                       prices,
          borderColor:                line,
          borderWidth:                isBar ? 0 : 2,
          backgroundColor:            isBar ? (up ? 'rgba(0,232,122,0.5)' : 'rgba(255,59,92,0.5)') : grad,
          pointRadius:                0,
          pointHoverRadius:           5,
          pointHoverBackgroundColor:  line,
          pointHoverBorderColor:      '#04080f',
          pointHoverBorderWidth:      2,
          fill:                       !isBar,
          tension:                    0.4,
          borderRadius:               isBar ? 3 : 0
        }]
      },
      options: {
        responsive:          true,
        maintainAspectRatio: false,
        animation:           { duration: 300 },
        interaction:         { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(4,8,15,0.97)',
            borderColor:     up ? 'rgba(0,232,122,0.3)' : 'rgba(255,59,92,0.3)',
            borderWidth:     1,
            titleColor:      '#3a5570',
            bodyColor:       line,
            titleFont:       { family: "'IBM Plex Mono', monospace", size: 9 },
            bodyFont:        { family: "'IBM Plex Mono', monospace", size: 12 },
            padding:         10,
            displayColors:   false,
            callbacks: {
              label: function (c) { return '  ' + fprice(c.parsed.y); }
            }
          }
        },
        scales: {
          x: {
            grid:   { color: 'rgba(255,255,255,0.03)', drawTicks: false },
            ticks:  { color: '#3a5570', font: { family: "'IBM Plex Mono', monospace", size: 9 }, maxTicksLimit: 8, maxRotation: 0 },
            border: { color: 'rgba(255,255,255,0.05)' }
          },
          y: {
            position: 'right',
            grid:   { color: 'rgba(255,255,255,0.03)', drawTicks: false },
            ticks:  { color: '#3a5570', font: { family: "'IBM Plex Mono', monospace", size: 9 }, maxTicksLimit: 7,
                      callback: function (v) { return fprice(v); } },
            border: { color: 'rgba(255,255,255,0.05)' }
          }
        }
      }
    });
  }

  /* ══ UPDATE STATS ═══════════════════════════════════ */
  function updateStats(prices) {
    var last  = prices[prices.length - 1];
    var first = prices[0];
    var high  = Math.max.apply(null, prices);
    var low   = Math.min.apply(null, prices);
    var amp   = ((high - low) / low * 100).toFixed(2);
    var chPct = ((last - first) / first * 100).toFixed(2);
    var up    = last >= first;

    /* Sidebar */
    document.getElementById('coinPrice').textContent  = fprice(last);
    document.getElementById('chartPrice').textContent = fprice(last);
    document.getElementById('statHigh').textContent   = fprice(high);
    document.getElementById('statLow').textContent    = fprice(low);

    /* Stats bar */
    document.getElementById('sbOpen').textContent      = fprice(first);
    document.getElementById('sbHigh').textContent      = fprice(high);
    document.getElementById('sbLow').textContent       = fprice(low);
    document.getElementById('sbClose').textContent     = fprice(last);
    document.getElementById('sbChange').textContent    = (up ? '+' : '') + chPct + '%';
    document.getElementById('sbAmplitude').textContent = amp + '%';
    document.getElementById('sbTicks').textContent     = state.tickCount;

    /* Change colour on sbChange */
    var sbChange = document.getElementById('sbChange');
    sbChange.style.color = up ? 'var(--accent)' : 'var(--danger)';
  }

  /* ══ LOAD COIN ══════════════════════════════════════ */
  function loadCoin(coin) {
    state.coin = coin;
    var cfg     = COINS[coin];
    var tfCfg   = TF[state.tf];
    var prices  = makePrices(coin, tfCfg.points);
    var labels  = makeLabels(tfCfg.points, state.tf);

    state.prices    = prices;
    state.labels    = labels;
    state.tickCount = 0;

    /* Sidebar info */
    document.getElementById('coinSymbol').textContent  = cfg.symbol;
    document.getElementById('coinName').textContent    = cfg.name;
    document.getElementById('statVol').textContent     = cfg.vol;
    document.getElementById('statMcap').textContent    = cfg.mcap;
    document.getElementById('statSupply').textContent  = cfg.supply;
    document.getElementById('statAth').textContent     = cfg.ath;

    /* Tab change labels */
    Object.keys(COINS).forEach(function (k) {
      var el  = document.getElementById('tab-change-' + k);
      var c   = COINS[k];
      var dn  = c.change.charAt(0) === '-';
      if (el) { el.textContent = c.change; el.className = 'ct-change' + (dn ? ' down' : ''); }
    });

    updateStats(prices);
    runAI(prices);
    buildChart(prices, labels);
    startLive();
  }

  /* ══ LIVE TICK ══════════════════════════════════════ */
  function startLive() {
    if (state.liveTimer) { clearInterval(state.liveTimer); state.liveTimer = null; }

    var tfCfg   = TF[state.tf];
    var maxPts  = tfCfg.points + 40;

    state.liveTimer = setInterval(function () {
      if (!state.chart) return;

      var cfg      = COINS[state.coin];
      var oldData  = state.chart.data.datasets[0].data.slice();
      var oldLbl   = state.chart.data.labels.slice();
      var last     = oldData[oldData.length - 1];

      /* Slightly larger drift on 1M for visual effect */
      var drift = state.tf === '1M'
        ? r(-cfg.spread * 0.008, cfg.spread * 0.009)
        : r(-cfg.spread * 0.012, cfg.spread * 0.014);

      var next = Math.round((last + drift) * 100) / 100;
      var now  = new Date();

      oldData.push(next);
      oldLbl.push(tfCfg.fmt(now));

      if (oldData.length > maxPts) { oldData.shift(); oldLbl.shift(); }

      state.chart.data.datasets[0].data   = oldData;
      state.chart.data.labels             = oldLbl;
      state.chart.update('none');

      state.prices    = oldData;
      state.tickCount++;

      updateStats(oldData);

      /* Re-run AI every 20 ticks */
      if (state.tickCount % 20 === 0) runAI(oldData);

    }, tfCfg.intervalMs);
  }

  /* ══ CLOCK ══════════════════════════════════════════ */
  function tickClock() {
    var d   = new Date();
    var el  = document.getElementById('clock');
    if (el) el.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }
  tickClock();
  setInterval(tickClock, 1000);

  /* ══ BTC DOMINANCE fluctuation ══════════════════════ */
  var btcDomBase = 54.2;
  setInterval(function () {
    btcDomBase += r(-0.05, 0.05);
    btcDomBase  = Math.max(50, Math.min(58, btcDomBase));
    var el = document.getElementById('btcDom');
    if (el) el.textContent = btcDomBase.toFixed(1) + '%';
  }, 3000);

  /* ══ COIN TAB BUTTONS ═══════════════════════════════ */
  document.querySelectorAll('.coin-tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.coin-tab').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      loadCoin(btn.getAttribute('data-coin'));
    });
  });

  /* ══ TIMEFRAME BUTTONS ══════════════════════════════ */
  document.querySelectorAll('.tf-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tf-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      state.tf = btn.getAttribute('data-tf');
      loadCoin(state.coin);
    });
  });

  /* ══ CHART TYPE BUTTONS ═════════════════════════════ */
  document.querySelectorAll('.ct-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.ct-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      state.chartType = btn.getAttribute('data-type');
      buildChart(state.prices, state.labels);
    });
  });

  /* ══ REFRESH SIGNAL ═════════════════════════════════ */
  document.getElementById('refreshBtn').addEventListener('click', function () {
    runAI(state.prices);
  });

  /* ══ SET ALERT (demo) ═══════════════════════════════ */
  document.getElementById('alertBtn').addEventListener('click', function () {
    var p = state.prices[state.prices.length - 1];
    alert('🔔 Alert set at ' + fprice(p) + ' for ' + state.coin + '\n(Demo — connect your backend to enable real alerts)');
  });

  /* ══ KEYBOARD SHORTCUTS ═════════════════════════════ */
  document.addEventListener('keydown', function (e) {
    var key = e.key.toUpperCase();
    if (key === 'B') { document.querySelector('[data-coin="BTC"]').click(); }
    if (key === 'E') { document.querySelector('[data-coin="ETH"]').click(); }
    if (key === 'S') { document.querySelector('[data-coin="SOL"]').click(); }
    if (key === 'R') { document.getElementById('refreshBtn').click(); }
    var tfMap = { '1':'1M', '2':'5M', '3':'15M', '4':'1H', '5':'4H', '6':'1D', '7':'1W' };
    if (tfMap[e.key]) {
      var btn = document.querySelector('[data-tf="' + tfMap[e.key] + '"]');
      if (btn) btn.click();
    }
  });

  /* ══ INIT ═══════════════════════════════════════════ */
  loadCoin('BTC');

})();
