const adminTabs = document.querySelectorAll("[data-admin-tab]");
const adminPanels = document.querySelectorAll("[data-admin-panel]");
const cloneData = (value) => JSON.parse(JSON.stringify(value || []));
const adminState = {
  news: cloneData(window.newsItems),
  events: cloneData(window.clubEvents),
};
const originalAdminState = cloneData(adminState);

const adminConfig = {
  news: {
    globalName: "newsItems",
    fileName: "news-data.js",
    fields: [
      { key: "date", label: "Datum", type: "date" },
      { key: "title", label: "Titel", type: "text" },
      { key: "image", label: "Bildpfad", type: "text" },
      { key: "alt", label: "Alt-Text", type: "text" },
      { key: "text", label: "Text", type: "textarea", wide: true },
    ],
    emptyItem: {
      date: new Date().toISOString().slice(0, 10),
      title: "Neue News",
      text: "Kurzer Text zur News.",
      image: "assets/news/50-years.png",
      alt: "News Bild",
    },
  },
  events: {
    globalName: "clubEvents",
    fileName: "events-data.js",
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
      date: new Date().toISOString().slice(0, 10),
      type: "club",
      title: "Neuer Termin",
      description: "Kurze Beschreibung des Termins.",
    },
  },
};

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

const validateNewsItem = (item) => {
  const warnings = [];
  if (!item.title?.trim()) warnings.push("Titel fehlt.");
  if (!item.date || Number.isNaN(parseDateKey(item.date).getTime())) warnings.push("Datum ist ungueltig.");
  if (!item.text?.trim()) warnings.push("Text fehlt.");
  if (!item.image?.trim()) warnings.push("Bildpfad fehlt.");
  return warnings;
};

const validateEventItem = (item) => {
  const warnings = [];
  const date = parseDateKey(item.date);
  if (!item.title?.trim()) warnings.push("Titel fehlt.");
  if (!item.date || Number.isNaN(date.getTime())) warnings.push("Datum ist ungueltig.");
  if (!item.description?.trim()) warnings.push("Beschreibung fehlt.");
  if (!eventTypeLabels[item.type]) warnings.push("Typ ist unbekannt.");
  if (!Number.isNaN(date.getTime()) && date < getToday()) warnings.push("Termin liegt in der Vergangenheit und wird auf der Website nicht angezeigt.");
  return warnings;
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

const renderField = (type, item, index, field, card, validator) => {
  const label = document.createElement("label");
  const labelText = document.createElement("span");
  const input = field.type === "textarea"
    ? document.createElement("textarea")
    : field.type === "select"
      ? document.createElement("select")
      : document.createElement("input");

  label.className = `admin-field${field.wide ? " is-wide" : ""}`;
  labelText.textContent = field.label;

  if (field.type === "select") {
    field.options.forEach((option) => {
      const optionElement = document.createElement("option");
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      input.append(optionElement);
    });
  } else if (field.type !== "textarea") {
    input.type = field.type;
  }

  input.value = item[field.key] || "";
  input.addEventListener("input", () => {
    adminState[type][index][field.key] = input.value;
    const cardTitle = card.querySelector(".admin-card-title strong");
    const validationList = card.querySelector(".admin-validation");
    if (cardTitle) {
      cardTitle.textContent = `${index + 1}. ${adminState[type][index].title || "Ohne Titel"}`;
    }
    validationList?.replaceWith(createValidationList(validator(adminState[type][index])));
    if (type === "news") {
      renderNewsPreview();
    } else {
      renderEventPreview();
    }
    updateOutput(type);
    updateStatus();
  });

  label.append(labelText, input);
  return label;
};

const renderEditorList = (type) => {
  const list = document.querySelector(`[data-admin-list="${type}"]`);
  const config = adminConfig[type];
  const validator = type === "news" ? validateNewsItem : validateEventItem;
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
    title.textContent = `${index + 1}. ${item.title || "Ohne Titel"}`;
    removeButton.type = "button";
    removeButton.textContent = "Entfernen";
    removeButton.addEventListener("click", () => {
      adminState[type].splice(index, 1);
      renderAdmin(type);
    });

    heading.append(title, removeButton);
    config.fields.forEach((field) => {
      fieldGrid.append(renderField(type, item, index, field, card, validator));
    });

    card.append(heading, fieldGrid, createValidationList(validator(item)));
    list.append(card);
  });
};

const renderNewsPreview = () => {
  const preview = document.querySelector('[data-admin-preview="news"]');
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

const renderEventPreview = () => {
  const preview = document.querySelector('[data-admin-preview="events"]');
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

const updateOutput = (type) => {
  document.querySelector(`[data-admin-output="${type}"]`).value = serializeDataFile(type);
};

const renderAdmin = (type) => {
  renderEditorList(type);
  if (type === "news") {
    renderNewsPreview();
  } else {
    renderEventPreview();
  }
  updateOutput(type);
  updateStatus();
};

adminTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const type = tab.dataset.adminTab;
    adminTabs.forEach((button) => button.classList.toggle("is-active", button === tab));
    adminPanels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.adminPanel === type));
  });
});

document.querySelectorAll("[data-admin-add]").forEach((button) => {
  button.addEventListener("click", () => {
    const type = button.dataset.adminAdd;
    adminState[type].unshift(cloneData(adminConfig[type].emptyItem));
    renderAdmin(type);
  });
});

document.querySelectorAll("[data-admin-reset]").forEach((button) => {
  button.addEventListener("click", () => {
    const type = button.dataset.adminReset;
    adminState[type] = cloneData(originalAdminState[type]);
    renderAdmin(type);
  });
});

document.querySelectorAll("[data-admin-download]").forEach((button) => {
  button.addEventListener("click", () => {
    const type = button.dataset.adminDownload;
    downloadTextFile(adminConfig[type].fileName, serializeDataFile(type));
  });
});

document.querySelectorAll("[data-admin-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const type = button.dataset.adminCopy;
    const text = serializeDataFile(type);
    await navigator.clipboard.writeText(text);
    const previousText = button.textContent;
    button.textContent = "Kopiert";
    window.setTimeout(() => {
      button.textContent = previousText;
    }, 1400);
  });
});

renderAdmin("news");
renderAdmin("events");
