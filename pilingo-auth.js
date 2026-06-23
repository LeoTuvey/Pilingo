const PilingoAuth = {
  accountKey: "pilingo_account_v1",

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

  createAccount(data){
    if(!data || typeof data !== "object") return false;

    const name = String(data.name || "").trim();
    const email = String(data.email || "").trim().toLowerCase();
    const password = String(data.password || "").trim();

    if(!name || !email || !password) return false;

    const account = {
      name,
      email,
      password,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(this.accountKey, JSON.stringify(account));
    localStorage.setItem("pilingo_current_user", name);
    return true;
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
