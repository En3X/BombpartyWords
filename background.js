chrome.runtime.onMessage.addListener(async (request, sender, response) => {
  if (request.type === "findSyllable") {
    let FRAME_ID = null;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.webNavigation.getAllFrames({ tabId: tabs[0].id }, (frames) => {
        if (frames) {
          for (const frame of frames) {
            if (frame.url.includes("/games/bombparty")) {
              FRAME_ID = frame.frameId;
              console.log(frame.frameId);
            }
          }

          if (FRAME_ID !== null) {
            chrome.scripting.executeScript(
              {
                target: { tabId: tabs[0].id, frameIds: [FRAME_ID] },
                files: ["./words.js", "./syllableControl.js"],
              },
              (result) => {
                if (chrome.runtime.lastError) {
                  console.error(
                    "Script injection error",
                    chrome.runtime.lastError.message
                  );
                  Promise.resolve(response({ isScriptAttached: false }));
                  return false;
                } else {
                  Promise.resolve(response({ isScriptAttached: true }));
                  console.log("Script injected successfully", result);
                  return true;
                }
              }
            );
          } else {
            Promise.resolve(response({ isScriptAttached: false }));

            console.log("Game frame not found");
            return false;
          }
        } else {
          Promise.resolve(response({ isScriptAttached: false }));
          console.log("No frames found");
          return false;
        }
      });
    });
  }
});
