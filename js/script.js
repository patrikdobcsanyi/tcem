const header = document.querySelector(".site-header");
const toggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const dropdowns = document.querySelectorAll(".nav-dropdown");
const galleryFilters = document.querySelectorAll(".gallery-filter");
const galleryGrid = document.querySelector("[data-gallery-grid]");
const galleryStory = document.querySelector("[data-gallery-story]");
const clubPulse = document.querySelector("[data-club-pulse]");
const newsGrid = document.querySelector("[data-news-grid]");
const sponsorRotator = document.querySelector("[data-sponsor-rotator]");
const calendarGrid = document.querySelector("[data-calendar-grid]");
const calendarTitle = document.querySelector("[data-calendar-title]");
const calendarPrev = document.querySelector("[data-calendar-prev]");
const calendarNext = document.querySelector("[data-calendar-next]");
const calendarEventsList = document.querySelector("[data-calendar-events]");
const calendarToggle = document.querySelector("[data-calendar-toggle]");
const vorstandTrack = document.querySelector("[data-vorstand-track]");
const clubTimeline = document.querySelector("[data-club-timeline]");
const pricingGrid = document.querySelector("[data-pricing-grid]");
const teamLists = document.querySelectorAll("[data-team-list]");
const padelOfferLists = document.querySelectorAll("[data-padel-offers]");
const matchdaySection = document.querySelector("[data-matchday]");
const matchCalendar = document.querySelector("[data-match-calendar]");
const gvProtocolList = document.querySelector("[data-gv-protocols]");
const annualReportList = document.querySelector("[data-annual-reports]");

if (header && toggle) {
  toggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Menü schließen" : "Menü öffnen");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      header.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Menü öffnen");
    });
  });
}

dropdowns.forEach((dropdown) => {
  const dropdownToggle = dropdown.querySelector(".nav-dropdown-toggle");
  const dropdownLinks = dropdown.querySelectorAll(".nav-dropdown-menu a");

  dropdownToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = dropdown.classList.toggle("is-open");
    dropdownToggle.setAttribute("aria-expanded", String(isOpen));
  });

  dropdownLinks.forEach((link) => {
    link.addEventListener("click", () => {
      dropdown.classList.remove("is-open");
      dropdownToggle.setAttribute("aria-expanded", "false");
    });
  });
});

document.addEventListener("click", () => {
  dropdowns.forEach((dropdown) => {
    dropdown.classList.remove("is-open");
    dropdown.querySelector(".nav-dropdown-toggle")?.setAttribute("aria-expanded", "false");
  });
});

const parseDateKey = (dateKey) => {
  if (typeof dateKey !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return new Date(NaN);
  }

  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const monthNames = [
  "Januar",
  "Februar",
  "März",
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
const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const formatDisplayDate = (dateKey) => {
  const date = parseDateKey(dateKey);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getDate()}. ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
};

if (clubPulse) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getNextDatedItem = (items) => {
    if (!Array.isArray(items)) {
      return null;
    }

    return [...items]
      .filter((item) => {
        const date = parseDateKey(item.date || "");
        return !Number.isNaN(date.getTime()) && date >= today;
      })
      .sort((first, second) => parseDateKey(first.date) - parseDateKey(second.date))[0] || null;
  };

  const getLatestDatedItem = (items) => {
    if (!Array.isArray(items)) {
      return null;
    }

    return [...items]
      .filter((item) => !Number.isNaN(parseDateKey(item.date || "").getTime()))
      .sort((first, second) => parseDateKey(second.date) - parseDateKey(first.date))[0] || null;
  };

  const createPulseCard = ({ label, title, text, meta, href, cta }) => {
    const card = document.createElement(href ? "a" : "article");
    const labelElement = document.createElement("span");
    const titleElement = document.createElement("strong");
    const textElement = document.createElement("p");
    const metaElement = document.createElement("small");

    card.className = "club-pulse-card";
    if (href) {
      card.href = href;
    }
    labelElement.textContent = label;
    titleElement.textContent = title;
    textElement.textContent = text;
    metaElement.textContent = cta || meta || "";

    card.append(labelElement, titleElement, textElement, metaElement);
    return card;
  };

  const nextEvent = getNextDatedItem(window.clubEvents);
  const nextMatch = getNextDatedItem(window.matches);
  const latestNews = getLatestDatedItem(window.newsItems);

  clubPulse.innerHTML = "";
  clubPulse.append(
    createPulseCard({
      label: "Nächster Termin",
      title: nextEvent?.title || "Kalender folgt",
      text: nextEvent?.description || "Neue Clubtermine werden laufend ergänzt.",
      meta: nextEvent?.date ? formatDisplayDate(nextEvent.date) : "",
      href: "#vereinskalender",
      cta: nextEvent?.date ? formatDisplayDate(nextEvent.date) : "Zum Kalender",
    }),
    createPulseCard({
      label: "Spielbetrieb",
      title: nextMatch?.title || "Spielplan folgt",
      text: nextMatch?.description || "Die nächsten Interclub- und Teamtermine erscheinen hier.",
      meta: nextMatch?.date ? formatDisplayDate(nextMatch.date) : "",
      href: "spielbetrieb.html?matchday=preview#interclub-kalender",
      cta: nextMatch?.date ? formatDisplayDate(nextMatch.date) : "Zum Spielbetrieb",
    }),
    createPulseCard({
      label: "Aktuell",
      title: latestNews?.title || "News folgen",
      text: latestNews?.text || "Neuigkeiten aus dem Club erscheinen direkt auf der Startseite.",
      href: "#news",
      cta: "Zu den News",
    }),
    createPulseCard({
      label: "Jetzt buchen",
      title: "Platz sichern",
      text: "Aussenplätze, Halle und Padel sind online buchbar.",
      href: "https://apps.gotcourts.com/de/profile/club/tc-eschen-mauren",
      cta: "Buchung öffnen",
    })
  );
}

if (newsGrid && Array.isArray(window.newsItems) && window.newsItems.length > 0) {
  const sortedNews = [...window.newsItems].sort((first, second) => parseDateKey(second.date) - parseDateKey(first.date));
  newsGrid.innerHTML = "";

  sortedNews.forEach((newsItem) => {
    const card = document.createElement("article");
    const image = document.createElement("img");
    const content = document.createElement("div");
    const time = document.createElement("time");
    const title = document.createElement("h3");
    const text = document.createElement("p");

    card.className = "news-card";
    image.src = newsItem.image || "assets/news/50-years.png";
    image.alt = newsItem.alt || newsItem.title || "News Bild";
    image.loading = "lazy";
    content.className = "news-card-content";
    time.dateTime = newsItem.date || "";
    time.textContent = newsItem.date ? formatDisplayDate(newsItem.date) : "";
    title.textContent = newsItem.title || "";
    text.textContent = newsItem.text || "";

    content.append(time, title, text);
    card.append(image, content);
    newsGrid.append(card);
  });
}

if (galleryGrid && Array.isArray(window.galleryImages) && window.galleryImages.length > 0) {
  galleryGrid.innerHTML = "";

  window.galleryImages.forEach((media) => {
    const galleryItem = document.createElement("button");
    const galleryMedia = media.type === "video" ? document.createElement("video") : document.createElement("img");
    const galleryCaption = document.createElement("span");

    galleryItem.className = "gallery-item";
    galleryItem.type = "button";
    galleryItem.dataset.category = media.category || "";
    galleryItem.dataset.mediaType = media.type || "image";
    galleryMedia.src = media.src;

    if (galleryMedia.tagName === "VIDEO") {
      galleryMedia.autoplay = true;
      galleryMedia.muted = true;
      galleryMedia.loop = true;
      galleryMedia.playsInline = true;
      galleryMedia.preload = "metadata";
      galleryMedia.setAttribute("aria-label", media.alt || media.caption || "Galerievideo");
    } else {
      galleryMedia.alt = media.alt || media.caption || "Galeriebild";
      galleryMedia.loading = "lazy";
    }

    galleryCaption.className = "gallery-caption";
    galleryCaption.textContent = media.caption || (media.type === "video" ? "Galerievideo" : "Galeriebild");
    galleryItem.append(galleryMedia, galleryCaption);
    galleryGrid.append(galleryItem);
  });
}

if (galleryStory) {
  const mediaItems = Array.isArray(window.galleryImages) && window.galleryImages.length > 0
    ? window.galleryImages
    : Array.from(document.querySelectorAll(".gallery-item")).map((item) => {
        const media = item.querySelector("img, video");
        const caption = item.querySelector(".gallery-caption");

        return {
          type: media?.tagName === "VIDEO" ? "video" : "image",
          src: media?.getAttribute("src") || "",
          category: item.dataset.category || "",
          caption: caption?.textContent || "",
          alt: media?.getAttribute("alt") || caption?.textContent || "",
        };
      }).filter((media) => media.src);

  const storyItems = mediaItems.slice(0, 6);
  let activeStoryIndex = 0;
  let storyTimer;

  const categoryLabels = {
    all: "Alle",
    interclub: "Interclub",
    junioren: "Junioren",
    events: "Events",
    anlage: "Anlage",
    padel: "Padel",
    sportstueble: "Sportstüble",
  };

  if (storyItems.length > 0) {
    const stage = document.createElement("div");
    const mediaLayer = document.createElement("div");
    const content = document.createElement("div");
    const eyebrow = document.createElement("span");
    const title = document.createElement("h3");
    const counter = document.createElement("small");
    const controls = document.createElement("div");
    const prevButton = document.createElement("button");
    const nextButton = document.createElement("button");
    const dots = document.createElement("div");
    const slides = [];
    const dotButtons = [];

    galleryStory.innerHTML = "";
    stage.className = "gallery-story-stage";
    mediaLayer.className = "gallery-story-media";
    content.className = "gallery-story-content";
    eyebrow.className = "gallery-story-eyebrow";
    counter.className = "gallery-story-counter";
    controls.className = "gallery-story-controls";
    dots.className = "gallery-story-dots";
    prevButton.type = "button";
    nextButton.type = "button";
    prevButton.className = "gallery-story-arrow";
    nextButton.className = "gallery-story-arrow";
    prevButton.setAttribute("aria-label", "Vorheriges Highlight");
    nextButton.setAttribute("aria-label", "Nächstes Highlight");
    prevButton.textContent = "‹";
    nextButton.textContent = "›";

    const setActiveStoryItem = (nextIndex, directionOverride) => {
      const previousStoryIndex = activeStoryIndex;
      activeStoryIndex = (nextIndex + storyItems.length) % storyItems.length;
      const item = storyItems[activeStoryIndex];
      const direction = directionOverride || (activeStoryIndex >= previousStoryIndex ? 1 : -1);

      slides.forEach((slide, index) => {
        const offset = index - activeStoryIndex;
        slide.classList.toggle("is-active", index === activeStoryIndex);
        slide.style.setProperty("--story-slide-x", `${offset * 100}%`);
        slide.style.setProperty("--story-slide-enter", `${direction * 100}%`);
      });
      dotButtons.forEach((button, index) => {
        const isActive = index === activeStoryIndex;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });

      eyebrow.textContent = categoryLabels[item.category] || item.category || "Galerie";
      title.textContent = item.caption || item.alt || "Clubmoment";
      counter.textContent = `${String(activeStoryIndex + 1).padStart(2, "0")} / ${String(storyItems.length).padStart(2, "0")}`;
    };

    const restartStoryTimer = () => {
      window.clearInterval(storyTimer);
      storyTimer = window.setInterval(() => setActiveStoryItem(activeStoryIndex + 1, 1), 5200);
    };

    storyItems.forEach((item, index) => {
      const slide = document.createElement("button");
      const media = item.type === "video" ? document.createElement("video") : document.createElement("img");
      const dot = document.createElement("button");

      slide.className = "gallery-story-slide";
      slide.type = "button";
      slide.dataset.category = item.category || "";
      slide.dataset.mediaType = item.type || "image";
      media.src = item.src;

      if (media.tagName === "VIDEO") {
        media.autoplay = true;
        media.muted = true;
        media.loop = true;
        media.playsInline = true;
        media.preload = "metadata";
        media.setAttribute("aria-label", item.alt || item.caption || "Galerievideo");
      } else {
        media.alt = item.alt || item.caption || "Galeriebild";
        media.loading = index === 0 ? "eager" : "lazy";
      }

      dot.type = "button";
      dot.className = "gallery-story-dot";
      dot.setAttribute("aria-label", `Highlight ${index + 1} anzeigen`);
      dot.setAttribute("aria-pressed", "false");
      dot.addEventListener("click", () => {
        setActiveStoryItem(index, index >= activeStoryIndex ? 1 : -1);
        restartStoryTimer();
      });

      slide.append(media);
      mediaLayer.append(slide);
      dots.append(dot);
      slides.push(slide);
      dotButtons.push(dot);
    });

    prevButton.addEventListener("click", () => {
      setActiveStoryItem(activeStoryIndex - 1, -1);
      restartStoryTimer();
    });
    nextButton.addEventListener("click", () => {
      setActiveStoryItem(activeStoryIndex + 1, 1);
      restartStoryTimer();
    });

    content.append(eyebrow, title, counter);
    controls.append(prevButton, dots, nextButton);
    stage.append(mediaLayer, content, controls);
    galleryStory.append(stage);
    setActiveStoryItem(activeStoryIndex, 1);
    restartStoryTimer();
  }
}

const galleryItems = document.querySelectorAll(".gallery-item");
const lightboxMedia = document.querySelectorAll(".news-card img, .gallery-item img, .gallery-item video, .gallery-story-slide img, .gallery-story-slide video");

const setMediaLoadingStates = (mediaItems) => {
  mediaItems.forEach((media) => {
    const markLoaded = () => {
      media.classList.add("is-loaded");
      media.classList.remove("has-error");
    };
    const markError = () => {
      media.classList.add("has-error");
    };
    const isVideo = media.tagName === "VIDEO";

    if (isVideo && media.readyState >= 2) {
      markLoaded();
      return;
    }

    if (!isVideo && media.complete && media.naturalWidth > 0) {
      markLoaded();
      return;
    }

    if (!isVideo && media.complete) {
      markError();
      return;
    }

    media.addEventListener(isVideo ? "loadeddata" : "load", markLoaded, { once: true });
    media.addEventListener("error", markError, { once: true });
  });
};

setMediaLoadingStates(lightboxMedia);

if (vorstandTrack && Array.isArray(window.vorstandMembers) && window.vorstandMembers.length > 0) {
  const marqueeCopies = 3;
  vorstandTrack.innerHTML = "";

  const createTextElement = (tagName, className, text) => {
    const element = document.createElement(tagName);
    element.className = className;
    element.textContent = text;
    return element;
  };

  const createLinkParagraph = (className, href, text) => {
    const paragraph = document.createElement("p");
    const link = document.createElement("a");
    paragraph.className = className;
    link.href = href;
    link.textContent = text;
    paragraph.append(link);
    return paragraph;
  };

  const createVorstandCard = (member) => {
    const card = document.createElement("div");
    const imageWrapper = document.createElement("div");
    const image = document.createElement("img");
    const content = document.createElement("div");
    const phoneHref = member.phone ? `tel:${member.phone.replace(/\s+/g, "")}` : "";

    card.className = "vorstand-card";
    imageWrapper.className = "vorstand-image-wrapper";
    image.src = member.image || "assets/vorstand/placeholder.png";
    image.alt = member.name || "Vorstandsmitglied";
    content.className = "vorstand-card-content";

    imageWrapper.append(image);
    content.append(
      createTextElement("span", "vorstand-role", member.role || ""),
      createTextElement("h3", "", member.name || "")
    );

    if (member.email) {
      content.append(createLinkParagraph("vorstand-email", `mailto:${member.email}`, member.email));
    }

    if (member.phone) {
      content.append(createLinkParagraph("vorstand-phone", phoneHref, member.phone));
    }

    card.append(imageWrapper, content);
    return card;
  };

  for (let copyIndex = 0; copyIndex < marqueeCopies; copyIndex += 1) {
    window.vorstandMembers.forEach((member) => {
      vorstandTrack.append(createVorstandCard(member));
    });
  }
}

if (clubTimeline && Array.isArray(window.clubTimeline) && window.clubTimeline.length > 0) {
  let activeTimelineIndex = 0;
  let timelineTravelTimeout;
  const historyYears = document.createElement("div");
  const historyStage = document.createElement("div");
  const historyImage = document.createElement("img");
  const historyPanel = document.createElement("article");
  const historyEyebrow = document.createElement("span");
  const historyTitle = document.createElement("h3");
  const historyText = document.createElement("p");
  const historyCounter = document.createElement("small");
  const historyPreviews = document.createElement("div");
  const timelineControls = document.createElement("div");
  const timelineButtons = [];
  const previewButtons = [];

  clubTimeline.innerHTML = "";
  clubTimeline.classList.add("history-showcase");
  historyYears.className = "history-years";
  historyStage.className = "history-stage";
  historyImage.className = "history-image";
  historyPanel.className = "history-panel";
  historyEyebrow.className = "history-eyebrow";
  historyCounter.className = "history-counter";
  historyPreviews.className = "history-previews";
  timelineControls.className = "history-controls";

  const setActiveTimelineItem = (activeIndex) => {
    const activeItem = window.clubTimeline[activeIndex];
    const progress = window.clubTimeline.length <= 1 ? 100 : (activeIndex / (window.clubTimeline.length - 1)) * 100;
    const direction = activeIndex >= activeTimelineIndex ? 1 : -1;
    const travel = activeIndex - activeTimelineIndex;

    activeTimelineIndex = activeIndex;
    window.clearTimeout(timelineTravelTimeout);
    clubTimeline.classList.remove("is-travelling-forward", "is-travelling-backward");
    clubTimeline.classList.add(direction === 1 ? "is-travelling-forward" : "is-travelling-backward");
    timelineTravelTimeout = window.setTimeout(() => {
      clubTimeline.classList.remove("is-travelling-forward", "is-travelling-backward");
    }, 720);
    clubTimeline.style.setProperty("--timeline-progress", progress);
    clubTimeline.style.setProperty("--timeline-glow", `${progress}%`);
    clubTimeline.style.setProperty("--timeline-shift", `${progress * -0.55}px`);
    clubTimeline.style.setProperty("--timeline-shift-reverse", `${progress * 0.55}px`);
    clubTimeline.style.setProperty("--timeline-ghost-shift", `${progress * 0.165}px`);
    clubTimeline.style.setProperty("--timeline-detail-enter", `${direction * 58}px`);
    clubTimeline.style.setProperty("--timeline-travel", travel);
    clubTimeline.dataset.activeYear = activeItem.year || "";
    historyStage.classList.remove("is-visible");

    window.setTimeout(() => {
      historyImage.src = activeItem.image || "assets/club/club_1.jpeg";
      historyImage.alt = activeItem.title || "Meilenstein TC Eschen-Mauren";
      historyEyebrow.textContent = activeItem.year || "";
      historyTitle.textContent = activeItem.title || "";
      historyText.textContent = activeItem.text || "";
      historyCounter.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(window.clubTimeline.length).padStart(2, "0")}`;
      historyStage.classList.add("is-visible");
    }, 120);

    timelineButtons.forEach((button, index) => {
      const isActive = index === activeIndex;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    previewButtons.forEach((button, index) => {
      const isActive = index === activeIndex;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  };

  window.clubTimeline.forEach((item, index) => {
    const button = document.createElement("button");
    const year = document.createElement("strong");
    const preview = document.createElement("button");
    const previewImage = document.createElement("img");
    const previewLabel = document.createElement("span");

    button.className = "timeline-entry";
    button.type = "button";
    button.setAttribute("aria-pressed", "false");
    year.textContent = item.year || "";
    button.append(year);
    button.addEventListener("click", () => setActiveTimelineItem(index));
    timelineButtons.push(button);
    timelineControls.append(button);

    preview.className = "history-preview";
    preview.type = "button";
    preview.setAttribute("aria-pressed", "false");
    previewImage.src = item.image || "assets/club/club_1.jpeg";
    previewImage.alt = "";
    previewImage.loading = "lazy";
    previewLabel.textContent = item.title || "";
    preview.append(previewImage, previewLabel);
    preview.addEventListener("click", () => setActiveTimelineItem(index));
    previewButtons.push(preview);
    historyPreviews.append(preview);
  });

  historyPanel.append(historyEyebrow, historyTitle, historyText, historyCounter);
  historyStage.append(historyImage, historyPanel);
  historyYears.append(timelineControls);
  clubTimeline.append(historyYears, historyStage, historyPreviews);
  setActiveTimelineItem(activeTimelineIndex);
}

if (pricingGrid && Array.isArray(window.membershipPrices) && window.membershipPrices.length > 0) {
  pricingGrid.innerHTML = "";

  window.membershipPrices.forEach((membership) => {
    const card = document.createElement("div");
    const title = document.createElement("h3");
    const price = document.createElement("div");
    const suffix = document.createElement("span");
    const info = document.createElement("p");

    card.className = "price-card";
    card.classList.toggle("highlighted", Boolean(membership.highlighted));
    card.classList.toggle("passive", Boolean(membership.passive));
    title.textContent = membership.title || "";
    price.className = "price";
    price.append(`CHF ${membership.price || ""}`);
    suffix.textContent = ".--";
    price.append(suffix);
    info.className = "price-info";
    info.textContent = membership.info || "";

    card.append(title, price, info);
    pricingGrid.append(card);
  });
}

if (teamLists.length > 0 && window.teams) {
  const createTeamCard = (team) => {
    const card = document.createElement("article");
    const summary = document.createElement("div");
    const category = document.createElement("span");
    const title = document.createElement("h3");
    const description = document.createElement("p");
    const details = document.createElement("dl");

    card.className = "team-card";
    category.className = "team-category";
    if (team.categoryClass) {
      category.classList.add(team.categoryClass);
    }
    category.textContent = team.category || "";
    title.textContent = team.title || "";
    description.textContent = team.description || "";
    summary.append(category, title, description);

    Object.entries(team.details || {}).forEach(([label, value]) => {
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const definition = document.createElement("dd");

      term.textContent = label;

      if (label.toLowerCase() === "kontakt" && typeof value === "string" && value.includes("@")) {
        const link = document.createElement("a");
        link.href = `mailto:${value}`;
        link.textContent = value;
        definition.append(link);
      } else {
        definition.textContent = value;
      }

      row.append(term, definition);
      details.append(row);
    });

    card.append(summary, details);
    return card;
  };

  teamLists.forEach((list) => {
    const teamKey = list.dataset.teamList;
    const teams = window.teams[teamKey] || [];
    list.innerHTML = "";
    teams.forEach((team) => {
      list.append(createTeamCard(team));
    });
  });
}

if (padelOfferLists.length > 0 && window.padelOffers) {
  const createPriceRow = (price) => {
    const row = document.createElement("div");
    const amount = document.createElement("span");
    const suffix = document.createElement("span");

    row.className = "price-display-wrapper";

    if (price.label) {
      const label = document.createElement("span");
      label.className = "label";
      label.textContent = price.label;
      row.append(label);
    }

    if (price.currency) {
      const currency = document.createElement("span");
      currency.className = "currency";
      currency.textContent = price.currency;
      row.append(currency);
    }

    amount.className = price.green ? "amount-green" : "amount";
    amount.textContent = price.amount || "";
    suffix.className = "per-time";
    suffix.textContent = price.suffix || "";
    row.append(amount, suffix);
    return row;
  };

  const createPadelOfferCard = (offer) => {
    const card = document.createElement("article");
    const content = document.createElement("div");
    const title = document.createElement("h3");
    const subtitle = document.createElement("p");

    card.className = "premium-booking-card";
    card.classList.toggle("highlighted-card", Boolean(offer.highlighted));

    if (offer.badge) {
      const badge = document.createElement("div");
      badge.className = `card-badge ${offer.badgeClass || ""}`.trim();
      badge.textContent = offer.badge;
      card.append(badge);
    }

    content.className = "card-main-info";
    title.textContent = offer.title || "";
    subtitle.className = "card-subtitle";
    subtitle.textContent = offer.subtitle || "";
    content.append(title, subtitle);

    (offer.prices || []).forEach((price, index) => {
      if (index > 0) {
        const divider = document.createElement("hr");
        divider.className = "price-divider";
        content.append(divider);
      }

      content.append(createPriceRow(price));
    });

    card.append(content);
    return card;
  };

  padelOfferLists.forEach((list) => {
    const offers = window.padelOffers[list.dataset.padelOffers] || [];
    list.innerHTML = "";
    offers.forEach((offer) => {
      list.append(createPadelOfferCard(offer));
    });
  });
}

if (matchCalendar && Array.isArray(window.matches) && window.matches.length > 0) {
  const sortedMatches = [...window.matches].sort((first, second) => parseDateKey(first.date) - parseDateKey(second.date));
  matchCalendar.innerHTML = "";

  sortedMatches.forEach((match) => {
    const date = parseDateKey(match.date);
    const card = document.createElement("article");
    const time = document.createElement("time");
    const month = document.createElement("span");
    const day = document.createElement("strong");
    const weekday = document.createElement("small");
    const info = document.createElement("div");
    const label = document.createElement("span");
    const title = document.createElement("h3");
    const description = document.createElement("p");
    const status = document.createElement("span");

    card.className = "match-card";
    time.className = "match-date";
    time.dateTime = match.date || "";
    month.textContent = Number.isNaN(date.getTime()) ? "" : monthNames[date.getMonth()].slice(0, 3);
    day.textContent = Number.isNaN(date.getTime()) ? "" : String(date.getDate()).padStart(2, "0");
    weekday.textContent = Number.isNaN(date.getTime()) ? "" : weekdays[(date.getDay() + 6) % 7];
    time.append(month, day, weekday);

    info.className = "match-info";
    label.className = "match-label";
    if (match.labelClass) {
      label.classList.add(match.labelClass);
    }
    label.textContent = match.label || "";
    title.textContent = match.title || "";
    description.textContent = match.description || "";
    info.append(label, title, description);

    status.className = "match-status";
    if (match.statusClass) {
      status.classList.add(match.statusClass);
    }
    status.textContent = match.status || "";

    card.append(time, info, status);
    matchCalendar.append(card);
  });
}

if (matchdaySection && Array.isArray(window.matches) && window.matches.length > 0) {
  const dayMs = 24 * 60 * 60 * 1000;
  const forceMatchdayPreview = new URLSearchParams(window.location.search).get("matchday") === "preview";
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingMatches = [...window.matches]
    .map((match) => ({
      ...match,
      dateObject: parseDateKey(match.date || ""),
    }))
    .filter((match) => !Number.isNaN(match.dateObject.getTime()) && match.dateObject >= today)
    .sort((first, second) => first.dateObject - second.dateObject);

  const previewMatches = forceMatchdayPreview && upcomingMatches.length === 0
    ? [...window.matches]
        .map((match) => ({
          ...match,
          dateObject: parseDateKey(match.date || ""),
        }))
        .filter((match) => !Number.isNaN(match.dateObject.getTime()))
        .sort((first, second) => first.dateObject - second.dateObject)
    : upcomingMatches;

  if (previewMatches.length > 0) {
    const nextMatchDate = previewMatches[0].dateObject;
    const daysUntilMatchday = Math.round((nextMatchDate - today) / dayMs);
    const nextDateKey = previewMatches[0].date;

    if (forceMatchdayPreview || (daysUntilMatchday >= 0 && daysUntilMatchday <= 5)) {
      const matchdayMatches = previewMatches
        .filter((match) => match.date === nextDateKey)
        .sort((first, second) => (first.time || "99:99").localeCompare(second.time || "99:99"));

      const heading = document.createElement("div");
      const eyebrow = document.createElement("p");
      const title = document.createElement("h2");
      const intro = document.createElement("p");
      const dateBlock = document.createElement("time");
      const matchList = document.createElement("div");
      const cta = document.createElement("a");

      matchdaySection.hidden = false;
      matchdaySection.innerHTML = "";
      heading.className = "matchday-heading";
      eyebrow.className = "eyebrow";
      eyebrow.textContent = daysUntilMatchday === 0 ? "Heute ist Matchday" : "Matchday steht an";
      title.textContent = "Matchday beim TCEM";
      intro.textContent = `${matchdayMatches.length} ${matchdayMatches.length === 1 ? "Begegnung" : "Begegnungen"} am nächsten Spieltag.`;

      dateBlock.className = "matchday-date";
      dateBlock.dateTime = nextDateKey || "";
      dateBlock.innerHTML = `
        <span>${Number.isNaN(nextMatchDate.getTime()) ? "" : weekdays[(nextMatchDate.getDay() + 6) % 7]}</span>
        <strong>${Number.isNaN(nextMatchDate.getTime()) ? "" : String(nextMatchDate.getDate()).padStart(2, "0")}</strong>
        <small>${Number.isNaN(nextMatchDate.getTime()) ? "" : monthNames[nextMatchDate.getMonth()].slice(0, 3)}</small>
      `;

      matchList.className = "matchday-list";
      matchdayMatches.forEach((match) => {
        const row = document.createElement("article");
        const time = document.createElement("span");
        const info = document.createElement("div");
        const label = document.createElement("span");
        const name = document.createElement("h3");
        const description = document.createElement("p");
        const status = document.createElement("span");

        row.className = "matchday-row";
        time.className = "matchday-time";
        time.textContent = match.time || "TBD";
        label.className = "match-label";
        if (match.labelClass) {
          label.classList.add(match.labelClass);
        }
        label.textContent = match.label || "";
        name.textContent = match.title || "";
        description.textContent = match.description || "";
        info.append(label, name, description);
        status.className = "match-status";
        if (match.statusClass) {
          status.classList.add(match.statusClass);
        }
        status.textContent = match.status || "";

        row.append(time, info, status);
        matchList.append(row);
      });

      cta.className = "button secondary";
      cta.href = "#interclub-kalender";
      cta.textContent = "Zum Matchkalender";
      heading.append(eyebrow, title, intro, cta);
      matchdaySection.append(heading, dateBlock, matchList);
    }
  }
}

const renderDocumentCards = (list, documents, defaultButtonText) => {
  if (!list || !Array.isArray(documents) || documents.length === 0) {
    return;
  }

  list.innerHTML = "";

  documents.forEach((documentItem) => {
    const card = document.createElement("article");
    const content = document.createElement("div");
    const title = document.createElement("h2");
    const subtitle = document.createElement("p");
    const link = document.createElement("a");

    card.className = "document-card";
    title.textContent = documentItem.title || "";
    subtitle.textContent = documentItem.subtitle || "";
    content.append(title, subtitle);

    link.className = "button primary";
    link.href = documentItem.link || "#";
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = documentItem.buttonText || defaultButtonText;

    card.append(content, link);
    list.append(card);
  });
};

renderDocumentCards(gvProtocolList, window.gvProtocols, "Protokoll öffnen");
renderDocumentCards(annualReportList, window.annualReports, "Jahresbericht öffnen");

if (galleryFilters.length > 0 && galleryItems.length > 0) {
  const galleryFilterBar = document.querySelector(".gallery-filters");
  const applyGalleryFilter = (activeFilter) => {
    const filterToApply = activeFilter || "all";

    galleryFilters.forEach((button) => {
      const isActive = button.dataset.galleryFilter === filterToApply;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    galleryItems.forEach((item) => {
      const category = item.dataset.category || "";
      const isVisible = filterToApply === "all" || category === filterToApply;

      item.hidden = !isVisible;
      item.classList.toggle("is-hidden", !isVisible);
    });
  };

  galleryFilterBar?.addEventListener("click", (event) => {
    const filterButton = event.target.closest(".gallery-filter");

    if (!filterButton) {
      return;
    }

    applyGalleryFilter(filterButton.dataset.galleryFilter || "all");
  });

  const requestedFilter = new URLSearchParams(window.location.search).get("filter");
  const hasRequestedFilter = Array.from(galleryFilters).some((button) => button.dataset.galleryFilter === requestedFilter);

  if (hasRequestedFilter) {
    applyGalleryFilter(requestedFilter);
  }
}

if (calendarGrid && calendarTitle && calendarPrev && calendarNext && calendarEventsList) {
  const collapsedEventCount = 3;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const maxMonth = new Date(today.getFullYear(), today.getMonth() + 3, 1);
  let activeMonth = new Date(minMonth);

  const formatDateKey = (year, month, day) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const monthKey = (date) => date.getFullYear() * 12 + date.getMonth();
  const typeLabels = {
    club: "Club",
    match: "Spielbetrieb",
    junior: "Junioren",
    event: "Event",
  };
  const typeClass = (type) => ["match", "junior", "event"].includes(type) ? type : "";
  const configuredEvents = Array.isArray(window.clubEvents) && window.clubEvents.length > 0
    ? window.clubEvents
    : Array.from(document.querySelectorAll("[data-club-event]")).map((event) => ({
      date: event.dataset.date || "",
      type: event.dataset.type || "club",
      title: event.dataset.title || "",
      description: event.dataset.description || "",
    }));
  const calendarEvents = configuredEvents
    .map((event) => ({
      date: event.date || "",
      dateObject: parseDateKey(event.date || ""),
      type: event.type || "club",
      title: event.title || "",
      description: event.description || "",
    }))
    .filter((event) => event.date && event.title && event.dateObject >= today)
    .sort((first, second) => first.dateObject - second.dateObject);
  let isCalendarExpanded = false;

  const clearHighlightedEvent = () => {
    calendarEventsList.querySelectorAll(".calendar-event.is-highlighted").forEach((event) => {
      event.classList.remove("is-highlighted");
    });
  };

  const highlightEvent = (dateKey) => {
    clearHighlightedEvent();

    const matchingEvent = calendarEventsList.querySelector(`[data-event-date="${dateKey}"]`);

    if (matchingEvent) {
      matchingEvent.classList.add("is-highlighted");
      matchingEvent.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const renderEventList = () => {
    calendarEventsList.innerHTML = "";

    if (calendarEvents.length === 0) {
      calendarEventsList.innerHTML = `
        <article class="calendar-event">
          <div class="calendar-event-content">
            <span class="calendar-tag">Club</span>
            <h3>Keine kommenden Termine</h3>
            <p>Neue Termine werden hier veröffentlicht, sobald sie feststehen.</p>
          </div>
        </article>
      `;
      return;
    }

    const visibleEvents = isCalendarExpanded ? calendarEvents : calendarEvents.slice(0, collapsedEventCount);

    visibleEvents.forEach((event) => {
      const eventElement = document.createElement("article");
      const tagClass = typeClass(event.type);
      eventElement.className = "calendar-event";
      eventElement.dataset.eventDate = event.date;
      eventElement.innerHTML = `
        <time class="calendar-date" datetime="${event.date}">
          <span>${monthNames[event.dateObject.getMonth()].slice(0, 3)}</span>
          <strong>${String(event.dateObject.getDate()).padStart(2, "0")}</strong>
          <small>${weekdays[(event.dateObject.getDay() + 6) % 7]}</small>
        </time>
        <div class="calendar-event-content">
          <span class="calendar-tag${tagClass ? ` ${tagClass}` : ""}">${typeLabels[event.type] || typeLabels.club}</span>
          <h3>${event.title}</h3>
          <p>${event.description}</p>
        </div>
      `;
      calendarEventsList.append(eventElement);
    });

    if (calendarToggle) {
      const hasMoreEvents = calendarEvents.length > collapsedEventCount;
      calendarToggle.hidden = !hasMoreEvents;
      calendarToggle.textContent = isCalendarExpanded ? "Weniger anzeigen" : "Weitere Termine anzeigen";
      calendarToggle.setAttribute("aria-expanded", String(isCalendarExpanded));
    }
  };

  const renderCalendar = () => {
    const year = activeMonth.getFullYear();
    const month = activeMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leadingEmptyDays = (firstDay.getDay() + 6) % 7;

    calendarTitle.textContent = `${monthNames[month]} ${year}`;
    calendarGrid.innerHTML = "";

    weekdays.forEach((weekday) => {
      const weekdayElement = document.createElement("span");
      weekdayElement.className = "weekday";
      weekdayElement.textContent = weekday;
      calendarGrid.append(weekdayElement);
    });

    for (let index = 0; index < leadingEmptyDays; index += 1) {
      const emptyElement = document.createElement("span");
      emptyElement.className = "empty";
      calendarGrid.append(emptyElement);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const dateKey = formatDateKey(year, month, day);
      const eventForDay = calendarEvents.find((event) => event.date === dateKey);
      const dayElement = document.createElement(eventForDay ? "time" : "span");

      dayElement.textContent = String(day);

      if (eventForDay) {
        dayElement.className = `marked ${eventForDay.type}`;
        dayElement.setAttribute("datetime", dateKey);
        dayElement.setAttribute("title", eventForDay.title);
        dayElement.setAttribute("aria-label", `${day}. ${monthNames[month]}: ${eventForDay.title}`);
        dayElement.setAttribute("tabindex", "0");
        dayElement.dataset.eventDate = dateKey;
      }

      calendarGrid.append(dayElement);
    }

    calendarPrev.disabled = monthKey(activeMonth) <= monthKey(minMonth);
    calendarNext.disabled = monthKey(activeMonth) >= monthKey(maxMonth);
  };

  const focusEventFromCalendar = (dateKey) => {
    const isVisible = Boolean(calendarEventsList.querySelector(`[data-event-date="${dateKey}"]`));

    if (!isVisible && calendarToggle) {
      isCalendarExpanded = true;
      renderEventList();
    }

    highlightEvent(dateKey);
  };

  calendarPrev.addEventListener("click", () => {
    if (monthKey(activeMonth) > monthKey(minMonth)) {
      activeMonth = new Date(activeMonth.getFullYear(), activeMonth.getMonth() - 1, 1);
      renderCalendar();
    }
  });

  calendarNext.addEventListener("click", () => {
    if (monthKey(activeMonth) < monthKey(maxMonth)) {
      activeMonth = new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 1);
      renderCalendar();
    }
  });

  calendarGrid.addEventListener("click", (event) => {
    const markedDate = event.target.closest("[data-event-date]");

    if (markedDate) {
      focusEventFromCalendar(markedDate.dataset.eventDate);
    }
  });

  calendarGrid.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const markedDate = event.target.closest("[data-event-date]");

    if (markedDate) {
      event.preventDefault();
      focusEventFromCalendar(markedDate.dataset.eventDate);
    }
  });

  calendarToggle?.addEventListener("click", () => {
    isCalendarExpanded = !isCalendarExpanded;
    renderEventList();
  });

  renderEventList();
  renderCalendar();
}

if (lightboxMedia.length > 0) {
  const lightbox = document.createElement("div");
  lightbox.className = "image-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Medienansicht");
  lightbox.innerHTML = `
    <button type="button" aria-label="Medienansicht schließen">&times;</button>
    <img src="" alt="" />
    <video controls playsinline></video>
  `;
  document.body.append(lightbox);

  const lightboxImage = lightbox.querySelector("img");
  const lightboxVideo = lightbox.querySelector("video");
  const closeButton = lightbox.querySelector("button");

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightboxImage.src = "";
    lightboxImage.alt = "";
    lightboxVideo.pause();
    lightboxVideo.removeAttribute("src");
    lightboxVideo.load();
  };

  lightboxMedia.forEach((media) => {
    media.addEventListener("click", () => {
      const isVideo = media.tagName === "VIDEO";

      lightbox.classList.toggle("is-video", isVideo);
      lightbox.classList.toggle("is-image", !isVideo);

      if (isVideo) {
        lightboxVideo.src = media.currentSrc || media.src;
        lightboxVideo.setAttribute("aria-label", media.getAttribute("aria-label") || "Galerievideo");
      } else {
        lightboxImage.src = media.src;
        lightboxImage.alt = media.alt;
      }

      lightbox.classList.add("is-open");
      closeButton.focus();
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLightbox();
    }
  });
}

if (sponsorRotator && Array.isArray(window.sponsors) && window.sponsors.length > 0) {
  sponsorRotator.innerHTML = "";

  window.sponsors.forEach((sponsor, index) => {
    const image = document.createElement("img");
    image.src = sponsor.logo;
    image.alt = sponsor.name ? `${sponsor.name} Logo` : "Sponsor Logo";
    image.classList.toggle("is-active", index === 0);
    sponsorRotator.append(image);
  });
}

const sponsorSlides = document.querySelectorAll(".sponsor-rotator img");

if (sponsorSlides.length > 1) {
  let activeSponsorIndex = 0;

  sponsorSlides.forEach((slide, index) => {
    slide.classList.toggle("is-active", index === activeSponsorIndex);
  });

  setInterval(() => {
    sponsorSlides[activeSponsorIndex].classList.remove("is-active");
    activeSponsorIndex = (activeSponsorIndex + 1) % sponsorSlides.length;
    sponsorSlides[activeSponsorIndex].classList.add("is-active");
  }, 5000);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove("is-open");
      dropdown.querySelector(".nav-dropdown-toggle")?.setAttribute("aria-expanded", "false");
    });
  }
});
