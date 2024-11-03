const mainEl = document.getElementById('main');
const searchResultsSection = document.getElementById('search-results-section');
const formEl = document.getElementById('search-form');
// Determine path for add/remove button text
const path = window.location.pathname
// Local storage savedMovieArr
let savedMovieArr = JSON.parse(window.localStorage.getItem('movies')) || [];


if (path.includes('Watchlist.html')){
    renderWatchlist(); 
 }



document.addEventListener('click', async (e) => {
    if (e.target.value === 'submit'){
        e.preventDefault();
        mainEl.classList.remove('toggle-background')
        handleSearch();
    } else if (!path.includes('Watchlist.html')){
        if (e.target.dataset && e.target.dataset.imdbid) {
            if(!savedMovieArr.includes(e.target.dataset.imdbid))
            savedMovieArr.push(e.target.dataset.imdbid);
            saveArrayToLocalStorage("movies", savedMovieArr);
        }
    } else if (path.includes('Watchlist.html')) {
        if (e.target.dataset && e.target.dataset.imdbid) {
            savedMovieArr = savedMovieArr.filter(imdbid => imdbid != e.target.dataset.imdbid);
            saveArrayToLocalStorage("movies", savedMovieArr)
            renderWatchlist()
        }
    }

})

// Clumsy workaround as the omdbapi searh does not have all the data required for 
// rendering the results required
async function handleSearch () {
    const forms = new FormData(formEl)
    const searchQuery = forms.get('search-query')
    const numOfResults = Number(forms.get('num-of-results')) ?  Number(forms.get('num-of-results')) : 1;
    try{
    const response = await fetch(`http://www.omdbapi.com/?s=${searchQuery}&apikey=3bcc61`, {
        method: "GET",
    })
     const data = await response.json();

    let movieArr =  []
     for (let i = 0; i < numOfResults; i++){
        if (i === 10 || i === data.Search.length){
            break;
        }
        movieArr.push(data.Search[i].Title)
     }
     const searchResults = await Promise.all(
        movieArr.map(async (movieTitle) => {
            const response = await fetch(`http://www.omdbapi.com/?t=${movieTitle}&apikey=3bcc61`);
            const data = await response.json();
            return data;
        })
  
    )
    console.log(searchResults);
    renderSearch(searchResults);
} catch(error){
        mainEl.innerHTML = `<div>
        <p>Oops something went wrong...</p>
        </div>`
    };

}

//Dealing with local Storage
function getArrayFromLocalStorage(arrayName){
 return JSON.parse(window.localStorage.getItem(arrayName));
}

function saveArrayToLocalStorage(arrayName, array) {
    window.localStorage.setItem(arrayName, JSON.stringify(array));
  }

//render user search
function renderSearch(movieArr) {
    let buttonText = ''
    if (!path.endsWith('Watchlist.html')){
        buttonText = '<img src="../styles/images/add-icon.png" /> Watchlist';
    } else {
        buttonText = '<img src="../styles/images/remove-icon.png" /> Remove';
    }

    let renderString = ''
    renderString += movieArr.map(movie => {
        return `
            <div class="image-container">
            <img src="${movie.Poster}" alt="${movie.Title} poster" />
            </div>
            <div class="movie-container">

                <div class="movie-top-container">
                    <h2>${movie.Title}</h2>
                    <p>⭐${movie.imdbRating}</p>
                </div>
                    
                <div class="movie-middle-container">
                    <p>${movie.Runtime}</p>
                    <p>${movie.Genre}</p>
                    <button class="add-btn" data-imdbid="${movie.imdbID}">${buttonText}</button>
                </div>

                <div class="movie-bottom-container">
                    <p>${movie.Plot}</p>
                </div>
                
            </div>
        `
    }).join('')
    searchResultsSection.innerHTML = renderString
}

//Render user watchlist
async function renderWatchlist() {
    mainEl.classList.remove('toggle-background')
    let savedMovieArr = getArrayFromLocalStorage('movies') || [];
    if (savedMovieArr.length === 0) {
        mainEl.innerHTML = `<div><p>Your watchlist is looking a little empty...</p>
        <a href='./index.html'><img src="../styles/images/add-icon.png" /> Let's add some movies!</a></div>`;
    } else {
        const movieDataArr = await Promise.all(
            savedMovieArr.map(async (imdbID) => {
                const response = await fetch(`http://www.omdbapi.com/?i=${imdbID}&apikey=3bcc61`);
                const data = await response.json();
                return data;
            })
        );
        renderSearch(movieDataArr);
    }
}

