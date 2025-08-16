const apiKey = "AIzaSyB-i4vZ1OFNygMjG-5FnG_IoavwF9TE8jI";

const selectedSimilarBooks = [];

function parseCSVTitles(text) {
  return text
    .split('\n')
    .slice(1) // Skip header row
    .map(line => line.split(',')[0].trim().replace(/"/g, '')) // Get first column (title) and remove quotes
    .filter(Boolean)
    .join(', ');
}

async function fetchRecommendations(description, csvBooks, similarBooks) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  const booksRead = [csvBooks, similarBooks].filter(Boolean).join(', ');
  
  let prompt = `I'm looking for book recommendations. Here's what I'm interested in: "${description}".`;
  if (booksRead) {
    prompt += ` For context, here are some books I've read: ${booksRead}.`;
  }
  prompt += ` Please recommend 3 books.`;
  
  const schema = {
    type: "OBJECT",
    properties: {
      recommendations: {
        type: "ARRAY",
        description: "A list of 3 book recommendations.",
        items: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING", description: "The title of the book." },
            author: { type: "STRING", description: "The author of the book." },
            review: { type: "STRING", description: "A short, engaging review of the book (around 50 words)." },
            rating: { type: "NUMBER", description: "The average rating out of 5." },
            ratingsCount: { type: "INTEGER", description: "The number of ratings." }
          },
          required: ["title", "author", "review", "rating", "ratingsCount"]
        }
      }
    },
    required: ["recommendations"]
  };

  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    }
  };
  
  try {
    const apiResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!apiResponse.ok) {
        const errorBody = await apiResponse.json();
        console.error("Gemini API Error Response:", errorBody);
        throw new Error(`Gemini API request failed with status ${apiResponse.status}`);
    }

    const responseData = await apiResponse.json();
    
    if (!responseData.candidates || responseData.candidates.length === 0) {
      console.error("Gemini API did not return candidates:", responseData);
      throw new Error("The model did not provide a response. This may be due to safety filters.");
    }
      
    const jsonText = responseData.candidates[0].content.parts[0].text;
    const data = JSON.parse(jsonText);

    return data.recommendations.map(rec => ({
      ...rec,
      amazon: `https://www.amazon.com/s?k=${encodeURIComponent(rec.title + ' ' + rec.author)}`,
      goodreads: `https://www.goodreads.com/search?q=${encodeURIComponent(rec.title)}`
    }));

  } catch (error) {
    console.error("Error fetching recommendations from Gemini API:", error);
    throw new Error("Could not get recommendations. The model may be unavailable or the request was blocked. Please try again later.");
  }
}

async function searchSimilarBooks(query) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Google Books API request failed with status ${res.status}`);
    }
    const data = await res.json();
    return (data.items || []).map(item => {
        const info = item.volumeInfo;
        return `${info.title}${info.authors ? ` by ${info.authors.join(', ')}` : ''}`;
    });
  } catch(error) {
    console.error("Error searching for books:", error);
    return [];
  }
}

function renderSimilarBookResults(titles) {
  const container = document.getElementById('similarBooksResults');
  container.innerHTML = '';
  titles.forEach(title => {
    const div = document.createElement('div');
    div.className = 'similar-book-result';
    div.textContent = title;
    
    div.addEventListener('click', () => {
      if (!selectedSimilarBooks.includes(title)) {
        selectedSimilarBooks.push(title);
      }
      document.getElementById('similarBookInput').value = '';
      renderSelectedBooks();
      container.innerHTML = ''; // Clear search results after selection
    });
    container.appendChild(div);
  });
}

function renderSelectedBooks() {
    const container = document.getElementById('selectedBooksContainer');
    container.innerHTML = ''; // Clear previous selection
    selectedSimilarBooks.forEach((title, index) => {
        const div = document.createElement('div');
        div.className = 'selected-book';
        
        const titleSpan = document.createElement('span');
        titleSpan.textContent = title;
        div.appendChild(titleSpan);

        const removeBtn = document.createElement('button');
        removeBtn.textContent = '×';
        removeBtn.type = 'button';
        removeBtn.className = 'remove-book-btn';
        removeBtn.setAttribute('aria-label', `Remove ${title}`);
        removeBtn.onclick = () => {
            selectedSimilarBooks.splice(index, 1);
            renderSelectedBooks();
        };
        div.appendChild(removeBtn);
        container.appendChild(div);
    });
}

function renderRecommendations(list) {
  const container = document.getElementById('recommendations');
  container.innerHTML = '';

  if (!list || list.length === 0) {
      container.innerHTML = `<p style="text-align: center; color: #94a3b8;">No recommendations found. Try adjusting your search.</p>`;
      return;
  }

  const grid = document.createElement('div');
  grid.className = 'recommendations-grid';

  list.forEach(b => {
    const card = document.createElement('div');
    card.className = 'book-card';
    
    let ratingHTML = '';
    if (b.rating && b.rating > 0) {
      const stars = '★'.repeat(Math.round(b.rating)) + '☆'.repeat(5 - Math.round(b.rating));
      ratingHTML = `<p class="rating-stars" title="${b.rating.toFixed(1)} / 5 from ${b.ratingsCount} reviews">${stars}</p>`;
    } else {
      ratingHTML = `<p class="no-rating">No rating available.</p>`;
    }

    card.innerHTML = `
        <div>
            <h3>${b.title}</h3>
            <p class="author">by ${b.author}</p>
            <p class="review">${b.review}</p>
        </div>
        <div class="card-footer">
            ${ratingHTML}
            <div class="links">
                <a href="${b.amazon}" target="_blank" rel="noopener noreferrer">Amazon</a>
                <a href="${b.goodreads}" target="_blank" rel="noopener noreferrer">Goodreads</a>
            </div>
        </div>
    `;
    grid.appendChild(card);
  });
  container.appendChild(grid);
}

document.getElementById('recommendForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const desc = document.getElementById('description').value;
  const file = document.getElementById('csvFile').files[0];
  const recommendationsEl = document.getElementById('recommendations');
  recommendationsEl.innerHTML = `
    <div class="loader-container">
      <div class="loader"></div>
      <p>Finding your next great read...</p>
    </div>
  `;
  try {
    const csvBooks = file ? await file.text().then(parseCSVTitles) : '';
    const similarQuery = selectedSimilarBooks.join(', ');
    const recs = await fetchRecommendations(desc, csvBooks, similarQuery);
    renderRecommendations(recs);
  } catch (err) {
    recommendationsEl.innerHTML = `<p class="error-message">${err.message}</p>`;
  }
});

let debounceTimer;
document.getElementById('similarBookInput').addEventListener('input', (e) => {
  const query = e.target.value.trim();
  clearTimeout(debounceTimer);
  const resultsContainer = document.getElementById('similarBooksResults');
  
  if (query.length < 3) {
    resultsContainer.innerHTML = '';
    return;
  }
  
  debounceTimer = setTimeout(async () => {
    const titles = await searchSimilarBooks(query);
    renderSimilarBookResults(titles);
  }, 300);
});