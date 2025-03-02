const inputField = document.getElementById("artistInput");
const searchLoader = document.getElementById("searchLoader");
const detailLoader = document.getElementById("detailLoader");
const resultDisplay = document.getElementById("resultDisplay");
const artistCardsContainer = document.getElementById("artistCards");
const artistInfo = document.getElementById("artistInfo");

let hasCardBeenClicked = false;

function clearInput() {
  inputField.value = "";
  clearAllDetails();
  // If want to reset results:
  // artistCardsContainer.innerHTML = "";
  // artistInfo.innerHTML = "";
  // resultDisplay.classList.add("results-hidden");
}

inputField.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      event.preventDefault(); 
      initiateSearch(); 
    }
});

inputField.addEventListener("input",function(){
    artistInfo.classList.add("details-hidden");
    artistInfo.innerHTML = "";
});

function clearAllDetails() {
    const allCards = document.querySelectorAll(".artist-card");
    allCards.forEach((c) => {
        c.style.backgroundColor = c.dataset.originalColor;
    });
    artistInfo.innerHTML = "";
    artistInfo.classList.add("details-hidden");
}

function initiateSearch() {
    const query = inputField.value.trim();
    if (!query) {
        inputField.reportValidity();
        return;
    }

    hasCardBeenClicked = false;

    // artistCardsContainer.innerHTML = "";
    artistInfo.innerHTML = "";
    artistInfo.classList.add("details-hidden");
    resultDisplay.classList.add("results-hidden");

    searchLoader.classList.remove("loader-hidden");

    fetch(`/search?term=${encodeURIComponent(query)}`)
    .then((response) => response.json())
    .then((data) => {
        searchLoader.classList.add("loader-hidden");

        if (data.data?.length > 0) {
            renderArtists(data.data);
            resultDisplay.classList.remove("results-hidden");
        } else {
            artistCardsContainer.innerHTML = `
                <div class="no-results-box">
                No results found.
                </div>`;
            resultDisplay.classList.remove("results-hidden");
        }
    })
    .catch((err) => {
        console.error("Error during search:", err);
        searchLoader.classList.add("loader-hidden");
        //artistCardsContainer.innerHTML = `<p>Error fetching search results.</p>`;
        //resultDisplay.classList.remove("results-hidden");
    });
}

function renderArtists(artists) {
    artistCardsContainer.innerHTML = "";
    artists.forEach((artist) => {
        const cardDiv = document.createElement("div");
        cardDiv.className = "artist-card";

        const img = document.createElement("img");
        img.className = "artist-image";
        img.src = artist.image ? artist.image : "/static/images/artsy_logo.svg";
        img.alt = artist.name || "No name";

        const namePara = document.createElement("p");
        namePara.className = "artist-name";
        namePara.textContent = artist.name || "Unknown Artist";

        cardDiv.appendChild(img);
        cardDiv.appendChild(namePara);
        cardDiv.dataset.originalColor = getComputedStyle(cardDiv).backgroundColor;

        cardDiv.addEventListener("click", () => {
        fetchArtistDetails(artist.id);
        highlightActiveCard(cardDiv);
        });

        artistCardsContainer.appendChild(cardDiv);
    });
}

function highlightActiveCard(currentCard) {
    hasCardBeenClicked = true;
    artistInfo.classList.remove("details-hidden");
    const allCards = document.querySelectorAll(".artist-card");
    allCards.forEach((c) => {
        c.style.backgroundColor = c.dataset.originalColor;
    });
    currentCard.style.backgroundColor = "var(--hover-blue)";
    //currentCard.classList.add("active");
}

function fetchArtistDetails(artistId) {
    detailLoader.classList.remove("loader-hidden");
    artistInfo.innerHTML = "";

    fetch(`/artist/${encodeURIComponent(artistId)}`)
        .then((response) => response.json())
        .then((data) => {
        detailLoader.classList.add("loader-hidden");
        displayArtistDetails(data);
        })
        .catch((err) => {
        console.error("Error fetching artist details:", err);
        detailLoader.classList.add("loader-hidden");
        artistInfo.innerHTML = `<p>Error fetching artist details.</p>`;
        });
}

function displayArtistDetails(data) {
    artistInfo.innerHTML = "";

    const headerContainer = document.createElement("div");
    headerContainer.className = "artist-header";

    const nameWithDates = document.createElement("div");
    nameWithDates.className = "name-dates";

    const nameHeading = document.createElement("h2");
    nameHeading.textContent = data.name || "Untitled";
    // artistInfo.appendChild(nameHeading);

    let dateText;
    if (data.birthday || data.deathday){
        const birth = data.birthday ? data.birthday : "-";
        const death = data.deathday ? ` - ${data.deathday}` : " - ";
        dateText = `(${birth}${death})`;
    } else{
        dateText = "( - )"
    }
    const dataSpan = document.createElement("span");
    dataSpan.className = "artist-dates";
    dataSpan.textContent = dateText;

    nameHeading.appendChild(dataSpan);
    nameWithDates.appendChild(nameHeading);

    if (data.nationality) {
        const natPara = document.createElement("p");
        natPara.className = "artist-nationality";
        natPara.textContent = data.nationality;
        nameWithDates.appendChild(natPara);
    }

    headerContainer.appendChild(nameWithDates);
    artistInfo.appendChild(headerContainer);

    const detailsContainer = document.createElement("div");
    detailsContainer.className = "artist-details";

    if(data.biography){
        const bioPara = document.createElement("p");
        bioPara.className = "artist-bio";
        bioPara.textContent = data.biography || "";
        artistInfo.appendChild(bioPara);
    }

    artistInfo.appendChild(detailsContainer);
    artistInfo.classList.remove("details-hidden");
}
