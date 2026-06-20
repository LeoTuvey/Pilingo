(function(){
  let installPrompt = null;
  let reloadingForUpdate = false;

  if("serviceWorker" in navigator){
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js?v=6").then((registration) => {
        registration.update().catch(() => {});

        if(registration.waiting) {
          registration.waiting.postMessage({ type:"SKIP_WAITING" });
        }

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if(!worker) return;

          worker.addEventListener("statechange", () => {
            if(worker.state === "installed" && navigator.serviceWorker.controller) {
              worker.postMessage({ type:"SKIP_WAITING" });
            }
          });
        });
      }).catch(() => {});
    });

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if(reloadingForUpdate) return;
      reloadingForUpdate = true;
      window.location.reload();
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
