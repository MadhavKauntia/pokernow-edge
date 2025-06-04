function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
  }

  function simplifyRatio(numerator, denominator) {
    const divisor = gcd(numerator, denominator);
    return [Math.round(numerator / divisor), Math.round(denominator / divisor)];
  }

  function updatePotOddsDisplay() {
    // Adjust these selectors to match PokerNow elements
    const potElem = document.querySelector(".table-pot-size .add-on-container .add-on .chips-value .normal-value");      // where the pot is shown
    const anchorElem = document.querySelector(".main-value"); // where to insert the odds

    if (!potElem || !anchorElem) return;

    const potValue = parseFloat(potElem.textContent.replace(/[^0-9.]/g, ""));
    const callAmount = getCallAmount(); // We'll define this separately

    if (isNaN(potValue) || isNaN(callAmount)) return;

    // If there's no call to make, hide the odds display
    if (callAmount <= 0) {
      const existing = document.querySelector(".pot-odds-overlay");
      if (existing) existing.remove();
      return;
    }

    const [num, den] = simplifyRatio(callAmount, potValue);
    const percent = ((callAmount / (potValue + callAmount)) * 100).toFixed(1);

    // Check if already added
    let oddsElem = document.querySelector(".pot-odds-overlay");
    if (!oddsElem) {
      oddsElem = document.createElement("div");
      oddsElem.className = "pot-odds-overlay";
      oddsElem.style.fontSize = "13px";
      oddsElem.style.fontWeight = "bold";
      oddsElem.style.color = "black";
      oddsElem.style.marginTop = "4px";
      oddsElem.style.textAlign = "center"
      anchorElem.parentNode.insertBefore(oddsElem, anchorElem.nextSibling);
    }

    oddsElem.textContent = `Pot Odds: ${den}:${num} (${percent}%)`;
  }

  function getCallAmount() {
    // Example: find element showing amount to call
    const callElem = document.querySelector(".call"); // update to actual selector
    if (!callElem) return 0;

    const val = parseFloat(callElem.textContent.replace(/[^0-9.]/g, ""));
    return isNaN(val) ? 0 : val;
  }

  // Run regularly to stay in sync
  setInterval(updatePotOddsDisplay, 1000);
  