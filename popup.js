const selectedSimilarBooks = [];

async function fetchGoodreadsHistory() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.url.includes('goodreads.com')) {
        reject(new Error('Please open your Goodreads "My Books" page and try again.'));
        return;
      }
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: () => {
            return [...document.querySelectorAll('a.bookTitle span')]
              .map(el => el.textContent)
              .join(', ');
          }
        },
        (results) => {
          if (chrome.runtime.lastError || !results || !results[0].result) {
            reject(new Error('Could not read Goodreads page.'));
          } else {
            resolve(results[0].result);
          }
        }
      );
    });
  });
}

function parseCSVTitles(text) {
  return text
    .split('\n')
    .map(line => line.split(',')[0].trim())
    .filter(Boolean)
    .join(' ');
}

async function fetchRecommendations(description, history, csvBooks, similarBooks) {
  const apiKey = 'YOUR_GOOGLE_BOOKS_API_KEY';
  const queryParts = [description, history, csvBooks, similarBooks].filter(Boolean).join(' ');
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(queryParts)}&maxResults=3&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.items || []).map(item => {
    const info = item.volumeInfo;
    const title = info.title;
    const desc = info.description || 'No description available.';
    const review = desc.length > 200 ? desc.slice(0, 200).replace(/\s+\S*$/, '') + '...' : desc;
    return {
      title,
      review,
      rating: info.averageRating || null,
      ratingsCount: info.ratingsCount || 0,
      amazon: `https://www.amazon.com/s?k=${encodeURIComponent(title)}`,
      goodreads: `https://www.goodreads.com/search?q=${encodeURIComponent(title)}`
    };
  });
}

async function searchSimilarBooks(query) {
  const apiKey = 'YOUR_GOOGLE_BOOKS_API_KEY';
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.items || []).map(item => item.volumeInfo.title);
}

function renderSimilarBookResults(titles) {
  const container = document.getElementById('similarBooksResults');
  container.innerHTML = '';
  titles.forEach(title => {
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = title;
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        if (!selectedSimilarBooks.includes(title)) {
          selectedSimilarBooks.push(title);
        }
      } else {
        const idx = selectedSimilarBooks.indexOf(title);
        if (idx !== -1) {
          selectedSimilarBooks.splice(idx, 1);
        }
      }
    });
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(' ' + title));
    container.appendChild(label);
  });
}

function renderRecommendations(list) {
  const container = document.getElementById('recommendations');
  container.innerHTML = '';
  list.forEach(b => {
    const div = document.createElement('div');
    div.className = 'book';
    const title = document.createElement('strong');
    title.textContent = b.title;
    const review = document.createElement('p');
    review.textContent = b.review;
    const rating = document.createElement('p');
    if (b.rating) {
      const stars = '★'.repeat(Math.round(b.rating)) + '☆'.repeat(5 - Math.round(b.rating));
      rating.textContent = `${stars} (${b.rating.toFixed(1)} / 5 from ${b.ratingsCount} reviews)`;
    } else {
      rating.textContent = 'No rating available.';
    }
    const links = document.createElement('p');
    const amazon = document.createElement('a');
    amazon.href = b.amazon;
    amazon.textContent = 'Amazon';
    amazon.target = '_blank';
    const goodreads = document.createElement('a');
    goodreads.href = b.goodreads;
    goodreads.textContent = 'Goodreads';
    goodreads.target = '_blank';
    links.appendChild(amazon);
    links.appendChild(document.createTextNode(' | '));
    links.appendChild(goodreads);
    div.appendChild(title);
    div.appendChild(review);
    div.appendChild(rating);
    div.appendChild(links);
    container.appendChild(div);
  });
}

document.getElementById('recommendForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const desc = document.getElementById('description').value;
  const useHistory = document.getElementById('useHistory').checked;
  const file = document.getElementById('csvFile').files[0];
  const recommendationsEl = document.getElementById('recommendations');
  recommendationsEl.textContent = 'Loading...';
  try {
    const [history, csvBooks] = await Promise.all([
      useHistory ? fetchGoodreadsHistory() : '',
      file ? file.text().then(parseCSVTitles) : ''
    ]);
    const recs = await fetchRecommendations(desc, history, csvBooks, selectedSimilarBooks.join(', '));
    renderRecommendations(recs);
  } catch (err) {
    recommendationsEl.textContent = err.message;
  }
});

document.getElementById('similarBookInput').addEventListener('input', async (e) => {
  const query = e.target.value.trim();
  if (query.length < 3) {
    document.getElementById('similarBooksResults').innerHTML = '';
    return;
  }
  const titles = await searchSimilarBooks(query);
  renderSimilarBookResults(titles);
});
