// console.log('I\'m working')
//Testing data
import { dummyDataArr } from "./dummyData.js";

const mainEl = document.getElementById('main');
const searchResultsSection = document.getElementById('search-results-section');
const formEl = document.getElementById('search-form');

document.addEventListener('click', async (e) => {
    //console.log('hi')
    if (e.target.value === 'submit'){
        e.preventDefault();
        handleSearch();
    }   

})

// Clumsy workaround as the omdbapi searh does not have all the data required for 
// rendering the results required

async function handleSearch () {
    const forms = new FormData(formEl)
    const searchQuery = forms.get('search-query')
    const numOfResults = Number(forms.get('num-of-results')) ?  Number(forms.get('num-of-results')) : 1;

    const response = await fetch(`http://www.omdbapi.com/?s=${searchQuery}&plot=full&apikey=3bcc61`, {
        method: "GET",
    })
     const data = await response.json();
    let movieArr =  []
     for (let i = 0; i < numOfResults; i++){
        if (i === 10){
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
    );
    console.log(searchResults);
    return searchResults;
     
    //  console.log(movieArr)

}
