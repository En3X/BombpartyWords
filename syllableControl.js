(function () {
  let syllable = document.querySelector(".syllable");
  let footer = document.querySelector(".bottom");
  // * keyboard dispatch event

  let middle = document.querySelector(".quickRules");
  let answerDiv = document.createElement("div");
  answerDiv.style = `  position: absolute;
  height: fit-content;
  top: 10%;
  left: 1%;
  background: #ffffff;
  min-width: 200px;
  min-height: 50px;
  width: fit-content;
  border-radius: 10px;
  color: #000000;

`;

  middle.prepend(answerDiv);

  let observer = new MutationObserver(() => {
    if (syllable) {
      let filtered = filterWords(syllable.textContent);
      answerDiv.innerHTML = "";
      filtered.map((word) => {
        let answerTab = document.createElement("div");
        answerTab.textContent = word;
        answerTab.style = `border-bottom: 1px solid gray;
        padding: 5px 15px; cursor:pointer;  color: #000000;
        `;

        answerTab.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          let selfTurnDiv = document.querySelector(".selfTurn");
          if (selfTurnDiv) {
            if (selfTurnDiv.getAttribute("hidden")) {
              console.log("Not your turn");
            } else {
              let parentForm = selfTurnDiv.querySelector("form");
              let input = parentForm.querySelector("input");
              input.focus();
              dispatchInputSimulation(parentForm, input, word);
            }
          }
        });

        answerTab.addEventListener("click", (e) => {
          window.open(`https://www.google.com/search?q=${word}+meaning`);
        });
        answerDiv.append(answerTab);
      });
    }
  });

  observer.observe(syllable, { childList: true });
})();

function filterWords(syllable, numWords = 5) {
  let regex = new RegExp(`[a-zA-Z]*${syllable}[a-zA-Z]*`, "i");

  const filteredWords = [];
  for (const word of words) {
    if (regex.test(word)) {
      filteredWords.push(word);
      if (filteredWords.length >= 500) {
        break; // Stop the loop once we have 5 elements
      }
    }
  }

  let result = [];

  for (i = 0; i <= numWords; i++) {
    result.push(
      filteredWords[Math.floor(Math.random() * filteredWords.length)]
    );
  }

  return result;
}

function dispatchInputSimulation(parentForm, input, word) {
  let index = 0;
  let typeInterval = setInterval(() => {
    input.value += word[index++];
    let inputEvent = new Event("input", {
      bubbles: true,
    });
    input.dispatchEvent(inputEvent);
    if (index >= word.length) {
      let subBtn = document.createElement("button");
      subBtn.type = "submit";
      parentForm.append(subBtn);
      subBtn.click();
      subBtn.remove();
      clearInterval(typeInterval);
    }
  }, 100);
}
