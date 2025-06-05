let previousHandStarted = false;
let lastHandTimestamp = 0;

const getHUDData = (name) => {
  const all = JSON.parse(localStorage.getItem("hudStats") || "{}");
  if (!all[name]) {
    all[name] = { vpip: 0, pfr: 0, hands: 0 };
    localStorage.setItem("hudStats", JSON.stringify(all));
  }
  return all[name];
};

const saveHUDData = (name, data) => {
  const all = JSON.parse(localStorage.getItem("hudStats") || "{}");
  all[name] = data;
  localStorage.setItem("hudStats", JSON.stringify(all));
};

const createOrUpdateHUDBox = (playerDiv, name) => {
  const data = getHUDData(name);
  const vpipPct = data.hands ? Math.round((data.vpip / data.hands) * 100) : 0;

  let hud = document.getElementById(`hud-${name}`);
  if (!hud) {
    hud = document.createElement("div");
    hud.id = `hud-${name}`;
    hud.style.position = "absolute";
    hud.style.backgroundColor = "rgba(0,0,0,0.7)";
    hud.style.color = "white";
    hud.style.padding = "4px 6px";
    hud.style.borderRadius = "4px";
    hud.style.fontSize = "12px";
    hud.style.zIndex = "9999";
    hud.style.pointerEvents = "none";  // so clicks go through

    document.body.appendChild(hud);
  }

  // Update content
  hud.textContent = `Hands: ${data.hands} | VPIP: ${vpipPct}%`;

  // Position HUD over playerDiv
  const rect = playerDiv.getBoundingClientRect();
  hud.style.top = `${rect.top + window.scrollY}px`; // or adjust as needed
  hud.style.left = `${rect.right + 5 + window.scrollX}px`; // show HUD just to the right
};

const updateAllHUDs = () => {
  const allDivs = document.querySelectorAll("div.table-player");
  const playerDivs = [...allDivs].filter(div => {
    return /^table-player-\d+$/.test(
      [...div.classList].find(c => c.startsWith("table-player-"))
    );
  });

  playerDivs.forEach((playerDiv) => {
    const nameTags = playerDiv.querySelectorAll(".table-player-name");

    let nameTag = null;
    for (const el of nameTags) {
      // 🛑 Skip if it contains or is a note icon
      if (el.className.includes("note-icon") || el.querySelector(".note-icon")) continue;

      // ✅ Use this as the main player name tag
      nameTag = el;
      break;
    }
    if (!nameTag) return;
    const name = nameTag.textContent.trim();
    if (!name) return;

    createOrUpdateHUDBox(playerDiv, name);
  });
};

const monitorHandsAndVPIP = () => {
  const tableCards = document.querySelector(".table-cards");
  if (!tableCards) return;

  const isPreflop = tableCards.children.length === 0;

  if (isPreflop && !previousHandStarted) {
    const now = Date.now();
    if (now - lastHandTimestamp < 5000) return;

    lastHandTimestamp = now;
    previousHandStarted = true;

    const allDivs = document.querySelectorAll("div.table-player");
    const playerDivs = [...allDivs].filter(div => {
      return /^table-player-\d+$/.test(
        [...div.classList].find(c => c.startsWith("table-player-"))
      );
    });

    playerDivs.forEach((playerDiv) => {
      const nameTags = playerDiv.querySelectorAll(".table-player-name");

      let nameTag = null;
      for (const el of nameTags) {
        // Ignore if this element contains the note icon
        if (el.className.includes("note-icon") || el.querySelector(".note-icon")) continue;

        // Ignore if no meaningful text
        if (el.textContent.trim().length === 0) continue;

        nameTag = el;
        break;
      }
      if (!nameTag) return;
      const name = nameTag.textContent.trim();
      if (!name) return;

      const data = getHUDData(name);
      data.hands += 1;

      const betValue = playerDiv.querySelector(".table-player-bet-value");
      if (betValue && !betValue.classList.contains("check")) {
        data.vpip += 1;
      }

      saveHUDData(name, data);
      createOrUpdateHUDBox(playerDiv, name);
    });
  }

  if (!isPreflop) {
    previousHandStarted = false;
  }

  updateAllHUDs();
};

setInterval(monitorHandsAndVPIP, 500);
