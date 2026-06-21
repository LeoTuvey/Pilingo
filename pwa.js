(function(){
  let installPrompt = null;

  if("serviceWorker" in navigator){
    window.addEventListener("load", async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));

        if("caches" in window) {
          const keys = await caches.keys();
          const pilingoKeys = keys.filter((key) => key.startsWith("pilingo-"));
          await Promise.all(pilingoKeys.map((key) => caches.delete(key)));
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
