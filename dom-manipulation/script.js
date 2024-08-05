let quotes = [];
let categories = new Set(['All Categories']);
const API_URL = 'https://jsonplaceholder.typicode.com/posts';

// Function to fetch quotes from the server
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(API_URL);
        const serverQuotes = await response.json();
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
        notifyUser("Quote successfully posted to server.");
        return { ...quote, id: data.id };
    } catch (error) {
        console.error("Error posting quote to server:", error);
        notifyUser("Failed to post quote to server. It will be saved locally.");
        return quote;
    }
}

// Function to sync quotes
async function syncQuotes() {
    console.log("Syncing quotes with server...");
    const serverQuotes = await fetchQuotesFromServer();
    const mergedQuotes = mergeQuotes(quotes, serverQuotes);
    
    if (JSON.stringify(mergedQuotes) !== JSON.stringify(quotes)) {
        quotes = mergedQuotes;
        saveQuotes();
        populateCategories();
        filterQuotes();
        notifyUser("Quotes have been updated from the server.");
    } else {
        console.log("No new quotes from server.");
    }
}

// Function to merge local and server quotes
function mergeQuotes(localQuotes, serverQuotes) {
    const mergedQuotes = [...localQuotes];
    let updatedCount = 0;
    let newCount = 0;
    
    serverQuotes.forEach(serverQuote => {
        const existingQuoteIndex = mergedQuotes.findIndex(q => q.id === serverQuote.id);
        if (existingQuoteIndex >= 0) {
            // Update existing quote (server data takes precedence)
            mergedQuotes[existingQuoteIndex] = serverQuote;
            updatedCount++;
        } else {
            // Add new quote
            mergedQuotes.push(serverQuote);
            newCount++;
        }
    });

    if (updatedCount > 0 || newCount > 0) {
        notifyUser(`Sync complete. Updated: ${updatedCount}, New: ${newCount}`);
    }

    return mergedQuotes;
}

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
    console.log("Quotes saved to local storage.");
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
    console.log("Notification:", message);
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

// Other functions (loadQuotes, populateCategories, restoreLastSelectedCategory, filterQuotes, displayQuotes) remain the same

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
console.log("Periodic sync set up for every 5 minutes.");

// Manual sync button (for testing)
const syncButton = document.createElement('button');
syncButton.textContent = "Manual Sync";
syncButton.onclick = syncQuotes;
document.body.appendChild(syncButton);