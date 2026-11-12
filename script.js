// Объект Telegram Mini App (в обычном браузере его не будет — страница всё равно откроется)
const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();   // сообщаем Telegram, что приложение загрузилось
  tg.expand();  // разворачиваем на всю высоту
}

// --- Профиль пользователя ---
const user = tg?.initDataUnsafe?.user;
const usernameEl = document.getElementById("username");
const avatarEl = document.getElementById("avatar");

if (user) {
  usernameEl.textContent = [user.first_name, user.last_name].filter(Boolean).join(" ");
  if (user.photo_url) {
    const img = document.createElement("img");
    img.src = user.photo_url;
    img.alt = "";
    avatarEl.textContent = "";
    avatarEl.appendChild(img);
  } else {
    avatarEl.textContent = user.first_name[0].toUpperCase();
  }
  document.getElementById("name").value = user.first_name;
}

document.getElementById("platform").textContent = tg
  ? `Telegram ${tg.platform} · версия API ${tg.version}`
  : "Открыто в браузере — откройте через бота, чтобы увидеть данные Telegram";

// --- Счётчик ---
let count = 0;
const countEl = document.getElementById("count");

function changeCount(delta) {
  count += delta;
  countEl.textContent = count;
  tg?.HapticFeedback?.impactOccurred("light"); // лёгкая вибрация на телефоне
}

document.getElementById("plus").addEventListener("click", () => changeCount(1));
document.getElementById("minus").addEventListener("click", () => changeCount(-1));

// --- Форма и главная кнопка Telegram ---
const nameInput = document.getElementById("name");
const messageInput = document.getElementById("message");

function updateMainButton() {
  if (!tg) return;
  if (messageInput.value.trim()) {
    tg.MainButton.setText("Отправить");
    tg.MainButton.show();
  } else {
    tg.MainButton.hide();
  }
}

messageInput.addEventListener("input", updateMainButton);

tg?.MainButton.onClick(() => {
  const name = nameInput.value.trim() || "Без имени";
  const text = messageInput.value.trim();
  tg.showPopup(
    {
      title: "Готово ✅",
      message: `${name}, твоё сообщение получено:\n«${text}»\nСчётчик: ${count}`,
      buttons: [{ type: "ok" }],
    },
    () => {
      messageInput.value = "";
      updateMainButton();
    }
  );
});
