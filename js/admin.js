const cloneData = (value) => JSON.parse(JSON.stringify(value || []));
const todayKey = () => new Date().toISOString().slice(0, 10);

const adminConfig = {
  news: {
    label: "News",
    title: "Startseiten-News bearbeiten",
    addLabel: "News hinzufuegen",
    previewTitle: "News-Karte",
    globalName: "newsItems",
    fileName: "news-data.js",
    getData: () => window.newsItems,
    fields: [
      { key: "date", label: "Datum", type: "date" },
      { key: "title", label: "Titel", type: "text" },
      { key: "image", label: "Bildpfad", type: "text" },
      { key: "alt", label: "Alt-Text", type: "text" },
      { key: "text", label: "Text", type: "textarea", wide: true },
    ],
    emptyItem: {
      date: todayKey(),
      title: "Neue News",
      text: "Kurzer Text zur News.",
      image: "assets/news/50-years.png",
      alt: "News Bild",
    },
  },
  events: {
    label: "Kalender",
    title: "Termine bearbeiten",
    addLabel: "Termin hinzufuegen",
    previewTitle: "Kalender-Eintrag",
    globalName: "clubEvents",
    fileName: "events-data.js",
    getData: () => window.clubEvents,
    fields: [
      { key: "date", label: "Datum", type: "date" },
      {
        key: "type",
        label: "Typ",
        type: "select",
        options: [
          { value: "club", label: "Club" },
          { value: "match", label: "Spielbetrieb" },
          { value: "junior", label: "Junioren" },
          { value: "event", label: "Event" },
        ],
      },
      { key: "title", label: "Titel", type: "text", wide: true },
      { key: "description", label: "Beschreibung", type: "textarea", wide: true },
    ],
    emptyItem: {
      date: todayKey(),
      type: "club",
      title: "Neuer Termin",
      description: "Kurze Beschreibung des Termins.",
    },
  },
  sponsors: {
    label: "Sponsoren",
    title: "Sponsoren bearbeiten",
    addLabel: "Sponsor hinzufuegen",
    previewTitle: "Sponsor",
    globalName: "sponsors",
    fileName: "sponsors-data.js",
    getData: () => window.sponsors,
    fields: [
      { key: "name", label: "Name", type: "text", wide: true },
      { key: "logo", label: "Logo-Pfad", type: "text", wide: true },
    ],
    emptyItem: {
      name: "Neuer Sponsor",
      logo: "assets/sponsors/sponsor-1.svg",
    },
  },
  membership: {
    label: "Mitgliedschaft",
    title: "Mitgliedschaftspreise bearbeiten",
    addLabel: "Preis hinzufuegen",
    previewTitle: "Preis-Karte",
    globalName: "membershipPrices",
    fileName: "membership-data.js",
    getData: () => window.membershipPrices,
    fields: [
      { key: "title", label: "Titel", type: "text" },
      { key: "price", label: "Preis CHF", type: "text" },
      { key: "info", label: "Info", type: "textarea", wide: true },
      { key: "highlighted", label: "Hervorgehoben", type: "checkbox" },
      { key: "passive", label: "Passiv", type: "checkbox" },
    ],
    emptyItem: {
      title: "Neuer Tarif",
      price: "0",
      info: "Beschreibung des Tarifs.",
      highlighted: false,
      passive: false,
    },
  },
  matches: {
    label: "Matches",
    title: "Spielbetrieb-Matches bearbeiten",
    addLabel: "Match hinzufuegen",
    previewTitle: "Match",
    globalName: "matches",
    fileName: "matches-data.js",
    getData: () => window.matches,
    fields: [
      { key: "date", label: "Datum", type: "date" },
      { key: "time", label: "Zeit", type: "time" },
      { key: "label", label: "Kategorie", type: "text" },
      { key: "labelClass", label: "Kategorie CSS", type: "text" },
      { key: "title", label: "Titel", type: "text", wide: true },
      { key: "description", label: "Beschreibung", type: "textarea", wide: true },
      { key: "status", label: "Status", type: "text" },
      { key: "statusClass", label: "Status CSS", type: "text" },
    ],
    emptyItem: {
      date: todayKey(),
      time: "10:00",
      label: "Interclub",
      title: "Neues Match",
      description: "Details folgen.",
      status: "Geplant",
    },
  },
  board: {
    label: "Vorstand",
    title: "Vorstand bearbeiten",
    addLabel: "Person hinzufuegen",
    previewTitle: "Vorstandsmitglied",
    globalName: "vorstandMembers",
    fileName: "vorstand-data.js",
    getData: () => window.vorstandMembers,
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "role", label: "Rolle", type: "text" },
      { key: "email", label: "E-Mail", type: "email" },
      { key: "phone", label: "Telefon", type: "tel" },
      { key: "image", label: "Bildpfad", type: "text", wide: true },
    ],
    emptyItem: {
      name: "Neue Person",
      role: "Funktion",
      email: "office@tceschen-mauren.li",
      phone: "+423 ",
      image: "assets/vorstand/placeholder.png",
    },
  },
};

const adminTypes = Object.keys(adminConfig);
const adminState = Object.fromEntries(adminTypes.map((type) => [type, cloneData(adminConfig[type].getData())]));
const originalAdminState = cloneData(adminState);

const monthNames = [
  "Januar",
  "Februar",
  "Maerz",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];
const weekdays = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const eventTypeLabels = {
  club: "Club",
  match: "Spielbetrieb",
  junior: "Junioren",
  event: "Event",
};

const parseDateKey = (dateKey) => {
  if (typeof dateKey !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return new Date(NaN);
  }

  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatDisplayDate = (dateKey) => {
  const date = parseDateKey(dateKey);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getDate()}. ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
};

const sortByDateAscending = (items) => [...items].sort((first, second) => parseDateKey(first.date) - parseDateKey(second.date));
const sortByDateDescending = (items) => [...items].sort((first, second) => parseDateKey(second.date) - parseDateKey(first.date));

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const serializeDataFile = (type) => `window.${adminConfig[type].globalName} = ${JSON.stringify(adminState[type], null, 2)};\n`;

const downloadTextFile = (fileName, content) => {
  const blob = new Blob([content], { type: "text/javascript;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

const updateStatus = () => {
  const upcomingEvents = sortByDateAscending(adminState.events).filter((event) => {
    const date = parseDateKey(event.date);
    return !Number.isNaN(date.getTime()) && date >= getToday();
  });

  document.querySelector("[data-admin-news-count]").textContent = String(adminState.news.length);
  document.querySelector("[data-admin-event-count]").textContent = String(adminState.events.length);
  document.querySelector("[data-admin-next-event]").textContent = upcomingEvents[0]?.date ? formatDisplayDate(upcomingEvents[0].date) : "-";
};

const validateRequiredFields = (item, fields) => {
  const warnings = [];
  fields.forEach((field) => {
    if (field.type === "checkbox") return;
    if (["labelClass", "statusClass", "alt"].includes(field.key)) return;
    if (!String(item[field.key] || "").trim()) warnings.push(`${field.label} fehlt.`);
  });
  return warnings;
};

const validateItem = (type, item) => {
  const warnings = validateRequiredFields(item, adminConfig[type].fields);

  if (["news", "events", "matches"].includes(type)) {
    const date = parseDateKey(item.date);
    if (!item.date || Number.isNaN(date.getTime())) warnings.push("Datum ist ungueltig.");
    if (type === "events" && !Number.isNaN(date.getTime()) && date < getToday()) {
      warnings.push("Termin liegt in der Vergangenheit und wird auf der Website nicht angezeigt.");
    }
  }

  if (type === "events" && !eventTypeLabels[item.type]) warnings.push("Typ ist unbekannt.");
  return [...new Set(warnings)];
};

const createValidationList = (warnings) => {
  const list = document.createElement("ul");
  list.className = "admin-validation";
  warnings.forEach((warning) => {
    const item = document.createElement("li");
    item.textContent = warning;
    list.append(item);
  });
  return list;
};

const renderAdminShell = () => {
  const tabs = document.querySelector("[data-admin-tabs]");
  const panels = document.querySelector("[data-admin-panels]");

  tabs.innerHTML = "";
  panels.innerHTML = "";

  adminTypes.forEach((type, index) => {
    const config = adminConfig[type];
    const tab = document.createElement("button");
    const panel = document.createElement("section");

    tab.className = index === 0 ? "is-active" : "";
    tab.type = "button";
    tab.dataset.adminTab = type;
    tab.textContent = config.label;

    panel.className = `admin-panel${index === 0 ? " is-active" : ""}`;
    panel.dataset.adminPanel = type;
    panel.innerHTML = `
      <div class="admin-panel-header">
        <div>
          <p class="eyebrow">${config.label}</p>
          <h2>${config.title}</h2>
        </div>
        <div class="admin-actions">
          <button class="button secondary" type="button" data-admin-add="${type}">${config.addLabel}</button>
          <button class="button secondary" type="button" data-admin-reset="${type}">Zuruecksetzen</button>
          <button class="button primary" type="button" data-admin-save="${type}">Speichern</button>
          <button class="button primary" type="button" data-admin-download="${type}">${config.fileName} laden</button>
        </div>
      </div>

      <div class="admin-editor-layout">
        <div class="admin-editor-list" data-admin-list="${type}"></div>
        <aside class="admin-preview">
          <div class="admin-preview-heading">
            <span>Live Preview</span>
            <strong>${config.previewTitle}</strong>
          </div>
          <div class="admin-generic-preview" data-admin-preview="${type}"></div>
          <label class="admin-output">
            <span>Export Inhalt</span>
            <textarea data-admin-output="${type}" readonly></textarea>
          </label>
          <button class="admin-copy-button" type="button" data-admin-copy="${type}">In Zwischenablage kopieren</button>
        </aside>
      </div>
    `;

    tabs.append(tab);
    panels.append(panel);
  });
};

const renderField = (type, item, index, field, card) => {
  const label = document.createElement("label");
  const labelText = document.createElement("span");
  const input = field.type === "textarea"
    ? document.createElement("textarea")
    : field.type === "select"
      ? document.createElement("select")
      : document.createElement("input");

  label.className = `admin-field${field.wide ? " is-wide" : ""}${field.type === "checkbox" ? " is-checkbox" : ""}`;
  labelText.textContent = field.label;

  if (field.type === "select") {
    field.options.forEach((option) => {
      const optionElement = document.createElement("option");
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      input.append(optionElement);
    });
  } else if (field.type === "checkbox") {
    input.type = "checkbox";
    input.checked = Boolean(item[field.key]);
  } else if (field.type !== "textarea") {
    input.type = field.type;
  }

  if (field.type !== "checkbox") {
    input.value = item[field.key] || "";
  }

  input.addEventListener("input", () => {
    adminState[type][index][field.key] = field.type === "checkbox" ? input.checked : input.value;
    const cardTitle = card.querySelector(".admin-card-title strong");
    const validationList = card.querySelector(".admin-validation");
    if (cardTitle) {
      cardTitle.textContent = `${index + 1}. ${adminState[type][index].title || adminState[type][index].name || "Ohne Titel"}`;
    }
    validationList?.replaceWith(createValidationList(validateItem(type, adminState[type][index])));
    renderPreview(type);
    updateOutput(type);
    updateStatus();
  });

  label.append(labelText, input);
  return label;
};

const renderEditorList = (type) => {
  const list = document.querySelector(`[data-admin-list="${type}"]`);
  const config = adminConfig[type];
  list.innerHTML = "";

  adminState[type].forEach((item, index) => {
    const card = document.createElement("article");
    const heading = document.createElement("div");
    const title = document.createElement("strong");
    const removeButton = document.createElement("button");
    const fieldGrid = document.createElement("div");

    card.className = "admin-edit-card";
    heading.className = "admin-card-title";
    fieldGrid.className = "admin-field-grid";
    title.textContent = `${index + 1}. ${item.title || item.name || "Ohne Titel"}`;
    removeButton.type = "button";
    removeButton.textContent = "Entfernen";
    removeButton.addEventListener("click", () => {
      adminState[type].splice(index, 1);
      renderAdmin(type);
    });

    heading.append(title, removeButton);
    config.fields.forEach((field) => {
      fieldGrid.append(renderField(type, item, index, field, card));
    });

    card.append(heading, fieldGrid, createValidationList(validateItem(type, item)));
    list.append(card);
  });
};

const createPreviewCard = (item, rows = []) => {
  const card = document.createElement("article");
  const title = document.createElement("h3");

  card.className = "admin-simple-preview";
  title.textContent = item.title || item.name || "Ohne Titel";
  card.append(title);

  rows.filter(Boolean).forEach((row) => {
    const element = document.createElement("p");
    element.textContent = row;
    card.append(element);
  });

  return card;
};

const renderNewsPreview = (preview) => {
  const latestNews = sortByDateDescending(adminState.news)[0];
  preview.innerHTML = "";

  if (!latestNews) {
    preview.innerHTML = "<p>Keine News vorhanden.</p>";
    return;
  }

  const card = document.createElement("article");
  const image = document.createElement("img");
  const content = document.createElement("div");
  const time = document.createElement("time");
  const title = document.createElement("h3");
  const text = document.createElement("p");

  card.className = "news-card";
  image.src = latestNews.image || "assets/news/50-years.png";
  image.alt = latestNews.alt || latestNews.title || "News Bild";
  image.className = "is-loaded";
  content.className = "news-card-content";
  time.dateTime = latestNews.date || "";
  time.textContent = latestNews.date ? formatDisplayDate(latestNews.date) : "";
  title.textContent = latestNews.title || "";
  text.textContent = latestNews.text || "";

  content.append(time, title, text);
  card.append(image, content);
  preview.append(card);
};

const renderEventPreview = (preview) => {
  const event = sortByDateAscending(adminState.events).find((item) => parseDateKey(item.date) >= getToday()) || adminState.events[0];
  preview.innerHTML = "";

  if (!event) {
    preview.innerHTML = "<p>Keine Termine vorhanden.</p>";
    return;
  }

  const date = parseDateKey(event.date);
  const tagClass = ["match", "junior", "event"].includes(event.type) ? ` ${event.type}` : "";
  const eventElement = document.createElement("article");
  const time = document.createElement("time");
  const month = document.createElement("span");
  const day = document.createElement("strong");
  const weekday = document.createElement("small");
  const content = document.createElement("div");
  const tag = document.createElement("span");
  const title = document.createElement("h3");
  const description = document.createElement("p");

  eventElement.className = "calendar-event";
  time.className = "calendar-date";
  time.dateTime = event.date || "";
  month.textContent = Number.isNaN(date.getTime()) ? "-" : monthNames[date.getMonth()].slice(0, 3);
  day.textContent = Number.isNaN(date.getTime()) ? "--" : String(date.getDate()).padStart(2, "0");
  weekday.textContent = Number.isNaN(date.getTime()) ? "-" : weekdays[date.getDay()];
  content.className = "calendar-event-content";
  tag.className = `calendar-tag${tagClass}`;
  tag.textContent = eventTypeLabels[event.type] || eventTypeLabels.club;
  title.textContent = event.title || "";
  description.textContent = event.description || "";

  time.append(month, day, weekday);
  content.append(tag, title, description);
  eventElement.append(time, content);
  preview.append(eventElement);
};

const renderPreview = (type) => {
  const preview = document.querySelector(`[data-admin-preview="${type}"]`);
  const firstItem = adminState[type][0];
  preview.innerHTML = "";

  if (type === "news") {
    renderNewsPreview(preview);
    return;
  }

  if (type === "events") {
    renderEventPreview(preview);
    return;
  }

  if (!firstItem) {
    preview.innerHTML = "<p>Keine Eintraege vorhanden.</p>";
    return;
  }

  if (type === "sponsors") {
    const card = createPreviewCard(firstItem, [firstItem.logo]);
    const image = document.createElement("img");
    image.src = firstItem.logo || "assets/sponsors/sponsor-1.svg";
    image.alt = firstItem.name || "Sponsor";
    image.className = "admin-preview-logo";
    card.prepend(image);
    preview.append(card);
    return;
  }

  if (type === "membership") {
    preview.append(createPreviewCard(firstItem, [`CHF ${firstItem.price}`, firstItem.info]));
    return;
  }

  if (type === "matches") {
    preview.append(createPreviewCard(firstItem, [`${formatDisplayDate(firstItem.date)} - ${firstItem.time}`, firstItem.label, firstItem.description, firstItem.status]));
    return;
  }

  if (type === "board") {
    const card = createPreviewCard(firstItem, [firstItem.role, firstItem.email, firstItem.phone]);
    const image = document.createElement("img");
    image.src = firstItem.image || "assets/vorstand/placeholder.png";
    image.alt = firstItem.name || "Vorstandsmitglied";
    image.className = "admin-preview-avatar";
    card.prepend(image);
    preview.append(card);
  }
};

const updateOutput = (type) => {
  document.querySelector(`[data-admin-output="${type}"]`).value = serializeDataFile(type);
};

const getAdminSaveEndpoint = () => {
  if (window.TCEM_ADMIN_SAVE_ENDPOINT) {
    return window.TCEM_ADMIN_SAVE_ENDPOINT;
  }

  if (window.location.hostname.endsWith("github.io")) {
    return "https://tcem-admin-save.tcem-admin-save.workers.dev/api/admin/save";
  }

  return "/api/admin/save";
};

const setSaveStatus = (message, mode = "idle") => {
  const status = document.querySelector("[data-admin-save-status]");
  status.textContent = message;
  status.dataset.mode = mode;
};

const saveDataFile = async (type) => {
  const config = adminConfig[type];
  const body = JSON.stringify({
    type,
    fileName: config.fileName,
    content: serializeDataFile(type),
  });
  const response = await fetch(getAdminSaveEndpoint(), {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body,
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "Speichern fehlgeschlagen.");
  }

  return payload;
};

const renderAdmin = (type) => {
  renderEditorList(type);
  renderPreview(type);
  updateOutput(type);
  updateStatus();
};

const activatePanel = (type) => {
  document.querySelectorAll("[data-admin-tab]").forEach((button) => button.classList.toggle("is-active", button.dataset.adminTab === type));
  document.querySelectorAll("[data-admin-panel]").forEach((panel) => panel.classList.toggle("is-active", panel.dataset.adminPanel === type));
};

renderAdminShell();

document.querySelector("[data-admin-tabs]").addEventListener("click", (event) => {
  const tab = event.target.closest("[data-admin-tab]");
  if (!tab) return;
  activatePanel(tab.dataset.adminTab);
});

document.querySelector("[data-admin-panels]").addEventListener("click", async (event) => {
  const addButton = event.target.closest("[data-admin-add]");
  const resetButton = event.target.closest("[data-admin-reset]");
  const saveButton = event.target.closest("[data-admin-save]");
  const downloadButton = event.target.closest("[data-admin-download]");
  const copyButton = event.target.closest("[data-admin-copy]");

  if (addButton) {
    const type = addButton.dataset.adminAdd;
    adminState[type].unshift(cloneData(adminConfig[type].emptyItem));
    renderAdmin(type);
    return;
  }

  if (resetButton) {
    const type = resetButton.dataset.adminReset;
    adminState[type] = cloneData(originalAdminState[type]);
    renderAdmin(type);
    return;
  }

  if (saveButton) {
    const type = saveButton.dataset.adminSave;
    const previousText = saveButton.textContent;
    saveButton.disabled = true;
    saveButton.textContent = "Speichert...";
    setSaveStatus(`${adminConfig[type].fileName} wird gespeichert...`, "pending");

    try {
      const result = await saveDataFile(type);
      setSaveStatus(`Gespeichert von ${result.actor || "Admin"}: ${result.fileName}`, "success");
    } catch (error) {
      setSaveStatus(error.message, "error");
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = previousText;
    }
    return;
  }

  if (downloadButton) {
    const type = downloadButton.dataset.adminDownload;
    downloadTextFile(adminConfig[type].fileName, serializeDataFile(type));
    return;
  }

  if (copyButton) {
    const type = copyButton.dataset.adminCopy;
    const text = serializeDataFile(type);
    await navigator.clipboard.writeText(text);
    const previousText = copyButton.textContent;
    copyButton.textContent = "Kopiert";
    window.setTimeout(() => {
      copyButton.textContent = previousText;
    }, 1400);
  }
});

adminTypes.forEach(renderAdmin);
