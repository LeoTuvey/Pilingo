const PilingoNotify = {
  endpoint: "/api/track",
  listEndpoint: "/api/notifications",
  pollTimer: null,
  lastSeenEventId: null,

  canUseServer(){
    return location.protocol.startsWith("http");
  },

  currentStudent(){
    const account = window.PilingoAuth?.loadAccount?.() || null;
    return {
      name: account?.name || localStorage.getItem("pilingo_current_user") || "Unknown student",
      email: account?.email || ""
    };
  },

  async track(type, label, details){
    if(!this.canUseServer()) return;

    const student = this.currentStudent();

    try {
      await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: type || "activity",
          label: label || "",
          page: location.pathname.split("/").pop() || "index.html",
          studentName: student.name,
          studentEmail: student.email,
          details: details || {}
        })
      });
    } catch(error) {
      // stay quiet if the local server is offline
    }
  },

  async fetchNotifications(){
    if(!this.canUseServer()) return [];

    try {
      const response = await fetch(this.listEndpoint, { cache:"no-store" });
      const data = await response.json();
      return Array.isArray(data.events) ? data.events : [];
    } catch(error) {
      return [];
    }
  },

  async renderInto(listId, statusId){
    const list = document.getElementById(listId);
    const status = document.getElementById(statusId);
    if(!list) return;

    if(!this.canUseServer()) {
      list.innerHTML = `
        <div class="notify-item">
          <strong>Server not active</strong>
          <span>Open the app through the local server to receive student notifications.</span>
        </div>
      `;
      if(status) status.innerText = "Offline";
      return;
    }

    const events = await this.fetchNotifications();

    if(status) {
      if(!("Notification" in window)) {
        status.innerText = events.length ? "Live" : "Waiting";
      } else if(Notification.permission === "granted") {
        status.innerText = events.length ? "Live + Phone" : "Phone Ready";
      } else if(Notification.permission === "denied") {
        status.innerText = "Blocked";
      } else {
        status.innerText = events.length ? "Live" : "Waiting";
      }
    }

    if(!events.length) {
      list.innerHTML = `
        <div class="notify-item">
          <strong>No student activity yet</strong>
          <span>Notifications will appear here when students open the app or lessons.</span>
        </div>
      `;
      return;
    }

    list.innerHTML = events.slice(0, 8).map((event) => `
      <div class="notify-item">
        <strong>${escapeHtml(event.studentName || "Student")} • ${escapeHtml(event.label || event.type || "Activity")}</strong>
        <span>${escapeHtml(event.page || "")} • ${formatWhen(event.createdAt)}</span>
      </div>
    `).join("");

    this.maybeShowBrowserNotification(events[0]);
  },

  startPolling(listId, statusId){
    if(this.pollTimer) clearInterval(this.pollTimer);
    this.renderInto(listId, statusId);
    this.pollTimer = setInterval(() => this.renderInto(listId, statusId), 12000);
  },

  maybeShowBrowserNotification(event){
    if(!event || !("Notification" in window)) return;
    if(this.lastSeenEventId === null) {
      this.lastSeenEventId = event.id;
      return;
    }
    if(this.lastSeenEventId === event.id) return;

    this.lastSeenEventId = event.id;

    if(Notification.permission === "granted") {
      new Notification("Pilingo student activity", {
        body: `${event.studentName || "Student"} • ${event.label || event.type || "Activity"}`
      });
      return;
    }
  }
};

function formatWhen(iso){
  if(!iso) return "Unknown time";
  const date = new Date(iso);
  return date.toLocaleString();
}

function escapeHtml(value){
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

window.PilingoNotify = PilingoNotify;
