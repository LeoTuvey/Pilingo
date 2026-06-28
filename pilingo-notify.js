const PilingoNotify = {
  endpoint: "/api/track",
  listEndpoint: "/api/notifications",
  leaderboardEndpoint: "/api/leaderboard",
  statsEndpoint: "/api/student-stats",
  pollTimer: null,
  lastSeenEventId: null,
  lastCompetitionMessage: "",

  canUseServer(){
    return location.protocol.startsWith("http");
  },

  canViewOwnerNotifications(){
    return !!window.PilingoAuth?.isOwner?.();
  },

  ownerHeaders(){
    const token = window.PilingoAuth?.getOwnerPanelToken?.() || "";
    return token ? { "X-Pilingo-Owner-Token": token } : {};
  },

  currentStudent(){
    const account = window.PilingoAuth?.loadAccount?.() || null;
    return {
      name: account?.name || localStorage.getItem("pilingo_current_user") || "Unknown student",
      email: account?.email || "",
      phone: account?.phone || "",
      location: account?.location || "",
      hasAccount: !!(account?.email && account?.phone)
    };
  },

  async track(type, label, details){
    if(!this.canUseServer()) return;

    const student = this.currentStudent();
    const page = location.pathname.split("/").pop() || "index.html";

    if(type === "page_open"){
      const dedupeKey = `pilingo_track_${page}_${label || type}`;
      const lastSentAt = Number(sessionStorage.getItem(dedupeKey) || 0);
      if(Date.now() - lastSentAt < 10000) return;
      sessionStorage.setItem(dedupeKey, String(Date.now()));
    }

    try {
      await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: type || "activity",
          label: label || "",
          page,
          studentName: student.name,
          studentEmail: student.email,
          studentPhone: student.phone,
          studentLocation: student.location,
          details: details || {}
        })
      });
    } catch(error) {
      // stay quiet if the local server is offline
    }
  },

  async submitStudentStats(stats){
    if(!this.canUseServer()) return null;

    const student = this.currentStudent();
    if(!student.hasAccount) return null;

    try {
      const response = await fetch(this.statsEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: student.name,
          studentEmail: student.email,
          studentPhone: student.phone,
          studentLocation: student.location,
          ...(stats || {})
        })
      });
      const data = await response.json();
      return data.student || null;
    } catch(error) {
      return null;
    }
  },

  async fetchNotifications(){
    if(!this.canUseServer() || !this.canViewOwnerNotifications()) return [];

    try {
      const response = await fetch(this.listEndpoint, {
        cache:"no-store",
        headers: this.ownerHeaders()
      });
      if(!response.ok) return [];
      const data = await response.json();
      return Array.isArray(data.events) ? data.events : [];
    } catch(error) {
      return [];
    }
  },

  async fetchLeaderboard(){
    if(!this.canUseServer()) return [];

    try {
      const response = await fetch(this.leaderboardEndpoint, { cache:"no-store" });
      const data = await response.json();
      return Array.isArray(data.students) ? data.students : [];
    } catch(error) {
      return [];
    }
  },

  async renderInto(listId, statusId){
    const list = document.getElementById(listId);
    const status = document.getElementById(statusId);
    const liveList = document.getElementById("notifyLive");
    if(!list) return;

    if(!this.canViewOwnerNotifications()){
      list.innerHTML = `
        <div class="notify-item">
          <strong>Owner only</strong>
          <span>This activity panel is visible only for the owner account.</span>
        </div>
      `;
      if(status) status.innerText = "Private";
      return;
    }

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
      if(liveList) {
        liveList.innerHTML = `
          <div class="notify-item">
            <strong>No students live right now</strong>
            <span>Students who are active in the app will appear here with their email.</span>
          </div>
        `;
      }
      list.innerHTML = `
        <div class="notify-item">
          <strong>No student activity yet</strong>
          <span>Notifications will appear here when students open the app or lessons.</span>
        </div>
      `;
      return;
    }

    const visibleEvents = this.selectVisibleEvents(events);
    this.renderLiveStudents(events, liveList, status);

    const finalEvents = visibleEvents.length
      ? visibleEvents
      : events.filter((event) => {
          const name = String(event?.studentName || "").trim().toLowerCase();
          const email = String(event?.studentEmail || "").trim();
          const phone = String(event?.studentPhone || "").trim();
          return !!(email || phone || (name && name !== "unknown student"));
        }).slice(0, 4);

    if(!finalEvents.length) {
      list.innerHTML = `
        <div class="notify-item">
          <strong>Student activity is live</strong>
          <span>New logins, new accounts, and lesson activity will appear here.</span>
        </div>
      `;
      this.maybeShowBrowserNotification(events[0]);
      return;
    }

    list.innerHTML = finalEvents.map((event) => `
      <div class="notify-item">
        <strong>${escapeHtml(event.studentName || "Student")} • ${escapeHtml(this.displayLabel(event))}</strong>
        <span>${escapeHtml(event.studentEmail || "No email")} • ${escapeHtml(event.studentPhone || "No phone")}</span>
        <span>${escapeHtml(event.studentLocation || "Location unavailable")}</span>
        <span>${escapeHtml(event.page || "")} • ${formatWhen(event.createdAt)}</span>
      </div>
    `).join("");

    this.maybeShowBrowserNotification(finalEvents[0] || events[0]);
  },

  renderLiveStudents(events, liveList, status){
    if(!liveList) return;

    const now = Date.now();
    const liveStudents = [];
    const recentStudents = [];
    const seen = new Set();

    for(const event of events){
      const createdAt = new Date(event?.createdAt || 0).getTime();
      const email = String(event?.studentEmail || "").trim();
      const phone = String(event?.studentPhone || "").trim();
      const name = String(event?.studentName || "").trim();
      const key = (email || phone || name).toLowerCase();
      if(!key || key === "unknown student") continue;
      if(seen.has(key)) continue;
      seen.add(key);

      const studentCard = {
        name: name || "Student",
        email: email || "No email",
        phone: phone || "No phone",
        action: this.displayLabel(event),
        at: event?.createdAt || ""
      };

      if(createdAt && now - createdAt <= 15 * 60 * 1000) {
        liveStudents.push(studentCard);
      } else if(createdAt && now - createdAt <= 24 * 60 * 60 * 1000) {
        recentStudents.push(studentCard);
      }

      if(liveStudents.length >= 4 && recentStudents.length >= 4) break;
    }

    if(status) {
      if(liveStudents.length) {
        status.innerText = `Live now: ${liveStudents.length}`;
      } else if(recentStudents.length) {
        status.innerText = `Recent students: ${recentStudents.length}`;
      }
    }

    const studentsToShow = liveStudents.length ? liveStudents : recentStudents.slice(0, 4);
    const title = liveStudents.length ? "Live now" : "Recently seen";
    const detail = liveStudents.length
      ? "Students active in the app right now."
      : "No one is live right now. These students used the app recently.";

    if(!studentsToShow.length) {
      liveList.innerHTML = `
        <div class="notify-item">
          <strong>No students live right now</strong>
          <span>Students who use the app with their email will appear here.</span>
        </div>
      `;
      return;
    }

    liveList.innerHTML = `
      <div class="notify-section-label">${title}</div>
      <div class="notify-item">
        <strong>${title}</strong>
        <span>${detail}</span>
      </div>
    ` + studentsToShow.map((student) => `
      <div class="live-student-card">
        <strong>${escapeHtml(student.name)}</strong>
        <span>${escapeHtml(student.email)} • ${escapeHtml(student.phone)}</span>
        <span>Latest: ${escapeHtml(student.action)}</span>
        <span>${formatWhen(student.at)}</span>
      </div>
    `).join("");
  },

  startPolling(listId, statusId){
    if(this.pollTimer) clearInterval(this.pollTimer);
    this.renderInto(listId, statusId);
    this.pollTimer = setInterval(() => this.renderInto(listId, statusId), 12000);
  },

  async renderLeaderboard(listId){
    const list = document.getElementById(listId);
    if(!list) return;

    const students = await this.fetchLeaderboard();

    if(!students.length) {
      list.innerHTML = `
        <div class="leader-item">
          <strong>No rankings yet</strong>
          <span>Student rankings will appear here after learners start studying.</span>
        </div>
      `;
      return;
    }

    const current = this.currentStudent();
    const currentKey = (current.email || current.name || "").trim().toLowerCase();
    const currentIndex = students.findIndex((student) => {
      const studentKey = String(student.email || student.name || "").trim().toLowerCase();
      return studentKey === currentKey;
    });
    const leader = students[0] || null;
    const competition = this.buildCompetitionState(students, currentIndex, leader);

    const topThree = students.slice(0, 3);
    const rest = students.slice(3, 10);
    const podiumClasses = ["first", "second", "third"];

    list.innerHTML = `
      <div class="leader-item">
        <strong>${escapeHtml(competition.title)}</strong>
        <span>${escapeHtml(competition.body)}</span>
      </div>
      <div class="leader-section-label">League Leaders</div>
      <div class="podium-grid">
        ${topThree.map((student, index) => `
          <div class="podium-card ${podiumClasses[index] || ""}">
            <div class="podium-rank">#${index + 1}</div>
            <div class="podium-name">${escapeHtml(student.name || "Student")}</div>
            <div class="podium-meta">XP ${student.xp || 0}<br>Grade ${Math.round(student.averageGrade || 0)}%<br>Sections ${student.completedSections || 0}</div>
          </div>
        `).join("")}
      </div>
      <div class="leader-section-label">Full Table</div>
    ` + rest.map((student, index) => `
      <div class="leader-item">
        <strong>#${index + 4} ${escapeHtml(student.name || "Student")}</strong>
        <span>XP ${student.xp || 0} • Grade ${Math.round(student.averageGrade || 0)}% • Sections ${student.completedSections || 0}</span>
      </div>
    `).join("");

    this.maybeShowCompetitionNotification(competition);
  },

  startLeaderboardPolling(listId){
    this.renderLeaderboard(listId);
    setInterval(() => this.renderLeaderboard(listId), 15000);
  },

  sendTestNotification(){
    if(!("Notification" in window)) return false;
    if(Notification.permission !== "granted") return false;

    new Notification("Pilingo phone notifications", {
      body: "Phone notifications are working on this device."
    });
    return true;
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
        body: `${event.studentName || "Student"} • ${this.displayLabel(event)}`
      });
      return;
    }
  },
  selectVisibleEvents(events){
    const uniqueEvents = [];
    const meaningfulStudents = new Set();

    for(const event of events){
      const type = String(event?.type || "").trim();
      const label = String(event?.label || "").trim();
      const page = String(event?.page || "").trim();
      const email = String(event?.studentEmail || "").trim().toLowerCase();
      const phone = String(event?.studentPhone || "").trim();
      const name = String(event?.studentName || "").trim();
      const studentKey = email || phone || name.toLowerCase();
      const createdAt = new Date(event?.createdAt || 0).getTime();
      const isUnknown = !email && !phone && (!name || name.toLowerCase() === "unknown student");
      const isHomeOpen = type === "page_open" && page === "index.html";
      const isAccountCreated = type === "account_created";
      const isLogin = type === "account_login";
      const isLessonOpen = type === "page_open" && page !== "index.html";
      const isLearningStart = type === "learning_started";
      const isImportant = isAccountCreated || isLogin || isLessonOpen || isLearningStart;

      if(isUnknown && isHomeOpen) continue;
      if(isHomeOpen && studentKey && meaningfulStudents.has(studentKey)) continue;

      const signature = [
        studentKey || "student",
        type || "activity",
        label || "",
        page || ""
      ].join("|");
      const alreadyShown = uniqueEvents.some((item) => {
        const sameSignature = item.signature === signature;
        const sameWindow = Math.abs(item.createdAt - createdAt) < 30000;
        return sameSignature && sameWindow;
      });
      if(alreadyShown) continue;

      uniqueEvents.push({ signature, createdAt, event });
      if(studentKey && isImportant) meaningfulStudents.add(studentKey);
      if(uniqueEvents.length >= 8) break;
    }

    return uniqueEvents.map((item) => item.event);
  },
  displayLabel(event){
    const type = String(event?.type || "").trim();
    if(type === "account_created") return "New student account";
    if(type === "account_login") return "Logged in";
    if(type === "account_logout") return "Logged out";
    if(type === "learning_started") return "Started learning";
    return String(event?.label || event?.type || "Activity");
  },
  buildCompetitionState(students, currentIndex, leader){
    const stateKey = "pilingo_competition_state_v1";
    let previous = {};

    try {
      previous = JSON.parse(localStorage.getItem(stateKey) || "{}");
    } catch(error) {
      previous = {};
    }

    const leaderName = leader?.name || "A student";
    const currentRank = currentIndex >= 0 ? currentIndex + 1 : null;
    const previousRank = Number(previous.rank || 0) || null;
    const previousLeader = previous.leaderName || "";
    let title = "Competition is live";
    let body = leader
      ? `${leaderName} is on top right now. Keep learning and catch them.`
      : "Students will appear here after they start learning.";

    if(currentRank === 1) {
      title = "You are #1";
      body = "Everyone is chasing you now. Keep learning and stay on top.";
    } else if(currentRank && previousRank && currentRank > previousRank) {
      title = "Someone passed you";
      body = `${leaderName} left you behind. Win your place back with more study.`;
    } else if(currentRank && previousRank && currentRank < previousRank) {
      title = "You climbed higher";
      body = `Great work. You moved up to #${currentRank}. Keep pushing upward.`;
    } else if(currentRank && leader) {
      title = "Top student alert";
      body = `${leaderName} is #1 now. Do not let them stay there too long.`;
    } else if(leader) {
      title = "Top student alert";
      body = `${leaderName} is leading the ranking. Other students can chase the top now.`;
    }

    localStorage.setItem(stateKey, JSON.stringify({
      rank: currentRank || 0,
      leaderName
    }));

    return {
      title,
      body,
      notify: previousLeader && previousLeader !== leaderName
        ? `${leaderName} reached the top of the ranking.`
        : (currentRank && previousRank && currentRank > previousRank
          ? `${leaderName} passed you in the ranking.`
          : "")
    };
  },

  maybeShowCompetitionNotification(competition){
    if(!competition || !competition.notify) return;
    if(this.lastCompetitionMessage === competition.notify) return;
    this.lastCompetitionMessage = competition.notify;

    if("Notification" in window && Notification.permission === "granted") {
      new Notification("Pilingo competition", {
        body: competition.notify
      });
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
