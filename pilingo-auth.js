const PilingoAuth = {
  accountKey: "pilingo_account_v1",
  accountsKey: "pilingo_accounts_v1",
  resetsKey: "pilingo_resets_v1",
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

  shouldUseLocalMode(){
    const host = String(window.location.hostname || "").toLowerCase();
    return host.endsWith("github.io");
  },

  loadLocalAccounts(){
    try {
      const raw = localStorage.getItem(this.accountsKey);
      const accounts = raw ? JSON.parse(raw) : [];
      return Array.isArray(accounts) ? accounts : [];
    } catch(error) {
      return [];
    }
  },

  saveLocalAccounts(accounts){
    localStorage.setItem(this.accountsKey, JSON.stringify(accounts || []));
  },

  loadLocalResets(){
    try {
      const raw = localStorage.getItem(this.resetsKey);
      const resets = raw ? JSON.parse(raw) : [];
      return Array.isArray(resets) ? resets : [];
    } catch(error) {
      return [];
    }
  },

  saveLocalResets(resets){
    localStorage.setItem(this.resetsKey, JSON.stringify(resets || []));
  },

  createLocalAccount(data){
    const name = String(data?.name || "").trim();
    const email = String(data?.email || "").trim().toLowerCase();
    const phone = String(data?.phone || "").trim();
    const password = String(data?.password || "").trim();
    const location = String(data?.location || "").trim();

    if(!name || !email || !phone || !password){
      throw new Error("Please fill in name, email, phone number, and password.");
    }

    const accounts = this.loadLocalAccounts();
    const exists = accounts.some((account) => String(account.email || "").trim().toLowerCase() === email);
    if(exists){
      throw new Error("This email is already in use.");
    }

    const account = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      name,
      email,
      phone,
      password,
      location,
      createdAt: new Date().toISOString()
    };

    accounts.push(account);
    this.saveLocalAccounts(accounts);
    return this.saveAccount({
      id: account.id,
      name: account.name,
      email: account.email,
      phone: account.phone,
      location: account.location,
      createdAt: account.createdAt
    });
  },

  loginLocalAccount(data){
    const email = String(data?.email || "").trim().toLowerCase();
    const password = String(data?.password || "").trim();
    const accounts = this.loadLocalAccounts();
    const account = accounts.find((item) => String(item.email || "").trim().toLowerCase() === email);

    if(!account){
      throw new Error("No account was found for this email. Please sign up first.");
    }
    if(String(account.password || "") !== password){
      throw new Error("Wrong password. Please try again.");
    }

    return this.saveAccount({
      id: account.id,
      name: account.name,
      email: account.email,
      phone: account.phone,
      location: account.location || "",
      createdAt: account.createdAt
    });
  },

  requestLocalPasswordReset(email){
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if(!normalizedEmail){
      throw new Error("Please enter the account email first.");
    }

    const accounts = this.loadLocalAccounts();
    const account = accounts.find((item) => String(item.email || "").trim().toLowerCase() === normalizedEmail);
    if(!account){
      throw new Error("No account was found for this email. Please sign up first.");
    }

    const resets = this.loadLocalResets().filter((item) => item.email !== normalizedEmail);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    resets.push({
      email: normalizedEmail,
      code,
      expiresAt: Date.now() + (15 * 60 * 1000)
    });
    this.saveLocalResets(resets);
    return { code };
  },

  resetLocalPassword(email, code, newPassword){
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedCode = String(code || "").trim();
    const password = String(newPassword || "").trim();
    if(!normalizedEmail || !normalizedCode || !password){
      throw new Error("Please enter your email, reset code, and new password.");
    }

    const resets = this.loadLocalResets();
    const reset = resets.find((item) =>
      item.email === normalizedEmail &&
      item.code === normalizedCode &&
      Number(item.expiresAt || 0) > Date.now()
    );
    if(!reset){
      throw new Error("The code is wrong or expired.");
    }

    const accounts = this.loadLocalAccounts();
    const index = accounts.findIndex((item) => String(item.email || "").trim().toLowerCase() === normalizedEmail);
    if(index < 0){
      throw new Error("No account was found for this email. Please sign up first.");
    }

    accounts[index].password = password;
    this.saveLocalAccounts(accounts);
    this.saveLocalResets(resets.filter((item) => !(item.email === normalizedEmail && item.code === normalizedCode)));

    return this.saveAccount({
      id: accounts[index].id,
      name: accounts[index].name,
      email: accounts[index].email,
      phone: accounts[index].phone,
      location: accounts[index].location || "",
      createdAt: accounts[index].createdAt
    });
  },

  buildUrl(path){
    try {
      return new URL(path, this.getPreferredApiOrigin()).toString();
    } catch(error) {
      return path;
    }
  },

  getPreferredApiOrigin(){
    const origin = String(window.location.origin || "").trim();
    if(origin) return origin;

    const protocol = window.location.protocol === "https:" ? "https:" : "http:";
    const host = window.location.hostname || "localhost";
    const port = window.location.port || "3000";
    return `${protocol}//${host}${port ? `:${port}` : ""}`;
  },

  getApiOrigins(){
    const host = String(window.location.hostname || "").trim();
    const protocol = window.location.protocol === "https:" ? "https:" : "http:";
    const origins = [];

    const addOrigin = (value) => {
      const normalized = String(value || "").trim();
      if(!normalized || origins.includes(normalized)) return;
      origins.push(normalized);
    };

    addOrigin(this.getPreferredApiOrigin());

    if(host && host !== "localhost" && host !== "127.0.0.1"){
      addOrigin(`${protocol}//${host}:3000`);
    }

    addOrigin("http://localhost:3000");
    addOrigin("http://127.0.0.1:3000");

    return origins;
  },

  postJsonWithXhr(url, payload, origin){
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      const requestUrl = origin
        ? new URL(url, origin).toString()
        : this.buildUrl(url);

      request.open("POST", requestUrl, true);
      request.setRequestHeader("Content-Type", "application/json");

      request.onreadystatechange = () => {
        if(request.readyState !== 4) return;

        let data = {};
        try {
          data = request.responseText ? JSON.parse(request.responseText) : {};
        } catch(error) {
          data = {};
        }

        if(request.status >= 200 && request.status < 300 && data.ok) {
          resolve(data);
          return;
        }

        reject(new Error(data.error || `Request failed (${request.status || "unknown"}).`));
      };

      request.onerror = () => {
        reject(new Error("The app could not reach the server. Please refresh the page and try again."));
      };

      request.send(JSON.stringify(payload || {}));
    });
  },

  async postJson(url, payload){
    const origins = this.getApiOrigins();
    let lastError = null;

    for(const origin of origins){
      let response;

      try {
        response = await fetch(new URL(url, origin).toString(), {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          cache:"no-store",
          body: JSON.stringify(payload || {})
        });

        const data = await response.json().catch(() => ({}));
        if(!response.ok || !data.ok){
          throw new Error(data.error || `Request failed (${response.status || "unknown"}).`);
        }
        return data;
      } catch(error) {
        lastError = error;

        try {
          return await this.postJsonWithXhr(url, payload, origin);
        } catch(xhrError) {
          lastError = xhrError;
        }
      }
    }

    throw lastError || new Error("The app could not reach the server. Please refresh the page and try again.");
  },

  async registerAccount(data){
    if(this.shouldUseLocalMode()){
      return this.createLocalAccount(data);
    }
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
    if(this.shouldUseLocalMode()){
      return this.loginLocalAccount(data);
    }
    const payload = {
      email: String(data?.email || "").trim().toLowerCase(),
      password: String(data?.password || "").trim()
    };
    const dataOut = await this.postJson(this.loginEndpoint, payload);
    return this.saveAccount(dataOut.account);
  },

  async requestPasswordReset(email){
    if(this.shouldUseLocalMode()){
      return this.requestLocalPasswordReset(email);
    }
    const payload = {
      email: String(email || "").trim().toLowerCase()
    };
    return await this.postJson(this.requestResetEndpoint, payload);
  },

  async resetPassword(email, code, newPassword){
    if(this.shouldUseLocalMode()){
      return this.resetLocalPassword(email, code, newPassword);
    }
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
