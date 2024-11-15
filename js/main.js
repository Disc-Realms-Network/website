document.addEventListener("DOMContentLoaded", () => {
    loadComponent('navbar', 'elements/navbar.html');
    loadComponent('footer', 'elements/footer.html');
    loadComponent('updates', 'elements/updates.html', () => {
        loadUpdates();
    });
});

function loadComponent(id, filePath, callback) {
    fetch(filePath)
        .then(response => response.text())
        .then(data => {
            document.getElementById(id).innerHTML = data;
            if (callback) callback();
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
        updateItem.onclick = () => openUpdate(`/content/updates/${file}`);

        updateItem.innerHTML = `
            <img src="${thumbnail}" alt="Thumbnail" class="update-thumbnail">
            <div class="update-summary">
                <p>${summary}</p>
            </div>
        `;
        updatesList.appendChild(updateItem);
    }
}

async function openUpdate(filePath) {
    const content = await fetch(filePath).then(res => res.text());

    const mainContent = content
        .replace(/<thumbnail>.*?<\/thumbnail>/, "")
        .replace(/<summary>.*?<\/summary>/, "");

    if (typeof marked === "undefined") {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/marked/1.1.1/marked.min.js");
    }

    const markedContent = marked.parse(mainContent);

    document.getElementById("update-content").innerHTML = markedContent;
    const modal = document.getElementById("update-modal");
    modal.classList.add("show");
}

// Close Modal
function closeModal() {
    const modal = document.getElementById("update-modal");
    modal.classList.remove("show");
}

// Fetch Minecraft Server Status ft. ChatGPT
async function fetchServerStatus() {
    try {
        const response = await fetch('https://api.mcsrvstat.us/2/play.discrealms.net'); // Replace with your preferred Minecraft status API
        const data = await response.json();

        // Update the server status section
        document.getElementById('server-motd').innerHTML = data.motd?.clean?.join(' ') || 'Unavailable';
        document.getElementById('server-players').innerHTML = `${data.players?.online || 0} / ${data.players?.max || 'Unknown'}`;
    } catch (error) {
        console.error('Error fetching server status:', error);
        document.getElementById('server-motd').innerText = 'Error fetching MOTD.';
        document.getElementById('server-players').innerText = 'Error fetching player count.';
    }
}

// Function to reset all cookies
function resetCookies() {
    const cookies = document.cookie.split(";");

        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i];
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;

            // Set the cookie with an expired date
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
        }

    console.log("All cookies have been reset!");
}

window.onload = resetCookies;
window.onbeforeunload = resetCookies;
document.getElementById('navbar').innerHTML = `<nav>Disc Realms Network Navigation</nav>`;
document.getElementById('footer').innerHTML = `<footer>© 2024 Disc Realms Network. All rights reserved.</footer>`;

fetchServerStatus();