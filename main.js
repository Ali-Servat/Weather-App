// DOM elements
const hourlyDiv = document.getElementById('hourly-div');
const dailyDiv = document.getElementById('daily-div');
const refreshBtn = document.getElementById('refresh-button');
const loadingContainer = document.getElementById('loading-container');
const searchContainer = document.getElementById('search-container');
const searchBtn = document.getElementById('search-button');
const form = document.querySelector('form');
const returnBtn = document.getElementById('return-button');
const cityInput = document.getElementById('city-input');

let city = 'tabriz';
let isLoading = true;

// API key
const API_KEY = 'e7ed094d029d6efb7440323fdbe93c8f';

window.addEventListener('load', fetchData(city));

// refresh button event listener
refreshBtn.addEventListener('click', () => {
     isLoading = true;
     checkLoading(isLoading);
     updateUI(city);
});

// search button in the main page event listener
searchBtn.addEventListener('click', () => {
     cityInput.value = '';
     searchContainer.style.visibility = 'visible';
     cityInput.focus();
});

// return and submit event listeners for city input page
returnBtn.addEventListener('click', () => {
     searchContainer.style.visibility = 'hidden';
});
form.addEventListener('submit', (e) => {
     e.preventDefault();
     let inputVal = cityInput.value;
     city = inputVal;
     updateUI(city);
     searchContainer.style.visibility = 'hidden';
});

// function to get weather data of the selected city
function fetchData(cityName) {
     // url for requesting the geolocation of the city
     const API_GEOLOCATION_URL =
          'http://api.openweathermap.org/geo/1.0/direct?q=' +
          cityName +
          '&lang=fa' +
          '&appid=' +
          API_KEY;

     // request to get longitude and latitude of the city
     fetch(API_GEOLOCATION_URL)
          .then((response) => response.json())
          .then((response) => {
               console.log(response);
               const lat = response[0].lat;
               const lon = response[0].lon;
               const localNameFa = response[0].local_names.fa;
               const localNameEn = response[0].local_names.en;
               return { lat, lon, localNameFa, localNameEn };
          })
          .then(({ lat, lon, localNameFa, localNameEn }) => {
               // url for requesting weather information based on lat and lon
               const API_REQUEST_URL =
                    'https://api.openweathermap.org/data/2.5/onecall?lat=' +
                    lat +
                    '&lon=' +
                    lon +
                    '&exclude=minutely&units=metric&lang=fa&appid=' +
                    API_KEY;

               // request to get the weather information of the city based on its lat and lon
               fetch(API_REQUEST_URL)
                    .then((response) => response.json())
                    .then((response) => {
                         console.log(response);
                         // function for updating UI
                         handleResponse(response, localNameFa, localNameEn);
                         isLoading = false;
                         checkLoading(isLoading);
                    });
          });
}

function handleResponse(response, localNameFa, localNameEn) {
     // DOM elements
     const cityName = document.getElementById('location');
     const currentTemp = document.getElementById('current-temp');
     const currentState = document.getElementById('current-state');
     const date = document.getElementById('date');
     const lowerstTemp = document.getElementById('lowest-temp');
     const highestTemp = document.getElementById('highest-temp');
     const currentHumidity = document.getElementById('current-humidity');
     const currentUVIndex = document.getElementById('current-UVIndex');

     // set city name
     cityName.textContent = localNameFa ? localNameFa : localNameEn;
     // set temprature
     currentTemp.textContent = Math.round(response.current.temp);
     // set weather state
     currentState.textContent = response.current.weather[0].description;
     // set date
     date.textContent = calculateDate(response.current.dt);
     // set lowest and highest temp
     lowerstTemp.textContent = Math.round(response.daily[0].temp.min);
     highestTemp.textContent = Math.round(response.daily[0].temp.max);
     // hourly info boxes
     multiplyInfoBoxes(response, 'hourly');
     // daily info boxes
     multiplyInfoBoxes(response, 'daily');
     // set humidity
     currentHumidity.textContent = response.current.humidity + '%';
     // set UV Index
     currentUVIndex.textContent = response.current.uvi;
}

// function for multiplying infoboxes
function multiplyInfoBoxes(response, mode) {
     if (mode === 'hourly') {
          const hours = [0, 3, 7, 11, 15, 19];
          const hoursTitle = calculateHourly();

          let counter = 0;
          hours.forEach((hour) => {
               createInfoBox(
                    hourlyDiv,
                    hoursTitle[counter],
                    response.hourly[hour].pop,
                    response.hourly[hour].weather[0].icon
               );
               counter++;
          });
     } else {
          const days = [0, 1, 2, 3, 4, 5];
          const daysTitle = calculateDaily(response);

          let counter = 0;
          days.forEach((day) => {
               createInfoBox(
                    dailyDiv,
                    daysTitle[counter],
                    response.daily[day].pop,
                    response.daily[day].weather[0].icon
               );
               counter++;
          });
     }
}

// function for creating info box
function createInfoBox(parent, title, probablity, iconURL) {
     const container = document.createElement('div');
     container.setAttribute('class', 'info-box');
     const boxTitle = document.createElement('h6');
     boxTitle.textContent = title;
     const icon = document.createElement('img');
     icon.setAttribute(
          'src',
          ' http://openweathermap.org/img/wn/' + iconURL + '.png'
     );
     const precipitation = document.createElement('p');
     precipitation.textContent = (probablity * 100).toFixed(0) + '%';
     parent.appendChild(container);
     container.appendChild(boxTitle);
     container.appendChild(icon);
     container.appendChild(precipitation);
}

// function for calculating which hours are shown
function calculateHourly() {
     let currentHour = new Date();
     currentHour = currentHour.getHours();
     const hoursTitle = [];
     for (let i = 0; i < 6; i++) {
          let hoursMember = currentHour + 4 * i;
          hoursMember = hoursMember % 24;
          hoursTitle.push(hoursMember);
     }
     return hoursTitle;
}

// function for calculating which days are shown
function calculateDaily(response) {
     const daysTitle = [];
     for (let i = 0; i < 6; i++) {
          let currentDay = new Date(response.daily[i].dt * 1000);
          currentDay = currentDay.getDay();
          const dayName = calculateDayOfWeek(currentDay);
          daysTitle.push(dayName);
     }
     return daysTitle;
}

//  function for getting date
function calculateDate() {
     let date = new Date();
     date = date.toLocaleString();
     return date;
}

// function for calculating day of the week

function calculateDayOfWeek(dayNumber) {
     let dayName;
     switch (dayNumber) {
          case 1:
               dayName = 'دوشنبه';
               break;
          case 2:
               dayName = 'سه شنبه';
               break;
          case 3:
               dayName = 'چهارشنبه';
               break;
          case 4:
               dayName = 'پنج شنبه';
               break;
          case 5:
               dayName = 'جمعه';
               break;
          case 6:
               dayName = 'شنبه';
               break;
          case 0:
               dayName = 'یکشنبه';
               break;
     }
     return dayName;
}

// function for loading page

function checkLoading(isLoading) {
     if (isLoading) {
          loadingContainer.style.visibility = 'visible';
     } else {
          loadingContainer.style.visibility = 'hidden';
     }
}

// function for updating UI
function updateUI() {
     hourlyDiv.innerHTML = '';
     dailyDiv.innerHTML = '';
     fetchData(city);
}
