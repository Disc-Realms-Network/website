document.addEventListener("DOMContentLoaded", () => {
    loadComponent('navbar', 'elements/navbar.html');
    loadComponent('footer', 'elements/footer.html');
    loadComponent('updates', 'elements/updates.html', () => {
        loadUpdates(); // Run loadUpdates only after updates.html has been loaded
    });
});

// Function to load HTML components dynamically
function loadComponent(id, filePath, callback) {
    fetch(filePath)
        .then(response => response.text())
        .then(data => {
            document.getElementById(id).innerHTML = data;
            if (callback) callback(); // Run callback after component is loaded
        })
        .catch(error => console.error(`Error loading ${filePath}:`, error));
}

// Load and Display Updates
async function loadUpdates() {
    const updatesList = document.getElementById('updates-list');
    if (!updatesList) {
        console.error("Could not find updates-list element.");
        return;
    }

    const updateFiles = ["nov-14-2024-1.md"]; // Manually add update file names

    for (const file of updateFiles) {
        const content = await fetch(`/content/updates/${file}`).then(res => res.text());
        const thumbnail = content.match(/<thumbnail>(.*?)<\/thumbnail>/)?.[1] || "";
        const summary = content.match(/<summary>(.*?)<\/summary>/)?.[1] || "";

        const updateItem = document.createElement("div");
        updateItem.className = "update-item";
        updateItem.onclick = () => openUpdate(`/content/updates/${file}`); // Open modal on click

        updateItem.innerHTML = `
            <img src="${thumbnail}" alt="Thumbnail" class="update-thumbnail">
            <div class="update-summary">
                <p>${summary}</p>
            </div>
        `;
        updatesList.appendChild(updateItem);
    }
}

// Open Update in Modal
async function openUpdate(filePath) {
    const content = await fetch(filePath).then(res => res.text());

    const mainContent = content
        .replace(/<thumbnail>.*?<\/thumbnail>/, "")
        .replace(/<summary>.*?<\/summary>/, "");

    if (typeof marked === "undefined") {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/marked/1.1.1/marked.min.js");
    }

    const markedContent = marked.parse(mainContent); // Convert markdown to HTML

    document.getElementById("update-content").innerHTML = markedContent;
    const modal = document.getElementById("update-modal");
    modal.classList.add("show"); // Add 'show' class to display modal with transition
}

// Close Modal
function closeModal() {
    const modal = document.getElementById("update-modal");
    modal.classList.remove("show"); // Remove 'show' class to hide modal with transition
}