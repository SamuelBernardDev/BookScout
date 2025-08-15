async function fetchGoodreadsHistory() {
  const apiKey = 'YOUR_GOODREADS_API_KEY';
  const userId = 'YOUR_GOODREADS_USER_ID';
  const url = `https://www.goodreads.com/review/list/${userId}.xml?key=${apiKey}&v=2`;
  const res = await fetch(url);
  const text = await res.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, 'application/xml');
  const titles = [...xml.querySelectorAll('review book title')].map(n => n.textContent);
  return titles.join(', ');
}

async function fetchRecommendations(description, history) {
  const apiKey = 'YOUR_OPENAI_API_KEY';
  const prompt = `Using the description: "${description}" and these read books: ${history || 'none'}, recommend 3 books. Respond in JSON array with fields title, review, amazon, goodreads.`;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    })
  });
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  return JSON.parse(content);
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
  const recommendationsEl = document.getElementById('recommendations');
  recommendationsEl.textContent = 'Loading...';
  try {
    const history = useHistory ? await fetchGoodreadsHistory() : '';
    const recs = await fetchRecommendations(desc, history);
    renderRecommendations(recs);
  } catch (err) {
    recommendationsEl.textContent = err.message;
  }
});
