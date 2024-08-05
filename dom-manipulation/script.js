let quotes = [];
let categories = new Set(['All Categories']);
const API_URL = 'https://jsonplaceholder.typicode.com/posts';

// Function to fetch quotes from the server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(API_URL);
        const serverQuotes = await response.json();
        
        // Simulate converting server data to our format
        return serverQuotes.slice(0, 5).map(post => ({
            id: post.id,
            text: post.title,
            category: post.body.split(' ')[0]
        }));
    } catch (error) {
        console.error("Error fetching quotes from server:", error);
        notifyUser("Failed to fetch quotes from server.");
        return [];
    }
}

// Function to post data to the server
async function postQuoteToServer(quote) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                title: quote.text,
                body: quote.category,
                userId: 1,
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });
        const data = await response.json();
        return { ...quote, id: data.id };
    } catch (error) {
        console.error("Error posting quote to server:", error);
        notifyUser("Failed to post quote to server. It will be saved locally.");
        return quote;
    }
}

// Function to sync quotes
async function syncQuotes() {
    const serverQuotes = await fetchQuotesFromServer();
    const mergedQuotes = mergeQuotes(quotes, serverQuotes);
    
    if (JSON.stringify(mergedQuotes) !== JSON.stringify(quotes)) {
        quotes = mergedQuotes;
        saveQuotes();
        populateCategories();
        filterQuotes();
        notifyUser("Quotes have been updated from the server.");
    }
}

// Function to merge local and server quotes
function mergeQuotes(localQuotes, serverQuotes) {
    const mergedQuotes = [...localQuotes];
    
    serverQuotes.forEach(serverQuote => {
        const existingQuoteIndex = mergedQuotes.findIndex(q => q.id === serverQuote.id);
        if (existingQuoteIndex >= 0) {
            // Update existing quote (server data takes precedence)
            mergedQuotes[existingQuoteIndex] = serverQuote;
            notifyUser(`Quote updated: "${serverQuote.text}"`);
        } else {
            // Add new quote
            mergedQuotes.push(serverQuote);
            notifyUser(`New quote added: "${serverQuote.text}"`);
        }
    });

    return mergedQuotes;
}

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
    await syncQuotes();
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

// Function to add a new quote
async function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value;
    const newQuoteCategory = document.getElementById('newQuoteCategory').value;
    
    if (newQuoteText && newQuoteCategory) {
        const newQuote = { text: newQuoteText, category: newQuoteCategory };
        const postedQuote = await postQuoteToServer(newQuote);
        quotes.push(postedQuote);
        saveQuotes();
        populateCategories();
        notifyUser("Quote added successfully!");
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        filterQuotes();
    } else {
        notifyUser("Please enter both quote text and category.");
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
document.getElementById('newQuote').addEventListener('click', () => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    displayQuotes([randomQuote]);
});
document.getElementById('categoryFilter').addEventListener('change', () => filterQuotes());
document.getElementById('addQuoteBtn').addEventListener('click', addQuote);

// Initial setup
loadQuotes();

// Periodic sync (every 5 minutes)
setInterval(syncQuotes, 300000);