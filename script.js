// ====================== НАСТРОЙКИ МАГАЗИНА ======================
// Меняй цены, тексты и ссылки здесь — остальной код трогать не нужно.
const CONFIG = {
  item: "ключ",                       // как называется товар
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
    subtitle: "При заказе от 10 ключей — +1 ключ в подарок",
    text: "+1 ключ при первой покупке от 10 шт.",
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
      note: "Проверяем перевод автоматически и сразу выдаём ключи после подтверждения сети" },
    { id: "card",   title: "Банковская карта", note: "Сбер, Т-Банк, Альфа, ВТБ, перевод по номеру карты" },
    { id: "crypto", title: "Другая криптовалюта", note: "USDT TRC20/BEP20, BTC, ETH, LTC, TRX, BNB" },
  ],

  info: "Ключи активируются в Steam / Epic / другой платформе, указанной в описании. После оплаты ключ приходит сюда в чат.",
};

// Данные пользователя. Пока нет сервера и базы — всё по нулям.
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

// --- Баланс ---
$("balance").textContent = USER.balance;
$("orders").textContent = USER.orders;
$("bought").textContent = USER.bought;

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

// --- Рефералы ---
const ref = CONFIG.referral;
const pct = Math.min(100, Math.round((USER.turnover / ref.unlockTurnover) * 100));
$("refSubtitle").textContent = `${ref.percent}% с покупок рефералов после ${money(ref.unlockTurnover)} оборота`;
$("refProgress").textContent = `${money(USER.turnover)} из ${money(ref.unlockTurnover)}`;
$("refPercent").textContent = `${pct}%`;
requestAnimationFrame(() => ($("refBar").style.width = `${pct}%`));
$("refLocked").innerHTML = pct >= 100
  ? "Реферальная система открыта 🎉"
  : `Реферальная система откроется после оборота <b>${money(ref.unlockTurnover)}</b><br>Осталось: <b>${money(ref.unlockTurnover - USER.turnover)}</b>`;

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
  window.scrollTo(0, 0);
  tg?.BackButton?.hide();
}

function pay(method) {
  const p = CONFIG.payments.find((x) => x.id === method);
  const sum = money(priceFor(currentQty) * currentQty);
  notify(`${p.title}: ${sum} за ${currentQty} ${word(currentQty)}.\n\nПриём оплаты пока не подключён.`);
}

$("coBack").addEventListener("click", hideCheckout);
tg?.BackButton?.onClick(hideCheckout);

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
$("btnReviews").addEventListener("click", () => openLink(CONFIG.links.reviews, "Отзывы скоро появятся"));
$("btnSupport").addEventListener("click", () => openLink(CONFIG.links.support, "Поддержка скоро будет подключена"));
$("btnInfo").addEventListener("click", () => notify(CONFIG.info));
