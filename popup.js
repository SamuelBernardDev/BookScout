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

async function fetchRecommendations(description, history, csvBooks) {
  const apiKey = 'AIzaSyCjVa6PA6a7-f4hAkF5nSelisO1vBTnso0';
  const queryParts = [description, history, csvBooks].filter(Boolean).join(' ');
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(queryParts)}&maxResults=3&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  return (data.items || []).map(item => {
    const info = item.volumeInfo;
    const title = info.title;
    const review = info.description || 'No description available.';
    return {
      title,
      review,
      amazon: `https://www.amazon.com/s?k=${encodeURIComponent(title)}`,
      goodreads: `https://www.goodreads.com/search?q=${encodeURIComponent(title)}`
    };
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
    const recs = await fetchRecommendations(desc, history, csvBooks);
    renderRecommendations(recs);
  } catch (err) {
    recommendationsEl.textContent = err.message;
  }
});
