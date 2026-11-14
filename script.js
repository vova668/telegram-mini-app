// ====================== НАСТРОЙКИ МАГАЗИНА ======================
// Меняй цены, тексты и ссылки здесь — остальной код трогать не нужно.
const CONFIG = {
  item: "IMEI",                       // как называется товар
  currency: "$",

  // Цена за 1 ключ в зависимости от количества (max: null — без верхней границы)
  tiers: [
    { min: 1,   max: 19,   price: 15 },
    { min: 20,  max: 49,   price: 13 },
    { min: 50,  max: 99,   price: 11 },
    { min: 100, max: null, price: 10, best: true },
  ],

  // Готовые паки (цена считается по прайсу автоматически)
  packs: [
    { qty: 5 },
    { qty: 25, hot: true },
    { qty: 50 },
  ],

  bonus: {
    minQty: 10,
    subtitle: "При заказе от 10 IMEI — +1 IMEI в подарок",
    text: "+1 IMEI при первой покупке от 10 шт.",
  },

  referral: {
    percent: 10,
    unlockTurnover: 500,
  },

  // ВНИМАНИЕ: это ПРИМЕР. Впиши реальные цифры или убери блок из index.html.
  geography: [
    { name: "Россия",   value: 36, color: "#4f7fe6" },
    { name: "Казахстан", value: 22, color: "#63c995" },
    { name: "Украина",  value: 17, color: "#e6b84a" },
    { name: "Германия", value: 12, color: "#8b5cf0" },
    { name: "США",      value: 13, color: "#b9f0d4" },
  ],

  // Ссылки (поставь свои). Пустая строка — кнопка покажет заглушку.
  links: {
    reviews: "",   // например "https://t.me/твой_канал_с_отзывами"
    support: "",   // например "https://t.me/твой_ник"
  },

  // Способы оплаты на экране заказа
  payments: [
    { id: "ton",    title: "TON / USDT (TON)", subtitle: "автоматическая оплата · без загрузки чека",
      note: "Проверяем перевод автоматически и сразу выдаём IMEI после подтверждения сети" },
    { id: "card",   title: "Банковская карта", note: "Сбер, Т-Банк, Альфа, ВТБ, перевод по номеру карты" },
    { id: "crypto", title: "Другая криптовалюта", note: "USDT TRC20/BEP20, BTC, ETH, LTC, TRX, BNB" },
  ],

  // Оплата в сети TON
  ton: {
    // ↓↓↓ ВСТАВЬ СЮДА АДРЕС СВОЕГО TON-КОШЕЛЬКА ↓↓↓
    wallet: "UQBFWX6JqoFwBBm6MqA-G7ZG5WfPr4r8Ov7MytettWp0BK_b",
    xrocketGuide: "https://t.me/guidXrocket", // ссылка на гайд по xRocket
  },

  // Оплата другой криптовалютой.
  // ↓↓↓ ВСТАВЬ АДРЕСА СВОИХ КОШЕЛЬКОВ в поле address ↓↓↓
  // cg — id монеты на CoinGecko для курса (для стейблкоинов курс = 1)
  crypto: [
    { id: "usdt_trc20", coin: "USDT", network: "TRC20 (Tron)",  cg: null,          decimals: 6, address: "TCpJ3AbGb5AC1GRUnQNqQmvPCE5KcEoMTq" },
    { id: "usdt_bep20", coin: "USDT", network: "BEP20 (BSC)",   cg: null,          decimals: 6, address: "0xFc4b7bbAD31845b04d0C9eC228D0B06e818CA2eE" },
    { id: "btc",        coin: "BTC",  network: "Bitcoin",       cg: "bitcoin",     decimals: 8, address: "bc1qjn7zhynsh9anph6n0m3xp4gzzhalg0f5we59n9" },
    { id: "eth",        coin: "ETH",  network: "Ethereum",      cg: "ethereum",    decimals: 8, address: "0x4E0448dF0e2A090e899E62Fa7Fe751a685DDf328" },
    { id: "ltc",        coin: "LTC",  network: "Litecoin",      cg: "litecoin",    decimals: 8, address: "ltc1q7lvf34ydr8xlzjy2e70z9snfj6zdjjq3a2yrdy" },
    { id: "trx",        coin: "TRX",  network: "Tron",          cg: "tron",        decimals: 6, address: "TCpJ3AbGb5AC1GRUnQNqQmvPCE5KcEoMTq" },
    { id: "bnb",        coin: "BNB",  network: "BEP20 (BSC)",   cg: "binancecoin", decimals: 8, address: "0xFc4b7bbAD31845b04d0C9eC228D0B06e818CA2eE" },
  ],

  // Адрес Worker на Cloudflare — сюда мини-приложение отправляет заказы
  apiUrl: "https://tgbot.exalfa001.workers.dev",

  info: "IMEI",
};

// Данные пользователя. Загружаются с сервера (только подтверждённые заказы); пока не загрузились — нули.
const USER = { balance: 0, orders: 0, bought: 0, turnover: 0 };
// ================================================================

const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor?.("#0f1d1a");
  tg.setBackgroundColor?.("#0b1513");
}

const $ = (id) => document.getElementById(id);
const money = (n) => `${n.toLocaleString("ru-RU")}${CONFIG.currency}`;

function priceFor(qty) {
  const tier = CONFIG.tiers.find((t) => qty >= t.min && (t.max === null || qty <= t.max));
  return tier ? tier.price : CONFIG.tiers[0].price;
}

function word(n) {
  // ключ / ключа / ключей
  const n10 = n % 10, n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return "ключ";
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return "ключа";
  return "ключей";
}

// --- Прайс-лист ---
$("priceList").innerHTML = CONFIG.tiers
  .map((t) => {
    const range = t.max === null ? `${t.min}+ единиц` : `${t.min} - ${t.max} единиц`;
    const chip = t.best ? '<span class="chip">ВЫГОДА</span>' : "";
    return `<li class="${t.best ? "best" : ""}"><span class="range">${range}${chip}</span><span class="price">по ${money(t.price)}</span></li>`;
  })
  .join("");

// --- Бонус ---
$("bonusSubtitle").textContent = CONFIG.bonus.subtitle;
$("bonusText").textContent = CONFIG.bonus.text;

// --- Баланс и рефералы (обновляются, когда приходят данные с сервера) ---
function renderUser() {
  $("balance").textContent = USER.balance.toLocaleString("ru-RU");
  $("orders").textContent = USER.orders;
  $("bought").textContent = USER.bought;

  const ref = CONFIG.referral;
  const pct = Math.min(100, Math.round((USER.turnover / ref.unlockTurnover) * 100));
  $("refSubtitle").textContent = `${ref.percent}% с покупок рефералов после ${money(ref.unlockTurnover)} оборота`;
  $("refProgress").textContent = `${money(USER.turnover)} из ${money(ref.unlockTurnover)}`;
  $("refPercent").textContent = `${pct}%`;
  requestAnimationFrame(() => ($("refBar").style.width = `${pct}%`));
  $("refLocked").innerHTML = pct >= 100
    ? "Реферальная система открыта 🎉"
    : `Реферальная система откроется после оборота <b>${money(ref.unlockTurnover)}</b><br>Осталось: <b>${money(Math.max(0, ref.unlockTurnover - USER.turnover))}</b>`;
}

async function loadUser() {
  if (!tg?.initData) return; // открыто не из Telegram — оставляем нули
  try {
    const r = await fetch(`${CONFIG.apiUrl}/api/me`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: tg.initData }),
    });
    const data = await r.json();
    if (!data.ok) return;
    USER.balance = data.balance;
    USER.orders = data.orders;
    USER.bought = data.bought;
    USER.turnover = data.balance;
    renderUser();
  } catch (e) {
    // нет связи — просто показываем то, что есть
  }
}

renderUser();
loadUser();

// --- Диаграмма (кольцо) ---
(function drawDonut() {
  const total = CONFIG.geography.reduce((s, g) => s + g.value, 0);
  const r = 42, c = 2 * Math.PI * r;
  let offset = 0;
  $("donut").innerHTML = CONFIG.geography
    .map((g) => {
      const len = (g.value / total) * c;
      const seg = `<circle cx="60" cy="60" r="${r}" fill="none" stroke="${g.color}" stroke-width="22"
        stroke-dasharray="${len} ${c - len}" stroke-dashoffset="${-offset}" transform="rotate(-90 60 60)" />`;
      offset += len;
      return seg;
    })
    .join("");
  $("legend").innerHTML = CONFIG.geography
    .map((g) => `<li><i style="background:${g.color}"></i>${g.name} ${g.value}%</li>`)
    .join("");
})();

// --- Паки ---
$("packs").innerHTML = CONFIG.packs
  .map((p) => {
    const each = priceFor(p.qty);
    return `<button class="pack ${p.hot ? "hot" : ""}" data-qty="${p.qty}">
      <span class="pack-chip">${p.hot ? "HOT" : "PACK"}</span>
      <span class="pack-qty">${p.qty} ${word(p.qty)}</span>
      <span class="pack-price">${money(each * p.qty)}</span>
      <span class="pack-each">${money(each)} / шт</span>
    </button>`;
  })
  .join("");

// --- Заказ ---
function showTotal(inputId) {
  const qty = parseInt($(inputId).value, 10);
  $(inputId + "Total").textContent =
    qty > 0 ? `${qty} ${word(qty)} × ${money(priceFor(qty))} = ${money(qty * priceFor(qty))}` : "";
}

function order(qty) {
  if (!qty || qty < 1) {
    notify("Введите количество");
    return;
  }
  tg?.HapticFeedback?.impactOccurred("medium");
  showCheckout(qty);
}

// --- Экран оформления заказа ---
let currentQty = 0;

function showCheckout(qty) {
  currentQty = qty;
  const each = priceFor(qty);
  $("coSum").textContent = money(each * qty);
  const bonus = qty >= CONFIG.bonus.minQty ? " + 1 в подарок" : "";
  $("coQty").textContent = `${qty} ${word(qty)}${bonus}`;

  $("payList").innerHTML = CONFIG.payments
    .map((p) => `<button class="pay-btn" data-pay="${p.id}"><b>${p.title}</b>${p.subtitle ? `<span>${p.subtitle}</span>` : ""}</button>${p.note ? `<p class="pay-note">${p.note}</p>` : ""}`)
    .join("");
  document.querySelectorAll("[data-pay]").forEach((b) => b.addEventListener("click", () => pay(b.dataset.pay)));

  $("shopView").hidden = true;
  $("checkoutView").hidden = false;
  window.scrollTo(0, 0);
  tg?.BackButton?.show();
}

function hideCheckout() {
  $("checkoutView").hidden = true;
  $("shopView").hidden = false;
  loadUser();
  window.scrollTo(0, 0);
  tg?.BackButton?.hide();
}

function pay(method) {
  if (method === "ton") return showTon();
  if (method === "crypto") return showCrypto();
  const p = CONFIG.payments.find((x) => x.id === method);
  const sum = money(priceFor(currentQty) * currentQty);
  notify(`${p.title}: ${sum} за ${currentQty} ${word(currentQty)}.\n\nПриём оплаты пока не подключён.`);
}

// --- Экран оплаты в сети TON ---
function showTon() {
  $("checkoutView").hidden = true;
  $("tonView").hidden = false;
  window.scrollTo(0, 0);
}

function hideTon() {
  $("tonView").hidden = true;
  $("checkoutView").hidden = false;
  window.scrollTo(0, 0);
}

// --- Экран условий перед оплатой ---
let currentCoin = "TON";

function payCoin(coin) {
  currentCoin = coin;
  const name = coin === "TON" ? "TON" : "USDT (TON)";
  $("termsTitle").textContent = `УСЛОВИЯ · ${name}`;
  $("termsLabel").textContent = `Перед оплатой ${name}`;
  $("termsCheck").checked = false;
  $("termsOk").disabled = true;
  $("tonView").hidden = true;
  $("termsView").hidden = false;
  window.scrollTo(0, 0);
}

function hideTerms() {
  $("termsView").hidden = true;
  $("tonView").hidden = false;
  window.scrollTo(0, 0);
}

function termsAccepted() {
  showPay();
}

// --- Экран автооплаты ---
let payAmountText = "";

function coinName() {
  return currentCoin === "TON" ? "TON" : "USDT";
}

// Небольшой уникальный «хвост» к сумме: по нему сервер найдёт заказ без комментария
function uniqueTail() {
  return (Math.floor(Math.random() * 900) + 100) / 1e9; // 0.000000100 … 0.000000999
}

async function showPay() {
  orderSent = false;
  const usd = priceFor(currentQty) * currentQty;
  const coin = coinName();
  const isTon = currentCoin === "TON";

  $("payTitle").textContent = `АВТООПЛАТА · ${isTon ? "TON" : "USDT (TON)"}`;
  $("payLabel").textContent = `Автоматическая оплата ${isTon ? "TON" : "USDT (TON)"}`;
  $("paySum").textContent = money(usd);
  $("payQty").textContent = `${currentQty} ${word(currentQty)}`;
  $("payCoin").textContent = coin;
  $("addrLabel").textContent = `Адрес для перевода ${isTon ? "TON" : "USDT (сеть TON)"}`;
  $("payRules").innerHTML = [
    `Отправьте ровно указанную сумму ${coin} на адрес заказа — по точной сумме система находит ваш заказ`,
    "Не округляйте сумму и не отправляйте её частями",
    "Оставайтесь на этом экране — платёж проверяется автоматически",
    "После подтверждения сети IMEI придут в чат с ботом",
    "«Проверить сейчас» можно использовать как ручной повтор проверки",
  ].map((t) => `<li>${t}</li>`).join("");

  const wallet = CONFIG.ton.wallet;
  const placeholder = !wallet || wallet.startsWith("ВСТАВЬТЕ");
  $("payAddress").textContent = placeholder ? "Адрес кошелька ещё не указан" : wallet;
  $("payAddress").classList.toggle("placeholder", placeholder);

  $("termsView").hidden = true;
  $("payView").hidden = false;
  window.scrollTo(0, 0);

  $("payAmount").textContent = "…";
  $("payRate").textContent = "";
  $("chartCard").hidden = !isTon;

  if (!isTon) {
    payAmountText = (usd + uniqueTail() * 1000).toFixed(6); // USDT: 6 знаков
    $("payAmount").textContent = payAmountText;
    $("payRate").textContent = "1 USDT ≈ 1 USD";
    return;
  }

  try {
    const r = await fetch("https://api.coingecko.com/api/v3/coins/the-open-network/market_chart?vs_currency=usd&days=1");
    const data = await r.json();
    const prices = data.prices;
    const rate = prices[prices.length - 1][1];
    payAmountText = (usd / rate + uniqueTail()).toFixed(9); // TON: 9 знаков
    $("payAmount").textContent = payAmountText;
    $("payRate").textContent = `1 TON = ${rate.toFixed(4)} USD`;
    drawChart(prices);
  } catch (e) {
    payAmountText = "";
    $("payAmount").textContent = "—";
    $("payRate").textContent = "Не удалось получить курс TON. Попробуйте открыть экран ещё раз.";
    $("chartCard").hidden = true;
  }
}

function drawChart(prices) {
  const W = 340, H = 200, L = 34, B = 26, T = 8, R = 4;
  const ys = prices.map((p) => p[1]);
  const min = Math.min(...ys), max = Math.max(...ys);
  const pad = (max - min) * 0.1 || 0.01;
  const lo = min - pad, hi = max + pad;
  const x = (i) => L + (i / (prices.length - 1)) * (W - L - R);
  const y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  const line = prices.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p[1]).toFixed(1)}`).join(" ");
  const area = `${line} L${x(prices.length - 1).toFixed(1)},${H - B} L${L},${H - B} Z`;

  let grid = "";
  for (let k = 0; k <= 4; k++) {
    const v = lo + ((hi - lo) * k) / 4;
    grid += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="rgba(255,255,255,0.06)"/>`;
    grid += `<text x="${L - 4}" y="${y(v) + 3}" fill="#8f9b97" font-size="9" text-anchor="end">${v.toFixed(2).replace(".", ",")}</text>`;
  }
  for (let k = 0; k <= 4; k++) {
    const i = Math.round(((prices.length - 1) * k) / 4);
    const d = new Date(prices[i][0]);
    const label = `${String(d.getHours()).padStart(2, "0")}:00`;
    const anchor = k === 0 ? "start" : k === 4 ? "end" : "middle";
    grid += `<text x="${x(i)}" y="${H - 8}" fill="#8f9b97" font-size="9" text-anchor="${anchor}">${label}</text>`;
  }

  $("chart").innerHTML = `
    <defs><linearGradient id="fillG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8ee6b8" stop-opacity="0.35"/><stop offset="1" stop-color="#8ee6b8" stop-opacity="0"/>
    </linearGradient></defs>
    ${grid}
    <path d="${area}" fill="url(#fillG)"/>
    <path d="${line}" fill="none" stroke="#8ee6b8" stroke-width="2" stroke-linejoin="round"/>`;

  const change = ((ys[ys.length - 1] - ys[0]) / ys[0]) * 100;
  $("chartChange").textContent = `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
  $("chartChange").classList.toggle("down", change < 0);
}

function hidePay() {
  $("payView").hidden = true;
  $("termsView").hidden = false;
  window.scrollTo(0, 0);
}

async function copyText(text, okMsg) {
  if (!text) return notify("Нечего копировать");
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    const t = document.createElement("textarea");
    t.value = text; document.body.appendChild(t); t.select();
    document.execCommand("copy"); t.remove();
  }
  tg?.HapticFeedback?.notificationOccurred("success");
  notify(okMsg);
}

// --- Экран оплаты другой криптовалютой ---
let cryptoChoice = null;
let cryptoAmountText = "";

function isPlaceholder(addr) {
  return !addr || addr.startsWith("ВСТАВЬТЕ");
}

function showCrypto() {
  $("coinGrid").innerHTML = CONFIG.crypto
    .map((c) => `<button class="coin-btn" data-crypto="${c.id}"><b>${c.coin}</b><span>${c.network}</span></button>`)
    .join("");
  document.querySelectorAll("[data-crypto]").forEach((b) => b.addEventListener("click", () => pickCrypto(b.dataset.crypto)));
  $("cryptoTitle").textContent = "ДРУГАЯ КРИПТОВАЛЮТА";
  $("cryptoPick").hidden = false;
  $("cryptoPay").hidden = true;
  $("checkoutView").hidden = true;
  $("cryptoView").hidden = false;
  window.scrollTo(0, 0);
}

function hideCrypto() {
  if (!$("cryptoPay").hidden) {
    // с реквизитов — обратно к выбору монеты
    $("cryptoPay").hidden = true;
    $("cryptoPick").hidden = false;
    $("cryptoTitle").textContent = "ДРУГАЯ КРИПТОВАЛЮТА";
  } else {
    $("cryptoView").hidden = true;
    $("checkoutView").hidden = false;
  }
  window.scrollTo(0, 0);
}

async function pickCrypto(id) {
  orderSent = false;
  const c = CONFIG.crypto.find((x) => x.id === id);
  cryptoChoice = c;
  const usd = priceFor(currentQty) * currentQty;

  $("cryptoTitle").textContent = `${c.coin} · ${c.network}`.toUpperCase();
  $("cryptoLabel").textContent = `Оплата ${c.coin} · ${c.network}`;
  $("cryptoSum").textContent = money(usd);
  $("cryptoQty").textContent = `${currentQty} ${word(currentQty)}`;
  $("cryptoCoin").textContent = c.coin;
  $("cryptoAddrLabel").textContent = `Адрес ${c.coin} · сеть ${c.network}`;
  $("cryptoRules").innerHTML = [
    `Отправляйте только ${c.coin} и только в сети ${c.network}`,
    "Отправьте ровно указанную сумму — по точной сумме система находит ваш заказ",
    "Учитывайте комиссию биржи или кошелька: до адреса должна дойти вся сумма",
    "После подтверждения сети IMEI придут в чат с ботом",
  ].map((t) => `<li>${t}</li>`).join("");

  const ph = isPlaceholder(c.address);
  $("cryptoAddress").textContent = ph ? "Адрес кошелька ещё не указан" : c.address;
  $("cryptoAddress").classList.toggle("placeholder", ph);

  $("cryptoPick").hidden = true;
  $("cryptoPay").hidden = false;
  window.scrollTo(0, 0);

  cryptoAmountText = "";
  $("cryptoAmount").textContent = "…";
  $("cryptoRate").textContent = "";

  try {
    let rate = 1;
    if (c.cg) {
      const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${c.cg}&vs_currencies=usd`);
      rate = (await r.json())[c.cg].usd;
    }
    const step = Math.pow(10, -c.decimals);
    const tail = (Math.floor(Math.random() * 900) + 100) * step; // уникальный хвост в последних знаках
    cryptoAmountText = (usd / rate + tail).toFixed(c.decimals);
    $("cryptoAmount").textContent = cryptoAmountText;
    $("cryptoRate").textContent = c.cg ? `1 ${c.coin} = ${rate.toLocaleString("en-US")} USD` : `1 ${c.coin} ≈ 1 USD`;
  } catch (e) {
    $("cryptoAmount").textContent = "—";
    $("cryptoRate").textContent = `Не удалось получить курс ${c.coin}. Попробуйте ещё раз.`;
  }
}

// --- Отправка заказа администратору на проверку ---
// Пока проверка ручная: заказ уходит админу в бот, он подтверждает оплату и отправляет ключи.
let orderSent = false;

async function submitOrder(method, amount) {
  if (orderSent) {
    return notify("Заказ уже отправлен на проверку. Как только оплата подтвердится, IMEI придут в чат с ботом.");
  }
  if (!tg?.initData) {
    return notify("Откройте магазин через бота в Telegram, чтобы оформить заказ.");
  }
  try {
    const r = await fetch(`${CONFIG.apiUrl}/api/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: tg.initData, qty: currentQty, method, amount }),
    });
    const data = await r.json();
    if (!data.ok) return notify(data.error || "Не удалось отправить заказ. Попробуйте ещё раз.");
    orderSent = true;
    tg?.HapticFeedback?.notificationOccurred("success");
    notify(`Заказ #${data.orderId} отправлен на проверку. Как только оплата подтвердится, IMEI придут в чат с ботом.`);
  } catch (e) {
    notify("Нет связи с сервером. Попробуйте ещё раз через минуту.");
  }
}

// Системная кнопка «назад» Telegram: с экрана TON — к заказу, с заказа — в магазин
function goBack() {
  if (!$("cryptoView").hidden) hideCrypto();
  else if (!$("payView").hidden) hidePay();
  else if (!$("termsView").hidden) hideTerms();
  else if (!$("tonView").hidden) hideTon();
  else hideCheckout();
}

$("coBack").addEventListener("click", hideCheckout);
$("tonBack").addEventListener("click", hideTon);
document.querySelectorAll("[data-coin]").forEach((b) => b.addEventListener("click", () => payCoin(b.dataset.coin)));
$("termsBack").addEventListener("click", hideTerms);
$("termsCheck").addEventListener("change", (e) => ($("termsOk").disabled = !e.target.checked));
$("termsOk").addEventListener("click", termsAccepted);
$("payBack").addEventListener("click", hidePay);
$("copyAmount").addEventListener("click", () => copyText(payAmountText, "Сумма скопирована"));
$("copyAddress").addEventListener("click", () => {
  const w = CONFIG.ton.wallet;
  if (!w || w.startsWith("ВСТАВЬТЕ")) return notify("Адрес кошелька ещё не указан");
  copyText(w, "Адрес скопирован");
});
$("checkNow").addEventListener("click", () => {
  if (!payAmountText) return notify("Сумма ещё не рассчитана. Откройте экран заново.");
  const net = currentCoin === "TON" ? "TON" : "USDT (сеть TON)";
  submitOrder(net, `${payAmountText} ${coinName()}`);
});
$("paySupport").addEventListener("click", () => openLink(CONFIG.links.support, "Контакты нашей поддержки указаны в описании бота"));
$("xrocketGuide").addEventListener("click", () => openLink(CONFIG.ton.xrocketGuide, "Гайд скоро появится"));
$("cryptoBack").addEventListener("click", hideCrypto);
$("cryptoCopyAmount").addEventListener("click", () => copyText(cryptoAmountText, "Сумма скопирована"));
$("cryptoCopyAddress").addEventListener("click", () => {
  if (!cryptoChoice || isPlaceholder(cryptoChoice.address)) return notify("Адрес кошелька ещё не указан");
  copyText(cryptoChoice.address, "Адрес скопирован");
});
$("cryptoCheck").addEventListener("click", () => {
  if (!cryptoChoice || !cryptoAmountText) return notify("Сумма ещё не рассчитана. Выберите монету заново.");
  submitOrder(`${cryptoChoice.coin} · ${cryptoChoice.network}`, `${cryptoAmountText} ${cryptoChoice.coin}`);
});
$("cryptoSupport").addEventListener("click", () => openLink(CONFIG.links.support, "Контакты нашей поддержки указаны в описании бота"));
tg?.BackButton?.onClick(goBack);

function notify(msg) {
  if (tg?.showAlert) tg.showAlert(msg);
  else alert(msg);
}

$("qtyQuick").addEventListener("input", () => showTotal("qtyQuick"));
document.querySelectorAll("[data-order]").forEach((btn) =>
  btn.addEventListener("click", () => order(parseInt($(btn.dataset.order).value, 10)))
);
document.querySelectorAll(".pack").forEach((btn) =>
  btn.addEventListener("click", () => order(parseInt(btn.dataset.qty, 10)))
);

// --- Нижние кнопки ---
function openLink(url, fallback) {
  if (!url) return notify(fallback);
  if (url.startsWith("https://t.me/") && tg?.openTelegramLink) tg.openTelegramLink(url);
  else if (tg?.openLink) tg.openLink(url);
  else window.open(url, "_blank");
}


$("btnSupport").addEventListener("click", () => openLink(CONFIG.links.support, "Контакты нашей поддержки указаны в описании бота"));
$("btnInfo").addEventListener("click", () => notify(CONFIG.info));
