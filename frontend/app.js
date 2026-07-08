let token = '';

const state = {
  symbol: 'BTC'
};

function setStatus(message, error = false) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.style.color = error ? '#f87171' : '#34d399';
}

async function api(path, options = {}) {
  const headers = {
    'content-type': 'application/json',
    ...(options.headers || {})
  };

  if (token) headers.authorization = token;

  const res = await fetch(path, { ...options, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.error?.message || `Request failed (${res.status})`);
  }
  return body.data;
}

function showJson(id, value) {
  document.getElementById(id).textContent = JSON.stringify(value, null, 2);
}

async function login(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const session = await api('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    token = session.token;
    setStatus(`Logged in. Session expires at ${session.expiresAt}`);
    await loadAlerts();
    await loadSettings();
  } catch (err) {
    setStatus(err.message, true);
  }
}

async function loadQuote() {
  try {
    state.symbol = document.getElementById('symbol').value;
    const data = await api(`/api/v1/market/${state.symbol}`);
    showJson('quote', data);
  } catch (err) {
    setStatus(err.message, true);
  }
}

async function loadSignal() {
  try {
    const data = await api(`/api/v1/signals/${state.symbol}`);
    showJson('signal', data);
  } catch (err) {
    setStatus(err.message, true);
  }
}

async function loadAlerts() {
  if (!token) return;
  const list = await api('/api/v1/alerts');
  const ul = document.getElementById('alerts');
  ul.innerHTML = '';
  for (const item of list) {
    const li = document.createElement('li');
    li.textContent = `${item.symbol} @ $${item.targetPrice}`;

    const remove = document.createElement('button');
    remove.textContent = 'remove';
    remove.addEventListener('click', async () => {
      await api(`/api/v1/alerts/${item.id}`, { method: 'DELETE' });
      await loadAlerts();
    });

    li.appendChild(document.createTextNode(' '));
    li.appendChild(remove);
    ul.appendChild(li);
  }
}

async function createAlert(event) {
  event.preventDefault();
  try {
    const targetPrice = Number(document.getElementById('alertPrice').value);
    await api('/api/v1/alerts', {
      method: 'POST',
      body: JSON.stringify({ symbol: state.symbol, targetPrice })
    });
    document.getElementById('alertPrice').value = '';
    await loadAlerts();
    setStatus('Alert created');
  } catch (err) {
    setStatus(err.message, true);
  }
}

async function loadSettings() {
  if (!token) return;
  const settings = await api('/api/v1/settings');
  document.getElementById('theme').value = settings.theme;
  document.getElementById('notify').checked = settings.notificationsEnabled;
  showJson('settingsResult', settings);
}

async function saveSettings(event) {
  event.preventDefault();
  try {
    const payload = {
      theme: document.getElementById('theme').value,
      notificationsEnabled: document.getElementById('notify').checked
    };
    const saved = await api('/api/v1/settings', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    showJson('settingsResult', saved);
    setStatus('Settings updated');
  } catch (err) {
    setStatus(err.message, true);
  }
}

document.getElementById('loginForm').addEventListener('submit', login);
document.getElementById('loadQuote').addEventListener('click', loadQuote);
document.getElementById('loadSignal').addEventListener('click', loadSignal);
document.getElementById('alertForm').addEventListener('submit', createAlert);
document.getElementById('settingsForm').addEventListener('submit', saveSettings);

loadQuote();
