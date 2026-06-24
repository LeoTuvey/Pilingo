const PilingoAuth = {
  accountKey: "pilingo_account_v1",
  registerEndpoint: "/api/auth/register",
  loginEndpoint: "/api/auth/login",
  requestResetEndpoint: "/api/auth/request-reset",
  resetPasswordEndpoint: "/api/auth/reset-password",

  loadAccount(){
    try {
      const raw = localStorage.getItem(this.accountKey);
      return raw ? JSON.parse(raw) : null;
    } catch(error) {
      return null;
    }
  },

  hasAccount(){
    const account = this.loadAccount();
    return !!(account && account.name && account.email);
  },

  saveAccount(account){
    if(!account) return null;
    localStorage.setItem(this.accountKey, JSON.stringify(account));
    localStorage.setItem("pilingo_current_user", account.name || "Learner");
    return account;
  },

  clearAccount(){
    localStorage.removeItem(this.accountKey);
  },

  logout(){
    const account = this.loadAccount();
    this.clearAccount();
    return account;
  },

  async postJson(url, payload){
    const response = await fetch(url, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify(payload || {})
    });
    const data = await response.json().catch(() => ({}));
    if(!response.ok || !data.ok){
      throw new Error(data.error || "Request failed.");
    }
    return data;
  },

  async registerAccount(data){
    const payload = {
      name: String(data?.name || "").trim(),
      email: String(data?.email || "").trim().toLowerCase(),
      phone: String(data?.phone || "").trim(),
      password: String(data?.password || "").trim(),
      location: String(data?.location || "").trim()
    };
    const dataOut = await this.postJson(this.registerEndpoint, payload);
    return this.saveAccount(dataOut.account);
  },

  async loginAccount(data){
    const payload = {
      email: String(data?.email || "").trim().toLowerCase(),
      password: String(data?.password || "").trim()
    };
    const dataOut = await this.postJson(this.loginEndpoint, payload);
    return this.saveAccount(dataOut.account);
  },

  async requestPasswordReset(email){
    const payload = {
      email: String(email || "").trim().toLowerCase()
    };
    await this.postJson(this.requestResetEndpoint, payload);
    return true;
  },

  async resetPassword(email, code, newPassword){
    const payload = {
      email: String(email || "").trim().toLowerCase(),
      code: String(code || "").trim(),
      newPassword: String(newPassword || "").trim()
    };
    const dataOut = await this.postJson(this.resetPasswordEndpoint, payload);
    return this.saveAccount(dataOut.account);
  },

  updateAccount(patch){
    const current = this.loadAccount();
    if(!current) return null;
    const next = { ...current, ...(patch || {}) };
    localStorage.setItem(this.accountKey, JSON.stringify(next));
    return next;
  },

  requireAccount(){
    const path = window.location.pathname || "";
    const onIndex = path.endsWith("index.html") || path.endsWith("/") || path === "";
    const onSplash = path.endsWith("splash.html");

    if(this.hasAccount() || onIndex || onSplash) return true;

    window.location.href = "index.html";
    return false;
  }
};

window.PilingoAuth = PilingoAuth;
