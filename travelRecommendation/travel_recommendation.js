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

const homeSection = document.getElementById("homeSection");

function openResults() {
    resultsBox.classList.add("visible");
    if (homeSection) homeSection.classList.add("showing-results");
}

function addHeading() {
    const heading = document.createElement("h2");
    heading.className = "results-heading";
    heading.textContent = "Search Results";
    resultsBox.appendChild(heading);
}

function showMessage(text) {
    resultsBox.innerHTML = "";
    addHeading();
    const msg = document.createElement("p");
    msg.className = "results-message";
    msg.textContent = text;
    resultsBox.appendChild(msg);
    resultsBox.style.setProperty("--count", 1);
    openResults();
}

function displayResults(places) {
    resultsBox.innerHTML = "";
    addHeading();

    // one column per result, so every image sits in the same row
    resultsBox.style.setProperty("--count", places.length);

    places.forEach((place) => {
        const card = document.createElement("article");
        card.className = "result-card";

        const img = document.createElement("img");
        img.src = place.imageUrl;
        img.alt = place.name;

        const title = document.createElement("h3");
        title.textContent = place.name;

        const desc = document.createElement("p");
        desc.textContent = place.description;

        card.append(img, title, desc);
        resultsBox.appendChild(card);
    });

    openResults();
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

// ---------- Task 9: Clear button ----------
function clearResults() {
    searchInput.value = "";
    resultsBox.innerHTML = "";
    resultsBox.classList.remove("visible");
    if (homeSection) homeSection.classList.remove("showing-results");
    searchInput.focus();
}

// Results appear only after the Search button is clicked
if (btnSearch && btnReset && searchInput && resultsBox) {
    btnSearch.addEventListener("click", handleSearch);
    btnReset.addEventListener("click", clearResults);
}