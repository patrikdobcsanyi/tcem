const header = document.querySelector(".site-header");
const toggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const dropdowns = document.querySelectorAll(".nav-dropdown");
const lightboxImages = document.querySelectorAll(".news-card img, .gallery-item img");
const galleryFilters = document.querySelectorAll(".gallery-filter");
const galleryItems = document.querySelectorAll(".gallery-item");
const sponsorSlides = document.querySelectorAll(".sponsor-rotator img");
const calendarGrid = document.querySelector("[data-calendar-grid]");
const calendarTitle = document.querySelector("[data-calendar-title]");
const calendarPrev = document.querySelector("[data-calendar-prev]");
const calendarNext = document.querySelector("[data-calendar-next]");
const calendarEventsList = document.querySelector("[data-calendar-events]");
const calendarToggle = document.querySelector("[data-calendar-toggle]");

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
  const collapsedEventCount = 3;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const maxMonth = new Date(today.getFullYear(), today.getMonth() + 3, 1);
  let activeMonth = new Date(minMonth);

  const parseDateKey = (dateKey) => {
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Date(year, month - 1, day);
  };
  const formatDateKey = (year, month, day) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const monthKey = (date) => date.getFullYear() * 12 + date.getMonth();
  const typeLabels = {
    club: "Club",
    match: "Spielbetrieb",
    junior: "Junioren",
    event: "Event",
  };
  const typeClass = (type) => ["match", "junior", "event"].includes(type) ? type : "";
  const calendarEvents = Array.from(document.querySelectorAll("[data-club-event]"))
    .map((event) => {
      const date = event.dataset.date || "";

      return {
        date,
        dateObject: parseDateKey(date),
        type: event.dataset.type || "club",
        title: event.dataset.title || "",
        description: event.dataset.description || "",
      };
    })
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

if (lightboxImages.length > 0) {
  const lightbox = document.createElement("div");
  lightbox.className = "image-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Bildansicht");
  lightbox.innerHTML = `
    <button type="button" aria-label="Bild schließen">&times;</button>
    <img src="" alt="" />
  `;
  document.body.append(lightbox);

  const lightboxImage = lightbox.querySelector("img");
  const closeButton = lightbox.querySelector("button");

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightboxImage.src = "";
    lightboxImage.alt = "";
  };

  lightboxImages.forEach((image) => {
    image.addEventListener("click", () => {
      lightboxImage.src = image.src;
      lightboxImage.alt = image.alt;
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
