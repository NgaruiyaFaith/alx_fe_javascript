let quotes = [];
let categories = new Set(['All Categories']);
const API_URL = 'https://jsonplaceholder.typicode.com/posts';

// Load quotes from local storage on initialization
async function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    } else {
        quotes = [
            { id: 1, text: "Be the change you wish to see in the world.", category: "Inspirational" },
            { id: 2, text: "Stay hungry, stay foolish.", category: "Motivational" },
            { id: 3, text: "The only way to do great work is to love what you do.", category: "Career" }
        ];
        saveQuotes();
    }
    populateCategories();
    restoreLastSelectedCategory();
    await syncWithServer();
}

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to populate categories
function populateCategories() {
    categories = new Set(['All Categories', ...quotes.map(quote => quote.category)]);
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
}

// Function to restore the last selected category
function restoreLastSelectedCategory() {
    const lastCategory = localStorage.getItem('lastCategory') || 'All Categories';
    document.getElementById('categoryFilter').value = lastCategory;
    filterQuotes(lastCategory);
}

// Function to filter and display quotes based on selected category
function filterQuotes(category = null) {
    const selectedCategory = category || document.getElementById('categoryFilter').value;
    localStorage.setItem('lastCategory', selectedCategory);
    
    const filteredQuotes = selectedCategory === 'All Categories' 
        ? quotes 
        : quotes.filter(quote => quote.category === selectedCategory);
    
    displayQuotes(filteredQuotes);
}

// Function to display quotes
function displayQuotes(quoteList) {
    const quoteDisplay = document.getElementById('quoteDisplay');
    if (quoteList.length === 0) {
        quoteDisplay.textContent = "No quotes available for this category.";
        return;
    }
    quoteDisplay.innerHTML = quoteList.map(quote => 
        `<div><p>"${quote.text}"</p><p>Category: ${quote.category}</p></div>`
    ).join('');
}

// Function to display a random quote
function showRandomQuote() {
    if (quotes.length === 0) {
        document.getElementById('quoteDisplay').textContent = "No quotes available. Add some quotes!";
        return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    displayQuotes([quote]);
    sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// Function to create and display the form for adding new quotes
function createAddQuoteForm() {
    const form = document.createElement('div');
    form.innerHTML = `
        <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
        <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
        <button onclick="addQuote()">Add Quote</button>
    `;
    document.body.appendChild(form);
}

// Function to add a new quote
async function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value;
    const newQuoteCategory = document.getElementById('newQuoteCategory').value;
    
    if (newQuoteText && newQuoteCategory) {
        const newQuote = { text: newQuoteText, category: newQuoteCategory };
        await syncQuoteWithServer(newQuote);
        saveQuotes();
        populateCategories();
        alert("Quote added successfully!");
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        filterQuotes();
    } else {
        alert("Please enter both quote text and category.");
    }
}

// Function to sync with server
async function syncWithServer() {
    try {
        const response = await fetch(API_URL);
        const serverQuotes = await response.json();
        
        // Simulate converting server data to our format
        const convertedServerQuotes = serverQuotes.slice(0, 5).map(post => ({
            id: post.id,
            text: post.title,
            category: post.body.split(' ')[0]
        }));

        // Merge server quotes with local quotes
        const mergedQuotes = mergeQuotes(quotes, convertedServerQuotes);
        
        if (JSON.stringify(mergedQuotes) !== JSON.stringify(quotes)) {
            quotes = mergedQuotes;
            saveQuotes();
            populateCategories();
            filterQuotes();
            notifyUser("Quotes have been updated from the server.");
        }
    } catch (error) {
        console.error("Error syncing with server:", error);
        notifyUser("Failed to sync with server. Please try again later.");
    }
}

// Function to merge local and server quotes
function mergeQuotes(localQuotes, serverQuotes) {
    const mergedQuotes = [...localQuotes];
    
    serverQuotes.forEach(serverQuote => {
        const existingQuoteIndex = mergedQuotes.findIndex(q => q.id === serverQuote.id);
        if (existingQuoteIndex >= 0) {
            // Update existing quote
            mergedQuotes[existingQuoteIndex] = serverQuote;
        } else {
            // Add new quote
            mergedQuotes.push(serverQuote);
        }
    });

    return mergedQuotes;
}

// Function to sync a new quote with the server
async function syncQuoteWithServer(newQuote) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                title: newQuote.text,
                body: newQuote.category,
                userId: 1,
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });
        const data = await response.json();
        newQuote.id = data.id;
        quotes.push(newQuote);
    } catch (error) {
        console.error("Error syncing new quote with server:", error);
        notifyUser("Failed to sync new quote with server. It will be saved locally.");
        quotes.push(newQuote);
    }
}

// Function to notify user
function notifyUser(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '10px';
    notification.style.right = '10px';
    notification.style.backgroundColor = '#f0f0f0';
    notification.style.padding = '10px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '1000';
    document.body.appendChild(notification);
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 5000);
}

// Event listeners
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('categoryFilter').addEventListener('change', () => filterQuotes());

// Initial setup
loadQuotes();
createAddQuoteForm();

// Periodic sync (every 5 minutes)
setInterval(syncWithServer, 300000);