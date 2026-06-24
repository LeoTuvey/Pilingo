(function(){
  let installPrompt = null;
  const reloadKey = "pilingo_cache_reset_v2";

  if("serviceWorker" in navigator){
    window.addEventListener("load", async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));

        if("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((key) => caches.delete(key)));
        }

        const needsRefresh = registrations.length > 0;
        if(needsRefresh && !sessionStorage.getItem(reloadKey)) {
          sessionStorage.setItem(reloadKey, "done");
          window.location.replace(window.location.pathname + "?fresh=1");
          return;
        }
      } catch(error) {
        // fail silently to keep app startup stable
      }
    });
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;

    const button = document.getElementById("installApp");
    if(button) button.hidden = false;
  });

  window.installPilingo = async function(){
    if(!installPrompt) return;

    installPrompt.prompt();
    await installPrompt.userChoice.catch(() => {});
    installPrompt = null;

    const button = document.getElementById("installApp");
    if(button) button.hidden = true;
  };
})();
