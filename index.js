const FOURSQUARE_SEARCH_URL = "https://api.foursquare.com/v2/venues/explore?&client_id=FPRD2S2RFIB4QLBNBBHNAMLYOUF2AZSZ21ZK53QYASWCRJ1Z&client_secret=FEFA44EG0YDZ0XKA1UWX5ZWLZJLE30E2GYRLGB44PKE5KZ0E&v=20170915";


let state = {
    radius: 500, //default value
    currentLocation: {},
    category: "TOPPICKS"
    
};

const findCurrentLocation = () => {
    if (navigator.geolocation) {
        // Call getCurrentPosition with success and failure callbacks
        navigator.geolocation.getCurrentPosition((position) => {
            state.currentLocation.lng = position.coords.longitude;
            state.currentLocation.lat = position.coords.latitude;
            $('.navigation').removeClass("hide");
            $('#radius').removeClass("hide");
            render();
        });
    }
}


const render = () => {
    $("#radius").change(function(e){
        changeRadius(e);               
    });
    $('.category-button').click(function () {
        let city = $('.search-query').val();
        state.category = $(this).text();
        fetchvenues(state.currentLocation.lat, state.currentLocation.lng, state.radius, state.category);
    });
    fetchvenues(state.currentLocation.lat, state.currentLocation.lng, state.radius);
};

//retrieve data from FourSquare API
const getFourSquareData = (lat, lng, radius) => {
    fetchvenues(state.currentLocation.lat, state.currentLocation.lng, state.radius);
};


const fetchvenues = (lat, lng, radius, category) => {
    
     var section = "TOPPICKS";
     if( category){
         section = category;
     }
     $.ajax(FOURSQUARE_SEARCH_URL, {
            data: {
                ll: `${lat},${lng}`,
                radius,
                // near: city,
                venuePhotos: 1,
                limit: 20,
                query: 'recommended',
                section: section
            },
            dataType: 'json',
            type: 'GET',
            success: function (data) {
                try {
                    if(data.response.groups[0].items.length === 0) {
                        $('#foursquare-results').html("<div class='result'><p>Sorry! No Results Found.</p></div>");
                        return;
                    } 
                    let results = data.response.groups[0].items.map(function (item, index) {
                        return displayResults(item);
                    });
                    $('#foursquare-results').html(results);
                    //scrollPageTo('#foursquare-results', 15);
                } catch (e) {
                    $('#foursquare-results').html("<div class='result'><p> Error occurred while retreiving data! </p></div>");
                }
            },
            error: function (e) {
                $('#foursquare-results').html(`<div class='result'><p>${e.responseJSON.meta.errorDetail}</p></div>`);
            }
        });
}

/**
<div class="result-image" style="background-image: url(https://igx.4sqi.net/img/general/width960${result.venue.photos.groups[0].items[0].suffix})" ;>
            </div>
**/

//TODO: validate the result object

const displayResults = (result) => {
    return `
    <div class="result col-3">
        
        <div class="result-description">
            <h2 class="result-name">${result.venue.name}</h2>
            <span class="icon">
                <img src="${result.venue.categories[0].icon.prefix}bg_32${result.venue.categories[0].icon.suffix}" alt="category-icon">
            </span>
            <span class="icon-text">
                ${result.venue.categories[0].name}
            </span>
            <p class="result-address">${result.venue.location.formattedAddress[0]}</p>
            <p class="result-address">${result.venue.location.formattedAddress[1]}</p>
            <p class="result-address">${result.venue.location.formattedAddress[2]}</p>
        </div>
    </div>
`;
};


const changeRadius = (event) => {
    console.log("event triggered");
    state.radius = parseInt(event.target.value);
    fetchvenues(state.currentLocation.lat, state.currentLocation.lng, state.radius);
}

window.addEventListener('load', function () {
    findCurrentLocation();
});