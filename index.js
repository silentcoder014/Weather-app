const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const invalidCity = document.querySelector(".error");
let oldTab = userTab;
const API_KEY = "0d252f8137b333fd1cb33928e925b886";
oldTab.classList.add("current-tab");
getfromSessionStorage();

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click",getLocation);

function getLocation(){
  if(navigator.geolocation){
//if support available
navigator.geolocation.getCurrentPosition(showPosition);
  }
  else{
  alert('It seems like Geolocation, which is required for this page, is not enabled in your browser. Please use a browser which supports it.')
  }
}

function showPosition(position){
  const userCoordinates={
    lat:position.coords.latitude,
    lon:position.coords.longitude,
  }
  sessionStorage.setItem("user-coordinates",JSON.stringify(userCoordinates));
  fetchUserWeatherInfo(userCoordinates);
}

async function fetchUserWeatherInfo(coordinates) {
  const { lat, lon } = coordinates;

  //loader dikhana hai->pahle grant location wala page hatao fir uske
  grantAccessContainer.classList.remove("active");
  //loader visible kro
  loadingScreen.classList.add("active");

  // API call
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    const data = await response.json();
    //loader ko hata do ab
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    renderWeatherInfo(data); //ui me value dalega automatically
  } catch (err) {
    loadingScreen.classList.remove("active");
    // hw
    console.log();
  }
}


function switchTab(newTab) {
  if (newTab != oldTab) {
    oldTab.classList.remove("current-tab");
    oldTab = newTab;
    oldTab.classList.add("current-tab");
  }

  //agr form wala section active nhi hai hai
  if (!searchForm.classList.contains("active")) {
    //kya search form wala contaienr is invisible, if yes then make it visible
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    searchForm.classList.add("active");
  } else {
    //mai pahle search wale tab par tha,ab your weather tab vixible karna hai
    searchForm.classList.remove("active");
    userInfoContainer.classList.remove("active");
    //ab main your weather tav me aagaya hu, toh weather bhi display karna padega,
    //so  let's check local storage first for coordinates, if we have saved them there.
    getfromSessionStorage();
  }
}

userTab.addEventListener("click", () => {
  //pass clicked tab as input parameter
  switchTab(userTab);
});

searchTab.addEventListener("click", () => {
  //pass clicked tab as input parameter
  switchTab(searchTab);
});

//check if coordinates are already present in session storage
function getfromSessionStorage() {
  const localCoordinates = sessionStorage.getItem("user-coordinates");
  if (!localCoordinates) {
    //agar local coordinates nahi mile..yani save nhi hai ..location ka access nhi diya
    //yani grant location wali window ko show karwao
    grantAccessContainer.classList.add("active");
  }

  //agar local coordinates pade hai toh unko use kro
  else {
    const coordinates = JSON.parse(localCoordinates);
    fetchUserWeatherInfo(coordinates);
  }
}




function renderWeatherInfo(weatherInfo) {
  //firstly we have to fetch the elements
  const cityName = document.querySelector("[data-cityName]");
  const countryIcon = document.querySelector("[data-countryIcon]");
  const desc = document.querySelector("[data-weatherDesc]");

  const weatherIcon = document.querySelector("[data-weatherIcon]");
  const temp = document.querySelector("[data-temp]");
  const windspeed = document.querySelector("[data-windspeed]");
  const humidity = document.querySelector("[data-humidity]");
  const cloudiness = document.querySelector("[data-cloudiness]");

  //fetch values from weatherInfo object and put it in UI elements
  cityName.innerText = weatherInfo?.name;
  countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
  desc.innerText = weatherInfo?.weather?.[0]?.description;
  weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
  temp.innerText = `${weatherInfo?.main?.temp}°C`;
  windspeed.innerText = `${weatherInfo?.wind?.speed}m/s`;
  humidity.innerText = `${weatherInfo?.main?.humidity}%`;
  cloudiness.innerText = `${weatherInfo?.clouds?.all}%`; 
}


let searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit",(e) =>{
  e.preventDefault();
  if(searchInput.value === "")return;

  fetchSearchWeatherInfo(searchInput.value);
});

async function fetchSearchWeatherInfo(city){
  loadingScreen.classList.add("active");
  userInfoContainer.classList.remove("active");
  grantAccessButton.classList.remove("active");


  try{
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
    if(response.status==404){
      userInfoContainer.classList.remove("active");
      loadingScreen.classList.remove("active");
      invalidCity.classList.add("active");
      return;
    }else{
    const data = await response.json();
    invalidCity.classList.remove("active");
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    renderWeatherInfo(data);
    }
    
  }
  catch(err){
  //hw
  

  }
}