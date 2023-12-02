let FOUND_SYLLABLE = false;
let GAME_PAGE_LOADED = false;
let BOMB_DEFUSER_STATUS = "STOPPED";

// handle syllable change
let syllableChangeObserver = new MutationObserver(() => {
  if (FOUND_SYLLABLE) {
    let syllableHolder = document.querySelector(".syllable");
    console.log(syllableHolder.textContent);
  }
});

window.addEventListener(
  "load",
  (e) => {
    // setting up observers to listen for any change in DOM
    let mainPageChangeObserver = new MutationObserver(() => {
      let main = document.querySelector("div.main");

      if (main.getAttribute("hidden")) {
        GAME_PAGE_LOADED = false;
        syllableChangeObserver.disconnect();
      } else {
        GAME_PAGE_LOADED = true;
        initializeMain();
      }
    });

    // verifying the url using regex
    // URL Pattern: https://jklm.fun/<ANYTHING>

    let bomb_party_url_reg = /https:\/\/jklm\.fun\/([a-zA-Z0-9]+)/g;
    let url = document.location.href;
    if (bomb_party_url_reg.test(url)) {
      let mainPage = document.querySelector("div.main");
      if (mainPage === null || mainPage === undefined) {
        console.log("Cannot find main page");
      } else {
        mainPageChangeObserver.observe(mainPage, {
          attributeFilter: ["hidden"],
          attributeOldValue: true,
        });
      }
    }
  },
  false
);

function getInitializationHtml(msg) {
  let html = `<div class="newMessages" bis_skin_checked="1"><hr><span>${msg}</span><hr></div>`;
  return html;
}

async function initializeMain() {
  if (GAME_PAGE_LOADED) {
    let initializerNavComponent = document.querySelector(".volume");
    let initializeBtn = document.createElement("img");
    initializeBtn.src = chrome.runtime.getURL("icon16.png");
    initializeBtn.style = `cursor:pointer`;
    initializeBtn.addEventListener("click", async (e) => {
      let chatRoom = document.querySelector(".log");
      if (chatRoom) {
        if (BOMB_DEFUSER_STATUS === "STARTED") {
          chatRoom.innerHTML += getInitializationHtml(
            "Bomb defuser already running"
          );
        } else if (BOMB_DEFUSER_STATUS === "LOADING") {
          chatRoom.innerHTML += getInitializationHtml(
            "Bomb defuser is already loading"
          );
        } else {
          BOMB_DEFUSER_STATUS = "LOADING";
          chatRoom.innerHTML += getInitializationHtml(
            "Initializing bomb defuser"
          );
          let syllableHolderFrame = document.querySelector("iframe");
          if (syllableHolderFrame) {
            syllableHolderFrame.id = "gameFrame";

            // * Tell background service to inject script
            await accessFrameFromBG(chatRoom);
            FOUND_SYLLABLE = true;
          } else {
            console.log(syllableHolder);
            FOUND_SYLLABLE = false;
            BOMB_DEFUSER_STATUS = "STOPPED";
            chatRoom.innerHTML += getInitializationHtml("Syllables not found");
            chatRoom.innerHTML += getInitializationHtml(
              "Disconnected bomb defuser"
            );
          }
        }
      } else {
        alert("Not able to initialize yet");
      }
    });

    initializerNavComponent.prepend(initializeBtn);
  }
}

async function accessFrameFromBG(chatRoom) {
  let response = await chrome.runtime.sendMessage({
    type: "findSyllable",
  });
  if (response) {
    const { isScriptAttached } = await response;
    if (isScriptAttached) {
      BOMB_DEFUSER_STATUS = "STARTED";
      chatRoom.innerHTML += getInitializationHtml("Initialized defuser");
    } else {
      BOMB_DEFUSER_STATUS = "STOPPED";
      chatRoom.innerHTML += getInitializationHtml("Some error occured");
    }
  } else {
    console.log("No response from background ", response);
  }
}
