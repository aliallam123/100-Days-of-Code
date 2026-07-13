const auctionItems = [
  {
    lot: 'Lot 01',
    name: 'Midnight Diamond Necklace',
    description: 'A rare diamond necklace displayed under locked private viewing.',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=80',
    alt: 'Diamond necklace'
  },
  {
    lot: 'Lot 02',
    name: 'Lost Renaissance Painting',
    description: 'A dramatic gallery piece rumoured to have passed through three private vaults.',
    image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=900&q=80',
    alt: 'Fine art painting'
  },
  {
    lot: 'Lot 03',
    name: 'Royal Gold Chronograph',
    description: 'A collector-grade watch with a brushed gold case and midnight dial.',
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80',
    alt: 'Luxury gold watch'
  },
  {
    lot: 'Lot 04',
    name: 'Emerald Vault Ring',
    description: 'A deep green gemstone ring from a mysterious private estate sale.',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=80',
    alt: 'Emerald ring'
  }
];

const bids = {};
let currentItemIndex = 0;

const bidForm = document.getElementById('bidForm');
const bidderName = document.getElementById('bidderName');
const bidAmount = document.getElementById('bidAmount');
const bidCount = document.getElementById('bidCount');
const itemCount = document.getElementById('itemCount');
const ledgerList = document.getElementById('ledgerList');
const resultPanel = document.getElementById('resultPanel');
const winnerName = document.getElementById('winnerName');
const winnerBid = document.getElementById('winnerBid');
const itemImage = document.getElementById('itemImage');
const itemName = document.getElementById('itemName');
const itemDescription = document.getElementById('itemDescription');
const lotNumber = document.getElementById('lotNumber');

function renderItem() {
  const item = auctionItems[currentItemIndex];

  itemImage.src = item.image;
  itemImage.alt = item.alt;
  itemName.textContent = item.name;
  itemDescription.textContent = item.description;
  lotNumber.textContent = item.lot;
  itemCount.textContent = `${currentItemIndex + 1}/${auctionItems.length}`;
}

function updateLedger() {
  const entries = Object.keys(bids);

  bidCount.textContent = entries.length;
  ledgerList.innerHTML = '';

  if (entries.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.textContent = 'No encrypted bids yet.';
    ledgerList.appendChild(emptyItem);
    return;
  }

  entries.forEach((name, index) => {
    const li = document.createElement('li');
    li.textContent = `Bidder ${index + 1}: ${name[0].toUpperCase()}${'•'.repeat(Math.max(name.length - 1, 3))}`;
    ledgerList.appendChild(li);
  });
}

function clearInputs() {
  bidderName.value = '';
  bidAmount.value = '';
  bidderName.focus();
}

function revealWinner() {
  const names = Object.keys(bids);

  if (names.length === 0) {
    winnerName.textContent = 'No bids yet';
    winnerBid.textContent = 'Place at least one bid first.';
    resultPanel.classList.remove('hidden');
    return;
  }

  const winningPerson = names.reduce((highest, current) => {
    return bids[current] > bids[highest] ? current : highest;
  });

  winnerName.textContent = winningPerson;
  winnerBid.textContent = `£${bids[winningPerson].toLocaleString()}`;
  resultPanel.classList.remove('hidden');
}

bidForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = bidderName.value.trim();
  const amount = Number(bidAmount.value);

  if (!name || amount <= 0) {
    return;
  }

  bids[name] = amount;

  resultPanel.classList.add('hidden');
  updateLedger();
  clearInputs();
});

document.getElementById('newBidder').addEventListener('click', () => {
  resultPanel.classList.add('hidden');
  clearInputs();
});

document.getElementById('revealWinner').addEventListener('click', revealWinner);

document.getElementById('nextItem').addEventListener('click', () => {
  currentItemIndex = (currentItemIndex + 1) % auctionItems.length;
  renderItem();
});

document.getElementById('prevItem').addEventListener('click', () => {
  currentItemIndex = (currentItemIndex - 1 + auctionItems.length) % auctionItems.length;
  renderItem();
});

renderItem();
updateLedger();
