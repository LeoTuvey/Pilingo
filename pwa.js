(function(){
  let installPrompt = null;

  if("serviceWorker" in navigator){
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
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
