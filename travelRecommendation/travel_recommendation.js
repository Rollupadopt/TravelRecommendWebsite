// ---------- Elements (guarded: this script is loaded on every page) ----------
const searchInput = document.getElementById("searchInput");
const btnSearch = document.getElementById("btnSearch");
const btnReset = document.getElementById("btnReset");
const resultsBox = document.getElementById("results");

const API_URL = "./travel_recommendation_api.json";

// ---------- Task 6: fetch the data ----------
function fetchData() {
    return fetch(API_URL)
        .then((response) => {
            if (!response.ok) {
                throw new Error("HTTP error " + response.status);
            }
            return response.json();
        })
        .then((data) => {
            console.log(data); // check the data is accessible
            return data;
        });
}

// Log the data on page load so you can verify it in the console
if (resultsBox) {
    fetchData().catch((error) => console.error("Could not load data:", error));
}

// ---------- Task 7: keyword search ----------
function findRecommendations(data, rawKeyword) {
    const keyword = rawKeyword.trim().toLowerCase();
    const results = [];

    // beach / beaches
    if (keyword.includes("beach")) {
        results.push(...data.beaches);
    }
    // temple / temples
    else if (keyword.includes("temple")) {
        results.push(...data.temples);
    }
    // country / countries -> every city of every country
    else if (keyword === "country" || keyword === "countries") {
        data.countries.forEach((country) => results.push(...country.cities));
    }
    // a specific country name (e.g. "japan") -> that country's cities
    else {
        data.countries.forEach((country) => {
            const name = country.name.toLowerCase();
            if (name.includes(keyword)) {
                results.push(...country.cities);
            }
        });

        // bonus: also match individual city / place names (e.g. "tokyo")
        if (results.length === 0) {
            const allPlaces = [
                ...data.countries.flatMap((c) => c.cities),
                ...data.temples,
                ...data.beaches,
            ];
            allPlaces.forEach((place) => {
                if (place.name.toLowerCase().includes(keyword)) {
                    results.push(place);
                }
            });
        }
    }

    return results;
}

function showMessage(text) {
    resultsBox.innerHTML = `<p class="results-message">${text}</p>`;
    resultsBox.classList.add("visible");
}

function displayResults(places) {
    resultsBox.innerHTML = "";

    places.forEach((place) => {
        const card = document.createElement("article");
        card.className = "result-card";

        const img = document.createElement("img");
        img.src = place.imageUrl;
        img.alt = place.name;

        const body = document.createElement("div");
        body.className = "result-body";

        const title = document.createElement("h3");
        title.textContent = place.name;

        const desc = document.createElement("p");
        desc.textContent = place.description;

        const visit = document.createElement("button");
        visit.type = "button";
        visit.textContent = "Visit";

        body.append(title, desc, visit);
        card.append(img, body);
        resultsBox.appendChild(card);
    });

    resultsBox.classList.add("visible");
}

function handleSearch() {
    const keyword = searchInput.value;

    if (keyword.trim() === "") {
        showMessage("Please enter a keyword such as beach, temple or country.");
        return;
    }

    fetchData()
        .then((data) => {
            const places = findRecommendations(data, keyword);
            if (places.length === 0) {
                showMessage("No results found. Try beach, temple, country or a country name.");
            } else {
                displayResults(places);
            }
        })
        .catch((error) => {
            console.error("Could not load data:", error);
            showMessage("Sorry, the recommendations could not be loaded.");
        });
}

// ---------- Reset ----------
function clearResults() {
    searchInput.value = "";
    resultsBox.innerHTML = "";
    resultsBox.classList.remove("visible");
}

// Results appear only after the Search button is clicked
if (btnSearch && btnReset && searchInput && resultsBox) {
    btnSearch.addEventListener("click", handleSearch);
    btnReset.addEventListener("click", clearResults);
}