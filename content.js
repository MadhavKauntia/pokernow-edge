function createNoteButtons(playerElem, playerName) {
  const container = document.createElement('span');
  container.style.marginLeft = '6px';

  // 📝 Add/Edit Note button
  const editBtn = document.createElement('button');
  editBtn.innerText = "📝";
  editBtn.title = "Add/Edit Note";
  editBtn.style.marginRight = '4px';
  editBtn.style.cursor = 'pointer';

  editBtn.onclick = async () => {
    const currentNote = await new Promise((resolve) =>
      chrome.storage.local.get([playerName], (res) => resolve(res[playerName] || ""))
    );
    const newNote = prompt(`Notes for ${playerName}:`, currentNote);
    if (newNote !== null) {
      chrome.storage.local.set({ [playerName]: newNote });
    }
  };

  // 👁️ View Note button
  const viewBtn = document.createElement('button');
  viewBtn.innerText = "👁️";
  viewBtn.title = "View Note";
  viewBtn.style.cursor = 'pointer';

  viewBtn.onclick = async () => {
    const currentNote = await new Promise((resolve) =>
      chrome.storage.local.get([playerName], (res) => resolve(res[playerName] || ""))
    );
    alert(`Note for ${playerName}:\n\n${currentNote || "(No note yet)"}`);
  };

  container.appendChild(editBtn);
  container.appendChild(viewBtn);
  playerElem.appendChild(container);
}

function attachNoteButtons() {
  const playerElems = document.querySelectorAll(".table-player-name"); // Replace with correct selector

  playerElems.forEach((elem) => {
    const playerName = elem.textContent.trim();

    if (!elem.dataset.notesAttached) {
      createNoteButtons(elem, playerName);
      elem.dataset.notesAttached = "true";
    }
  });
}

// Run regularly in case the player list changes
setInterval(attachNoteButtons, 2000);
