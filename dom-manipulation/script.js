let quotes = [];
let categories = new Set(['All Categories']);

// Load quotes from local storage on initialization
function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
        updateCategories();
    } else {
        // Initial quotes if local storage is empty
        quotes = [
            { text: "Be the change you wish to see in the world.", category: "Inspirational" },
            { text: "Stay hungry, stay foolish.", category: "Motivational" },
            { text: "The only way to do great work is to love what you do.", category: "Career" }
        ];
        saveQuotes();
        updateCategories();
    }
}

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Update categories set and dropdown
function updateCategories() {
    categories = new Set(['All Categories', ...quotes.map(quote => quote.category)]);
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.innerHTML = '';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Set the last selected category
    const lastCategory = localStorage.getItem('lastCategory') || 'All Categories';
    categoryFilter.value = lastCategory;
}

// Function to display quotes based on selected category
function filterQuotes() {
    const category = document.getElementById('categoryFilter').value;
    localStorage.setItem('lastCategory', category);
    
    const filteredQuotes = category === 'All Categories' 
        ? quotes 
        : quotes.filter(quote => quote.category === category);
    
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
    
    // Store last viewed quote in session storage
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
function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value;
    const newQuoteCategory = document.getElementById('newQuoteCategory').value;
    
    if (newQuoteText && newQuoteCategory) {
        quotes.push({ text: newQuoteText, category: newQuoteCategory });
        saveQuotes();
        updateCategories();
        alert("Quote added successfully!");
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        filterQuotes();
    } else {
        alert("Please enter both quote text and category.");
    }
}

// Function to export quotes to JSON file
function exportToJson() {
    const jsonStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Function to import quotes from JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            quotes.push(...importedQuotes);
            saveQuotes();
            updateCategories();
            alert('Quotes imported successfully!');
            filterQuotes();
        } catch (error) {
            alert('Error importing quotes. Please ensure the file is a valid JSON.');
        }
    };
    fileReader.readAsText(event.target.files[0]);
}

// Event listeners
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('exportJson').addEventListener('click', exportToJson);
document.getElementById('importFile').addEventListener('change', importFromJsonFile);
document.getElementById('categoryFilter').addEventListener('change', filterQuotes);

// Initial setup
loadQuotes();
createAddQuoteForm();
filterQuotes();