function debounce(fn, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

function createNotePopup(playerName, playerElem) {
  // Remove existing popup if any
  document.querySelectorAll(".pnote-popup").forEach(p => p.remove());

  const popup = document.createElement("div");
  popup.className = "pnote-popup";
  popup.style.position = "absolute";
  popup.style.zIndex = 1000;
  popup.style.background = "#222";
  popup.style.color = "#fff";
  popup.style.border = "1px solid #aaa";
  popup.style.borderRadius = "6px";
  popup.style.padding = "8px";
  popup.style.fontSize = "14px";
  popup.style.width = "220px";
  popup.style.boxShadow = "0 2px 6px rgba(0,0,0,0.5)";
  popup.style.display = "flex";
  popup.style.flexDirection = "column";

  const textarea = document.createElement("textarea");
  textarea.style.boxSizing = "border-box";
  textarea.style.width = "100%";
  textarea.style.maxWidth = "100%";
  textarea.style.border = "1px solid #555";
  textarea.style.borderRadius = "4px";
  textarea.style.padding = "6px";
  textarea.style.background = "#111";
  textarea.style.color = "#fff";
  textarea.style.fontFamily = "monospace";
  textarea.style.resize = "none";
  textarea.style.minHeight = "100px";

  popup.appendChild(textarea);
  document.body.appendChild(popup);

  const rect = playerElem.getBoundingClientRect();
  const popupWidth = 220;
  const spaceRight = window.innerWidth - rect.right;
  const leftOffset = spaceRight > popupWidth + 10
    ? rect.right + 10
    : rect.left - popupWidth - 10;

  popup.style.top = `${rect.top + window.scrollY - 10}px`;
  popup.style.left = `${leftOffset + window.scrollX}px`;

  // Load saved note
  chrome.storage.local.get([playerName], (res) => {
    const note = res[playerName] || "";
    textarea.value = note.split('\n').map(line => line.startsWith('•') ? line : `• ${line}`).join('\n');
  });

  // Auto-save on input (debounced)
  const saveNote = debounce(() => {
    const cleaned = textarea.value
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.startsWith("•") ? line : `• ${line}`)
      .join('\n');
    chrome.storage.local.set({ [playerName]: cleaned });
  }, 400);

  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const cursorPos = textarea.selectionStart;
      const value = textarea.value;

      // Find previous line's indentation
      const before = value.slice(0, cursorPos);
      const after = value.slice(cursorPos);
      const lastLineBreak = before.lastIndexOf('\n');
      const lastLine = before.slice(lastLineBreak + 1).trimStart();
      const bullet = lastLine.startsWith('•') ? '• ' : '';

      textarea.value = before + '\n' + bullet + after;

      // Move cursor correctly
      const newPos = cursorPos + 1 + bullet.length;
      textarea.selectionStart = textarea.selectionEnd = newPos;

      saveNote();
    } else {
      // Save after any other input
      saveNote();
    }
  });

  // Click outside to close
  const handleOutsideClick = (e) => {
    if (!popup.contains(e.target)) {
      popup.remove();
      document.removeEventListener("click", handleOutsideClick);
    }
  };
  setTimeout(() => document.addEventListener("click", handleOutsideClick), 10);
}

function addNoteButton(playerElem, playerName) {
  const button = document.createElement("button");
  button.innerText = "📝";
  button.className = "note-icon"
  button.title = "View/Edit Note";
  button.style.marginLeft = "6px";
  button.style.cursor = "pointer";

  button.onclick = (e) => {
    e.stopPropagation();
    const existing = document.querySelector(".pnote-popup");
    if (existing) {
      existing.remove();
    } else {
      createNotePopup(playerName, playerElem);
    }
  };

  playerElem.appendChild(button);
}

function attachNoteButtons() {
  const playerElems = document.querySelectorAll(".table-player-name");

  playerElems.forEach((elem) => {
    const playerName = elem.textContent.trim();

    if (!elem.dataset.notesAttached) {
      addNoteButton(elem, playerName);
      elem.dataset.notesAttached = "true";
    }
  });
}

setInterval(attachNoteButtons, 2000);