const data = window.VORSTAND_DATA;
const doneStorageKey = "tcemVorstandDoneTasks";
const progressStorageKey = "tcemVorstandProgressTasks";
let activeTaskFilter = "open";
let activePersonFilter = "all";

const getStoredTaskIds = (key) => {
  try {
    return JSON.parse(window.localStorage.getItem(key)) || [];
  } catch (error) {
    return [];
  }
};

const storedDoneTaskIds = new Set(getStoredTaskIds(doneStorageKey));
const storedProgressTaskIds = new Set(getStoredTaskIds(progressStorageKey));

data.tasks.forEach((task) => {
  if (storedDoneTaskIds.has(task.id)) {
    task.status = "done";
  } else if (storedProgressTaskIds.has(task.id)) {
    task.status = "progress";
  }
});

const formatDate = (value, options = {}) => {
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat("de-CH", {
    day: "2-digit",
    month: "short",
    ...options
  }).format(date);
};

const daysUntil = (value) => {
  if (!value) return Number.POSITIVE_INFINITY;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${value}T00:00:00`);
  return Math.round((target - today) / 86400000);
};

const sortByDate = (items, key = "due") => [...items].sort((a, b) => {
  if (!a[key] && !b[key]) return 0;
  if (!a[key]) return 1;
  if (!b[key]) return -1;
  return a[key].localeCompare(b[key]);
});

const getDueLabel = (date, fallback = "Ohne Frist") => {
  if (!date) return fallback;

  const remaining = daysUntil(date);

  if (remaining < 0) return `${Math.abs(remaining)} Tage überfällig`;
  if (remaining === 0) return "Heute";
  if (remaining === 1) return "Morgen";
  if (remaining <= 7) return `in ${remaining} Tagen`;

  return formatDate(date);
};

const getTaskOwners = (task) => task.owner.split("/").map((owner) => owner.trim());

const getPeople = () => {
  const people = new Set(data.people || []);

  data.tasks.forEach((task) => {
    getTaskOwners(task).forEach((owner) => people.add(owner));
  });

  return [...people].filter((person) => person !== "Alle").sort((a, b) => a.localeCompare(b, "de-CH"));
};

const taskMatchesPerson = (task) => {
  if (activePersonFilter === "all") return true;

  const owners = getTaskOwners(task);
  return owners.includes(activePersonFilter) || owners.includes("Alle");
};

const renderTaskCard = (task) => {
  const isDone = task.status === "done";
  const isProgress = task.status === "progress";
  const remaining = daysUntil(task.due);
  const isLate = remaining < 0 && !isDone;
  const dueClass = isLate ? "due-pill is-late" : "due-pill";
  const details = [task.owner, task.category, task.source].filter(Boolean).join(" · ");

  if (isDone) {
    return `
      <article class="task-card is-done">
        <div>
          <strong>${task.title}</strong>
          <small>${details}</small>
        </div>
        <span class="done-label">Erledigt</span>
      </article>
    `;
  }

  return `
    <article class="task-card${isLate ? " is-late" : ""}${isProgress ? " is-progress" : ""}">
      <div>
        <strong>${task.title}</strong>
        <small>${details}</small>
        ${isProgress ? '<span class="progress-label">In Arbeit</span>' : ""}
        <div class="task-inline-action">
          ${isProgress
            ? `<button class="open-button" type="button" data-open-task="${task.id}">Zurück auf offen</button>`
            : `<button class="progress-button" type="button" data-progress-task="${task.id}">In Arbeit</button>`}
          <button class="done-button" type="button" data-done-task="${task.id}">Erledigt</button>
        </div>
      </div>
      <div class="task-actions">
        <span class="${dueClass}">${getDueLabel(task.due, task.dueText || "Ohne Frist")}</span>
      </div>
    </article>
  `;
};

const getFilteredTasks = (filter) => {
  const openTasks = data.tasks.filter((task) => task.status !== "done");
  let tasks = openTasks;

  if (filter === "soon") {
    tasks = openTasks.filter((task) => daysUntil(task.due) <= 14);
  } else if (filter === "done") {
    tasks = data.tasks.filter((task) => task.status === "done");
  } else if (filter === "all") {
    tasks = data.tasks;
  }

  return tasks.filter(taskMatchesPerson);
};

const renderTasks = (filter = "open") => {
  activeTaskFilter = filter;
  const taskList = document.querySelector("#taskList");
  const tasks = sortByDate(getFilteredTasks(filter));

  taskList.innerHTML = tasks.length
    ? tasks.map(renderTaskCard).join("")
    : '<div class="empty-state">Keine Aufgaben in dieser Ansicht.</div>';
};

const renderDocuments = () => {
  const documentList = document.querySelector("#documentList");
  documentList.innerHTML = data.documents.map((documentItem) => `
    <a href="${documentItem.href}">
      ${documentItem.title}
      <span>${documentItem.type}</span>
    </a>
  `).join("");
};

const renderBacklog = () => {
  const backlogList = document.querySelector("#backlogList");
  backlogList.innerHTML = data.backlog.map((idea) => `
    <article class="backlog-card">
      <span>${idea.category}</span>
      <strong>${idea.title}</strong>
      <p>${idea.note}</p>
    </article>
  `).join("");
};

const renderContacts = () => {
  const contactList = document.querySelector("#contactList");
  contactList.innerHTML = data.contacts.map((contact) => {
    const contactLinks = [
      contact.phone ? `<a href="tel:${contact.phone.replaceAll(" ", "")}">${contact.phone}</a>` : "",
      contact.email ? `<a href="mailto:${contact.email}">${contact.email}</a>` : ""
    ].filter(Boolean).join("");

    return `
      <article class="contact-card">
        <div>
          <span>${contact.role}</span>
          <strong>${contact.name}</strong>
          <p>${contact.note}</p>
        </div>
        <div class="contact-links">
          ${contactLinks || '<span>Kontakt ergänzen</span>'}
        </div>
      </article>
    `;
  }).join("");
};

const renderPersonFilter = () => {
  const personFilter = document.querySelector("#personFilter");
  personFilter.innerHTML = `
    <option value="all">Alle</option>
    ${getPeople().map((person) => `<option value="${person}">${person}</option>`).join("")}
  `;
};

const renderNextMeeting = () => {
  const nextMeeting = sortByDate(data.meetings, "date").find((meeting) => daysUntil(meeting.date) >= 0);
  const meetingContainer = document.querySelector("#nextMeeting");

  if (!nextMeeting) {
    meetingContainer.innerHTML = '<div class="empty-state">Keine nächste Sitzung erfasst.</div>';
    return;
  }

  meetingContainer.innerHTML = `
    <article class="meeting-card">
      <div class="meeting-date">
        <span>${formatDate(nextMeeting.date, { month: "short" })}</span>
        <strong>${formatDate(nextMeeting.date, { day: "2-digit" }).replace(/\D/g, "")}</strong>
      </div>
      <div>
        <strong>${nextMeeting.title}</strong>
        <p>${nextMeeting.note}</p>
      </div>
    </article>
  `;
};

document.querySelectorAll("[data-task-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll("[data-task-filter]").forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");
    renderTasks(button.dataset.taskFilter);
  });
});

document.querySelector("#personFilter").addEventListener("change", (event) => {
  activePersonFilter = event.target.value;
  renderTasks(activeTaskFilter);
});

document.querySelector("#taskList").addEventListener("click", (event) => {
  const openButton = event.target.closest("[data-open-task]");
  const progressButton = event.target.closest("[data-progress-task]");
  const doneButton = event.target.closest("[data-done-task]");

  if (!openButton && !progressButton && !doneButton) return;

  const taskId = doneButton?.dataset.doneTask || progressButton?.dataset.progressTask || openButton?.dataset.openTask;
  const task = data.tasks.find((item) => item.id === taskId);
  if (!task) return;

  if (doneButton) {
    task.status = "done";
    storedDoneTaskIds.add(task.id);
    storedProgressTaskIds.delete(task.id);
    window.localStorage.setItem(doneStorageKey, JSON.stringify([...storedDoneTaskIds]));
    window.localStorage.setItem(progressStorageKey, JSON.stringify([...storedProgressTaskIds]));
  } else {
    task.status = progressButton ? "progress" : "open";
    if (progressButton) {
      storedProgressTaskIds.add(task.id);
    } else {
      storedProgressTaskIds.delete(task.id);
    }
    window.localStorage.setItem(progressStorageKey, JSON.stringify([...storedProgressTaskIds]));
  }

  renderTasks(activeTaskFilter);
});

renderPersonFilter();
renderTasks();
renderNextMeeting();
renderBacklog();
renderContacts();
renderDocuments();
