const PilingoSocial = {
  endpoint: "/api/social",
  followEndpoint: "/api/social/follow",
  pollTimer: null,
  lastSnapshot: null,

  canUseServer(){
    return location.protocol.startsWith("http");
  },

  currentAccount(){
    return window.PilingoAuth?.loadAccount?.() || null;
  },

  currentEmail(){
    return String(this.currentAccount()?.email || "").trim().toLowerCase();
  },

  async fetchSnapshot(){
    if(!this.canUseServer()) return null;
    const email = this.currentEmail();
    if(!email) return null;

    try {
      const url = `${this.endpoint}?viewerEmail=${encodeURIComponent(email)}`;
      const response = await fetch(url, { cache:"no-store" });
      const data = await response.json();
      return data?.social || null;
    } catch(error) {
      return null;
    }
  },

  async setFollow(targetEmail, follow){
    const viewerEmail = this.currentEmail();
    if(!viewerEmail || !targetEmail) return null;

    const response = await fetch(this.followEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        viewerEmail,
        targetEmail,
        follow: !!follow
      })
    });
    const data = await response.json().catch(() => ({}));
    if(!response.ok || !data.ok){
      throw new Error(data?.error || "Could not update follow status.");
    }
    this.lastSnapshot = data.social || null;
    return this.lastSnapshot;
  },

  async follow(targetEmail){
    const snapshot = await this.setFollow(targetEmail, true);
    if(window.PilingoNotify?.track){
      window.PilingoNotify.track("student_follow", "Started following", {
        source: "social",
        targetEmail
      });
    }
    return snapshot;
  },

  async unfollow(targetEmail){
    const snapshot = await this.setFollow(targetEmail, false);
    if(window.PilingoNotify?.track){
      window.PilingoNotify.track("student_unfollow", "Stopped following", {
        source: "social",
        targetEmail
      });
    }
    return snapshot;
  },

  async render(){
    const card = document.getElementById("socialCard");
    const summary = document.getElementById("socialSummary");
    const followingList = document.getElementById("socialFollowingList");
    const followersList = document.getElementById("socialFollowersList");
    const discoverList = document.getElementById("socialDiscoverList");

    if(!card || !summary || !followingList || !followersList || !discoverList) return;

    const account = this.currentAccount();
    if(!account?.email){
      card.hidden = true;
      return;
    }

    card.hidden = false;

    if(!this.canUseServer()){
      summary.innerHTML = `<div class="social-empty">Follow works on the live Pilingo app with the server turned on.</div>`;
      followingList.innerHTML = "";
      followersList.innerHTML = "";
      discoverList.innerHTML = "";
      return;
    }

    const freshSnapshot = await this.fetchSnapshot();
    if(freshSnapshot){
      this.lastSnapshot = freshSnapshot;
    }
    const snapshot = freshSnapshot || this.lastSnapshot;

    if(!snapshot?.currentStudent){
      summary.innerHTML = `<div class="social-empty">Your social circle will appear here after the app finds your account.</div>`;
      followingList.innerHTML = "";
      followersList.innerHTML = "";
      discoverList.innerHTML = "";
      return;
    }

    const current = snapshot.currentStudent;
    summary.innerHTML = `
      <div class="social-stat">
        Following
        <span>${Number(current.followingCount || 0)}</span>
      </div>
      <div class="social-stat">
        Followers
        <span>${Number(current.followersCount || 0)}</span>
      </div>
      <div class="social-stat">
        Rank
        <span>${current.rank ? `#${current.rank}` : "-"}</span>
      </div>
    `;

    followingList.innerHTML = this.renderStudentList(
      "Following",
      snapshot.followingStudents,
      "You are not following anyone yet. Follow students to build a learning circle."
    );

    followersList.innerHTML = this.renderStudentList(
      "Followers",
      snapshot.followerStudents,
      "No followers yet. Keep learning and other students can follow you."
    );

    discoverList.innerHTML = this.renderDiscoverList(snapshot.suggestedStudents || []);
  },

  renderStudentList(title, students, emptyMessage){
    if(!Array.isArray(students) || !students.length){
      return `
        <div class="social-section-title">${escapeHtml(title)}</div>
        <div class="social-empty">${escapeHtml(emptyMessage)}</div>
      `;
    }

    return `
      <div class="social-section-title">${escapeHtml(title)}</div>
      ${students.map((student) => `
        <div class="social-student-card compact">
          <div class="social-student-main">
            <strong>${escapeHtml(student.name || "Student")}</strong>
            <span>${this.rankLine(student)}</span>
          </div>
        </div>
      `).join("")}
    `;
  },

  renderDiscoverList(students){
    if(!Array.isArray(students) || !students.length){
      return `
        <div class="social-section-title">Find learners</div>
        <div class="social-empty">You already follow everyone available right now.</div>
      `;
    }

    return `
      <div class="social-section-title">Find learners</div>
      ${students.map((student) => `
        <div class="social-student-card">
          <div class="social-student-main">
            <strong>${escapeHtml(student.name || "Student")}</strong>
            <span>${this.rankLine(student)}</span>
          </div>
          <button class="social-follow-button" type="button" onclick="toggleStudentFollow('${escapeAttr(student.email)}', ${student.isFollowing ? "false" : "true"})">
            ${student.isFollowing ? "Following" : "Follow"}
          </button>
        </div>
      `).join("")}
    `;
  },

  rankLine(student){
    const rank = student?.rank ? `#${student.rank}` : "Unranked";
    const xp = `XP ${Number(student?.xp || 0)}`;
    const grade = `Grade ${Math.round(Number(student?.averageGrade || 0))}%`;
    return `${rank} • ${xp} • ${grade}`;
  },

  startPolling(){
    if(this.pollTimer) clearInterval(this.pollTimer);
    this.render();
    this.pollTimer = setInterval(() => {
      this.lastSnapshot = null;
      this.render();
    }, 18000);
  }
};

function escapeAttr(value){
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/'/g, "&#39;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function toggleStudentFollow(targetEmail, shouldFollow){
  try {
    if(shouldFollow){
      await PilingoSocial.follow(targetEmail);
    } else {
      await PilingoSocial.unfollow(targetEmail);
    }
    await PilingoSocial.render();
  } catch(error) {
    alert(error?.message || "Could not update follow status.");
  }
}

window.PilingoSocial = PilingoSocial;
window.toggleStudentFollow = toggleStudentFollow;
