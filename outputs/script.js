const MADRID_TIME_ZONE = "Europe/Madrid";
const SESSION_WEEKDAY = 4;
const SESSION_HOUR = 22;
const SESSION_MINUTE = 0;
const PAGE_PASSWORD = "Z0Y%Uq2A9HfjQp8l";
const PASSWORD_SESSION_KEY = "teutonia-access-granted";
const VIDEO_DURATIONS_KEY = "teutonia-video-durations";

const videoQueue = [
  {
    id: "iHegj82a8w0",
    title: "¡¡¡HYPE!!!",
    duration: 600,
  },
  {
    id: "HNEyEWq08kw",
    title: "Por el mercado de Ciudadela Blanca …",
    duration: 600,
  },
  {
    id: "pICAha0nsb0",
    title: "¡¡¡ HYPE!!!",
    duration: 600,
  },
  {
    id: "vMxo_3oHULE",
    title: "¡A la taberna!",
    duration: 600,
  },
  {
    id: "uZTkg8GGEOo",
    title: "¡¡¡ HYPE!!!",
    duration: 600,
  },
  {
    id: "RPUTCXdlWqg",
    title: "¡Asesinos!",
    duration: 600,
  },
];

const firebaseConfig = window.teutoniaFirebaseConfig;
const CHAT_STORAGE_KEY = "teutonia-chat-messages";
const CHAT_NICK_KEY = "teutonia-chat-nick";
const chatChannel = "BroadcastChannel" in window ? new BroadcastChannel("teutonia-chat") : null;
let clockOffsetMs = 0;

const partsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: MADRID_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const nextSessionLabelFormatter = new Intl.DateTimeFormat("es-ES", {
  timeZone: MADRID_TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

const chatTimeFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "short",
  timeStyle: "short",
});

const elements = {
  days: document.querySelector("#days"),
  hours: document.querySelector("#hours"),
  minutes: document.querySelector("#minutes"),
  seconds: document.querySelector("#seconds"),
  nextSession: document.querySelector("#next-session"),
  videoTitle: document.querySelector("#video-title"),
  syncButton: document.querySelector("#sync-button"),
  sidebarToggle: document.querySelector("#sidebar-toggle"),
  sidebarScrim: document.querySelector("#sidebar-scrim"),
  chatStatus: document.querySelector("#chat-status"),
  chatLog: document.querySelector("#chat-log"),
  chatForm: document.querySelector("#chat-form"),
  chatNick: document.querySelector("#chat-nick"),
  chatMessage: document.querySelector("#chat-message"),
  passwordGate: document.querySelector("#password-gate"),
  passwordForm: document.querySelector("#password-form"),
  passwordInput: document.querySelector("#password-input"),
  passwordError: document.querySelector("#password-error"),
  emberCanvas: document.querySelector("#ember-canvas"),
};

let player;
let durationProbe;
let currentVideoId = null;
let lastSyncAt = 0;
let chatMessages = [];
let firebaseChat = null;
let durationsReady = false;
window.teutoniaVideoQueue = videoQueue;

function setupEmbers() {
  const canvas = elements.emberCanvas;
  const context = canvas?.getContext("2d");

  if (!canvas || !context || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const embers = [];
  let width = 0;
  let height = 0;
  let animationFrame = 0;

  function resize() {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function resetEmber(ember, initial = false) {
    ember.x = Math.random() * width;
    ember.y = initial ? Math.random() * height : height + Math.random() * 80;
    ember.size = 1.2 + Math.random() * 3.4;
    ember.speed = 0.25 + Math.random() * 0.85;
    ember.drift = -0.25 + Math.random() * 0.5;
    ember.alpha = 0.12 + Math.random() * 0.38;
    ember.life = Math.random() * Math.PI * 2;
  }

  function seedEmbers() {
    embers.length = 0;
    const amount = Math.max(36, Math.min(86, Math.round(width / 18)));

    for (let index = 0; index < amount; index += 1) {
      const ember = {};
      resetEmber(ember, true);
      embers.push(ember);
    }
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = "lighter";

    for (const ember of embers) {
      ember.life += 0.018;
      ember.y -= ember.speed;
      ember.x += ember.drift + Math.sin(ember.life) * 0.18;

      if (ember.y < -24 || ember.x < -24 || ember.x > width + 24) {
        resetEmber(ember);
      }

      const fade = Math.max(0, Math.min(1, ember.y / height));
      const alpha = ember.alpha * fade;
      const radius = ember.size * (1 + (1 - fade) * 1.6);
      const glow = context.createRadialGradient(ember.x, ember.y, 0, ember.x, ember.y, radius * 6);

      glow.addColorStop(0, `rgba(255, 213, 126, ${alpha})`);
      glow.addColorStop(0.34, `rgba(218, 97, 42, ${alpha * 0.62})`);
      glow.addColorStop(1, "rgba(218, 97, 42, 0)");

      context.fillStyle = glow;
      context.beginPath();
      context.arc(ember.x, ember.y, radius * 6, 0, Math.PI * 2);
      context.fill();
    }

    animationFrame = window.requestAnimationFrame(draw);
  }

  resize();
  seedEmbers();
  draw();

  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(animationFrame);
    resize();
    seedEmbers();
    draw();
  });
}

function nowMs() {
  return Date.now() + clockOffsetMs;
}

async function setupServerClock() {
  try {
    const response = await fetch(window.location.href, {
      method: "HEAD",
      cache: "no-store",
    });
    const serverDate = response.headers.get("date");

    if (serverDate) {
      clockOffsetMs = new Date(serverDate).getTime() - Date.now();
    }
  } catch {
    clockOffsetMs = 0;
  }
}

function applyCachedDurations() {
  try {
    const durations = JSON.parse(localStorage.getItem(VIDEO_DURATIONS_KEY) || "{}");
    for (const video of videoQueue) {
      if (Number.isFinite(durations[video.id]) && durations[video.id] > 0) {
        video.duration = durations[video.id];
      }
    }
  } catch {
    localStorage.removeItem(VIDEO_DURATIONS_KEY);
  }
}

function saveDurations() {
  const durations = Object.fromEntries(videoQueue.map((video) => [video.id, video.duration]));
  localStorage.setItem(VIDEO_DURATIONS_KEY, JSON.stringify(durations));
}

function unlockPage() {
  document.body.classList.remove("gate-locked");
  elements.passwordGate.classList.add("hidden");
  sessionStorage.setItem(PASSWORD_SESSION_KEY, "true");
}

function setupPasswordGate() {
  const isUnlocked = sessionStorage.getItem(PASSWORD_SESSION_KEY) === "true";

  if (isUnlocked) {
    unlockPage();
    return;
  }

  document.body.classList.add("gate-locked");
  elements.passwordGate.classList.remove("hidden");

  elements.passwordForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (elements.passwordInput.value === PAGE_PASSWORD) {
      elements.passwordError.textContent = "";
      unlockPage();
      return;
    }

    elements.passwordError.textContent = "Contraseña incorrecta.";
    elements.passwordInput.select();
  });
}

function setSidebar(open) {
  document.body.classList.toggle("sidebar-collapsed", !open);
  elements.sidebarToggle.setAttribute("aria-expanded", String(open));
  localStorage.setItem("teutonia-sidebar-open", String(open));
}

function restoreSidebar() {
  const savedState = localStorage.getItem("teutonia-sidebar-open");
  setSidebar(savedState !== "false");
}

function cleanInput(value, fallback = "") {
  const cleaned = value.trim().replace(/\s+/g, " ");
  return cleaned || fallback;
}

function getLocalChatMessages() {
  try {
    return JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocalChatMessages(messages) {
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages.slice(-80)));
}

function renderChatMessages(messages) {
  elements.chatLog.replaceChildren();

  if (messages.length === 0) {
    const empty = document.createElement("p");
    empty.className = "chat-empty";
    empty.textContent = "Todavia no hay mensajes.";
    elements.chatLog.append(empty);
    return;
  }

  for (const message of messages.slice(-80)) {
    const row = document.createElement("article");
    row.className = "chat-message";

    const meta = document.createElement("div");
    meta.className = "chat-message-meta";
    meta.textContent = `${chatTimeFormatter.format(new Date(message.createdAt))} · ${message.nick}`;

    const text = document.createElement("div");
    text.className = "chat-message-text";
    text.textContent = message.text;

    row.append(meta, text);
    elements.chatLog.append(row);
  }

  elements.chatLog.scrollTop = elements.chatLog.scrollHeight;
}

function addLocalChatMessage(message) {
  chatMessages = [...chatMessages, message].slice(-80);
  saveLocalChatMessages(chatMessages);
  renderChatMessages(chatMessages);
  chatChannel?.postMessage({ type: "message", message });
}

function setupChatForm(sendMessage) {
  elements.chatNick.value = localStorage.getItem(CHAT_NICK_KEY) || "";

  elements.chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nick = cleanInput(elements.chatNick.value, "Anonimo").slice(0, 24);
    const text = cleanInput(elements.chatMessage.value).slice(0, 280);

    if (!text) {
      return;
    }

    localStorage.setItem(CHAT_NICK_KEY, nick);
    elements.chatMessage.value = "";

    try {
      await sendMessage({ nick, text });
      elements.chatMessage.focus();
    } catch {
      elements.chatStatus.textContent = "No se pudo enviar. Reintentalo en un momento.";
      elements.chatMessage.value = text;
    }
  });
}

function setupLocalChat() {
  elements.chatStatus.textContent = "Canal local de prueba";
  chatMessages = getLocalChatMessages();
  renderChatMessages(chatMessages);

  chatChannel?.addEventListener("message", (event) => {
    if (event.data?.type !== "message") {
      return;
    }

    const exists = chatMessages.some((message) => message.id === event.data.message.id);
    if (!exists) {
      chatMessages = [...chatMessages, event.data.message].slice(-80);
      saveLocalChatMessages(chatMessages);
      renderChatMessages(chatMessages);
    }
  });

  setupChatForm(({ nick, text }) => {
    addLocalChatMessage({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: Date.now(),
      nick,
      text,
    });
  });
}

async function setupFirebaseChat() {
  elements.chatStatus.textContent = "Conectando chat en tiempo real...";

  const [
    appModule,
    authModule,
    databaseModule,
  ] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js"),
    import("https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js"),
  ]);

  const app = appModule.initializeApp(firebaseConfig);
  const auth = authModule.getAuth(app);
  await authModule.signInAnonymously(auth);

  const database = databaseModule.getDatabase(app);
  const chatRef = databaseModule.ref(database, "teutoniaChat");
  const recentMessagesQuery = databaseModule.query(
    chatRef,
    databaseModule.orderByChild("createdAt"),
    databaseModule.limitToLast(80),
  );

  firebaseChat = {
    databaseModule,
    chatRef,
  };

  elements.chatStatus.textContent = "Chat en tiempo real";

  databaseModule.onValue(recentMessagesQuery, (snapshot) => {
    const messages = [];
    snapshot.forEach((child) => {
      messages.push({
        id: child.key,
        ...child.val(),
      });
    });
    chatMessages = messages.sort((a, b) => a.createdAt - b.createdAt);
    renderChatMessages(chatMessages);
  });

  setupChatForm(({ nick, text }) => {
    const messageRef = firebaseChat.databaseModule.push(firebaseChat.chatRef);
    return firebaseChat.databaseModule.set(messageRef, {
      createdAt: Date.now(),
      nick,
      text,
    });
  });
}

async function setupChat() {
  if (!firebaseConfig) {
    setupLocalChat();
    return;
  }

  try {
    await setupFirebaseChat();
  } catch {
    elements.chatStatus.textContent = "Firebase no esta conectado. Usando chat local.";
    setupLocalChat();
  }
}

function getMadridParts(date) {
  const parts = Object.fromEntries(
    partsFormatter.formatToParts(date).map((part) => [part.type, part.value]),
  );

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function getOffsetMs(utcMs) {
  const parts = getMadridParts(new Date(utcMs));
  const localAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return localAsUtc - utcMs;
}

function madridDateToUtcMs(year, month, day, hour, minute, second = 0) {
  const roughUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  const firstPass = roughUtc - getOffsetMs(roughUtc);
  return roughUtc - getOffsetMs(firstPass);
}

function madridWeekday(parts) {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();
}

function nextSessionUtcMs(now = new Date()) {
  const nowMs = now.getTime();
  const madridNow = getMadridParts(now);
  const todayWeekday = madridWeekday(madridNow);
  let daysUntil = (SESSION_WEEKDAY - todayWeekday + 7) % 7;

  if (
    daysUntil === 0 &&
    (madridNow.hour > SESSION_HOUR ||
      (madridNow.hour === SESSION_HOUR && madridNow.minute >= SESSION_MINUTE))
  ) {
    daysUntil = 7;
  }

  const candidateDate = new Date(
    Date.UTC(madridNow.year, madridNow.month - 1, madridNow.day + daysUntil),
  );

  let targetUtc = madridDateToUtcMs(
    candidateDate.getUTCFullYear(),
    candidateDate.getUTCMonth() + 1,
    candidateDate.getUTCDate(),
    SESSION_HOUR,
    SESSION_MINUTE,
  );

  if (targetUtc <= nowMs) {
    const nextWeek = new Date(Date.UTC(
      candidateDate.getUTCFullYear(),
      candidateDate.getUTCMonth(),
      candidateDate.getUTCDate() + 7,
    ));
    targetUtc = madridDateToUtcMs(
      nextWeek.getUTCFullYear(),
      nextWeek.getUTCMonth() + 1,
      nextWeek.getUTCDate(),
      SESSION_HOUR,
      SESSION_MINUTE,
    );
  }

  return targetUtc;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatNextSessionLabel(targetMs) {
  const parts = Object.fromEntries(
    nextSessionLabelFormatter.formatToParts(new Date(targetMs)).map((part) => [
      part.type,
      part.value,
    ]),
  );
  const label = `PROXIMA PARTIDA . ${parts.weekday} ${Number(parts.day)} DE ${parts.month} ${parts.hour}:${parts.minute}`;
  return label.toUpperCase();
}

function updateCountdown() {
  const currentMs = nowMs();
  const targetMs = nextSessionUtcMs(new Date(currentMs));
  const diffSeconds = Math.max(0, Math.floor((targetMs - currentMs) / 1000));
  const days = Math.floor(diffSeconds / 86400);
  const hours = Math.floor((diffSeconds % 86400) / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = diffSeconds % 60;

  elements.days.textContent = pad(days);
  elements.hours.textContent = pad(hours);
  elements.minutes.textContent = pad(minutes);
  elements.seconds.textContent = pad(seconds);
  elements.nextSession.textContent = formatNextSessionLabel(targetMs);
}

function getSyncedVideo() {
  const totalDuration = videoQueue.reduce((sum, video) => sum + video.duration, 0);
  const globalSecond = Math.floor(nowMs() / 1000);
  let position = ((globalSecond % totalDuration) + totalDuration) % totalDuration;

  for (const video of videoQueue) {
    if (position < video.duration) {
      return {
        video,
        startSeconds: position,
      };
    }
    position -= video.duration;
  }

  return {
    video: videoQueue[0],
    startSeconds: 0,
  };
}

function syncPlayer(force = false) {
  if (!player || typeof player.loadVideoById !== "function") {
    return;
  }

  const now = Date.now();
  const { video, startSeconds } = getSyncedVideo();
  const playerState = typeof player.getPlayerState === "function" ? player.getPlayerState() : null;
  const currentTime = typeof player.getCurrentTime === "function" ? player.getCurrentTime() : 0;
  const drift = Math.abs(currentTime - startSeconds);

  if (playerState === YT.PlayerState.ENDED) {
    currentVideoId = video.id;
    elements.videoTitle.textContent = video.title;
    player.loadVideoById({
      videoId: video.id,
      startSeconds: Math.max(0, Math.floor(startSeconds)),
    });
    lastSyncAt = now;
    return;
  }

  if (force || currentVideoId !== video.id) {
    currentVideoId = video.id;
    elements.videoTitle.textContent = video.title;
    player.loadVideoById({
      videoId: video.id,
      startSeconds: Math.max(0, Math.floor(startSeconds)),
    });
    lastSyncAt = now;
    return;
  }

  if (now - lastSyncAt > 15000 && drift > 2.5) {
    player.seekTo(startSeconds, true);
    lastSyncAt = now;
  }

  if (playerState === YT.PlayerState.CUED || playerState === YT.PlayerState.PAUSED) {
    player.playVideo();
  }
}

function waitForDuration(videoId) {
  return new Promise((resolve) => {
    let attempts = 0;
    durationProbe.cueVideoById({ videoId });

    const timer = window.setInterval(() => {
      attempts += 1;
      const duration = Math.floor(durationProbe.getDuration?.() || 0);

      if (duration > 0 || attempts > 24) {
        window.clearInterval(timer);
        resolve(duration);
      }
    }, 250);
  });
}

async function probeVideoDurations() {
  if (!durationProbe || typeof durationProbe.cueVideoById !== "function") {
    return;
  }

  for (const video of videoQueue) {
    const duration = await waitForDuration(video.id);
    if (duration > 0) {
      video.duration = duration;
    }
  }

  durationsReady = true;
  saveDurations();
  syncPlayer(true);
}

window.onYouTubeIframeAPIReady = function onYouTubeIframeAPIReady() {
  const { video, startSeconds } = getSyncedVideo();
  currentVideoId = video.id;
  elements.videoTitle.textContent = video.title;

  player = new YT.Player("player", {
    width: "100%",
    height: "100%",
    videoId: video.id,
    playerVars: {
      autoplay: 1,
      controls: 1,
      modestbranding: 1,
      rel: 0,
      start: Math.floor(startSeconds),
    },
    events: {
      onReady: () => syncPlayer(true),
      onStateChange: () => syncPlayer(),
    },
  });

  durationProbe = new YT.Player("duration-probe", {
    width: "1",
    height: "1",
    videoId: videoQueue[0].id,
    playerVars: {
      controls: 0,
      disablekb: 1,
      modestbranding: 1,
    },
    events: {
      onReady: () => probeVideoDurations(),
    },
  });
};

elements.syncButton.addEventListener("click", () => syncPlayer(true));
elements.sidebarToggle.addEventListener("click", () => {
  setSidebar(document.body.classList.contains("sidebar-collapsed"));
});
elements.sidebarScrim.addEventListener("click", () => setSidebar(false));

applyCachedDurations();
setupEmbers();
setupPasswordGate();
restoreSidebar();
setupChat();
setupServerClock().finally(() => {
  updateCountdown();
  syncPlayer(true);
});
updateCountdown();
setInterval(updateCountdown, 1000);
setInterval(() => syncPlayer(), 5000);
