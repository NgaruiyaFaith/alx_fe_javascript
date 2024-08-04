// Initialize quotes array
let quotes = [
    { text: "Be the change you wish to see in the world.", category: "Inspirational" },
    { text: "Stay hungry, stay foolish.", category: "Motivational" },
    { text: "The only way to do great work is to love what you do.", category: "Career" }
];

// Function to display a random quote
function showRandomQuote() {
    const quoteDisplay = document.getElementById('quoteDisplay');
    if (quotes.length === 0) {
        quoteDisplay.textContent = "No quotes available. Add some quotes!";
        return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[randomIndex];
    quoteDisplay.innerHTML = `<p>"${quote.text}"</p><p>Category: ${quote.category}</p>`;
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
        alert("Quote added successfully!");
        document.getElementById('newQuoteText').value = '';
        document.getElementById('newQuoteCategory').value = '';
        showRandomQuote(); // Show the newly added quote
    } else {
        alert("Please enter both quote text and category.");
    }
}

// Event listener for the "Show New Quote" button
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

// Initial setup
createAddQuoteForm();
showRandomQuote();