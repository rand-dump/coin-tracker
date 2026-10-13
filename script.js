const API_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h";

const coinTable = document.getElementById("coinTable");
const searchInput = document.getElementById("searchInput");
const marketCapBtn = document.getElementById("marketCapBtn");
const percentageBtn = document.getElementById("percentageBtn");
const status = document.getElementById("status");

let allCoins = [];
let currentSort = "market_cap";
let sortDirection = "desc";

// Format large numbers with commas.
function formatNumber(value) {
  if (value == null || !Number.isFinite(Number(value))) {
    return "N/A";
  }

  return Number(value).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}

// Render the given coins in the table.
function renderCoins(coins) {
  coinTable.replaceChildren();

  if (coins.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.textContent = "No cryptocurrencies found.";
    row.appendChild(cell);
    coinTable.appendChild(row);
    return;
  }

  coins.forEach((coin) => {
    const row = document.createElement("tr");

    // Name and logo.
    const nameCell = document.createElement("td");
    const nameWrapper = document.createElement("div");
    nameWrapper.className = "coin-name";

    const image = document.createElement("img");
    image.src = coin.image;
    image.alt = coin.name;
    image.loading = "lazy";

    const name = document.createElement("span");
    name.textContent = coin.name;

    nameWrapper.append(image, name);
    nameCell.appendChild(nameWrapper);

    // Symbol.
    const symbolCell = document.createElement("td");
    symbolCell.textContent = coin.symbol.toUpperCase();

    // Current price.
    const priceCell = document.createElement("td");
    priceCell.textContent = formatNumber(coin.current_price);

    // Total trading volume.
    const volumeCell = document.createElement("td");
    volumeCell.textContent = formatNumber(coin.total_volume);

    // 24-hour percentage change.
    const percentageCell = document.createElement("td");
    const percentage = coin.price_change_percentage_24h;

    percentageCell.textContent =
      percentage == null ? "N/A" : `${Number(percentage).toFixed(2)}%`;

    if (percentage != null) {
      percentageCell.className = percentage >= 0 ? "positive" : "negative";
    }

    // Market capitalization.
    const marketCapCell = document.createElement("td");
    marketCapCell.textContent = `Mkr Cap: ${formatNumber(coin.market_cap)}`;

    row.append(
      nameCell,
      symbolCell,
      priceCell,
      volumeCell,
      percentageCell,
      marketCapCell,
    );

    coinTable.appendChild(row);
  });
}

// Sort the data, then apply the current search.
function updateTable() {
  const query = searchInput.value.trim().toLowerCase();

  const filteredCoins = allCoins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(query) ||
      coin.symbol.toLowerCase().includes(query),
  );

  filteredCoins.sort((a, b) => {
    const first = a[currentSort] ?? -Infinity;
    const second = b[currentSort] ?? -Infinity;

    return sortDirection === "desc" ? second - first : first - second;
  });

  renderCoins(filteredCoins);
}

// METHOD 1: Fetch using .then().
function fetchCoins() {
  status.textContent = "Loading cryptocurrency data...";

  fetch(API_URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      return response.json();
    })
    .then((data) => {
      allCoins = data;
      updateTable();
      status.textContent = `Showing ${allCoins.length} cryptocurrencies`;
    })
    .catch((error) => {
      console.error("Error fetching coins:", error);
      status.textContent = "Unable to load data. Please try again.";
    });
}

// METHOD 2: Fetch using async/await.
async function refreshCoins() {
  try {
    status.textContent = "Refreshing data...";

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    allCoins = data;
    updateTable();

    status.textContent = `Showing ${allCoins.length} cryptocurrencies`;
  } catch (error) {
    console.error("Error refreshing coins:", error);
    status.textContent = "Unable to refresh data. Please try again.";
  }
}

// Search as the user types.
searchInput.addEventListener("input", updateTable);

// Sort by market capitalization.
marketCapBtn.addEventListener("click", () => {
  if (currentSort === "market_cap") {
    sortDirection = sortDirection === "desc" ? "asc" : "desc";
  } else {
    currentSort = "market_cap";
    sortDirection = "desc";
  }

  updateTable();
});

// Sort by 24-hour percentage change.
percentageBtn.addEventListener("click", () => {
  if (currentSort === "price_change_percentage_24h") {
    sortDirection = sortDirection === "desc" ? "asc" : "desc";
  } else {
    currentSort = "price_change_percentage_24h";
    sortDirection = "desc";
  }

  updateTable();
});

// Initially load the data using .then().
fetchCoins();

// You can call refreshCoins() whenever you want to refresh the data.
