"use strict";

//Elements
const form = document.querySelector(".form");
const input = document.querySelector(".form__input");
const btn1 = document.querySelector(".btn1");
const btn2 = document.querySelector(".btn2");
const tile = document.querySelector(".country");
const list = document.querySelector(".list_country");

class App {
  #map;
  #countries;
  #country;
  #currentMarker;
  #zoomLevel = 4;
  #countrySize = 3287590;
  #latDefault = 19;
  #lngDefault = 79;
  #access = true;

  //Event Listeners
  constructor() {
    this._getPosition();

    form.addEventListener("submit", this._newCountry.bind(this));

    btn1.addEventListener("click", this._newCountry.bind(this));

    btn2.addEventListener("click", this._goDefaultMap.bind(this));

    list.addEventListener("click", this._clickCountry.bind(this));
  }

  //Loading the Location
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () => {
        alert("Cannot load your location ;(");
        this.#access = false;
        this._loadMap();
      });
  }

  //Loading the Map
  _loadMap(position) {
    let latitude, longitude;

    if (this.#access) {
      this.#latDefault = position.coords.latitude;
      this.#lngDefault = position.coords.longitude;
    }

    latitude = this.#latDefault;
    longitude = this.#lngDefault;

    const coords = [latitude, longitude];
    this.#map = L.map("map").setView(coords, this.#zoomLevel);

    L.tileLayer(`https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png`, {
      maxZoom: 8,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.#map);

    this._goDefaultMap();
  }

  //Go Default
  _goDefaultMap() {
    tile.innerHTML = "";
    list.innerHTML = "";

    this.#zoomLevel = 4;

    this.#country = {
      latlng: [this.#latDefault, this.#lngDefault],
      name: {
        common: "Your Location",
      },
    };
    if (this.#currentMarker) this.#map.removeLayer(this.#currentMarker);
    if (this.#access) this._renderCountryMarker();
    this._focusCountry();
  }

  //country List
  _countryList() {
    tile.innerHTML = "";
    list.innerHTML = "";

    let html = "";
    let index = 0;
    this.#countries.forEach((ele) => {
      html += `
        <div class="list_border" data-id="${index++}">
          <img class ="list_flag" src="${ele.flags.png}" alt="">
          <h4 class = "list_name">${ele.name?.common}</h4>
        </div>
      `;
      this.#countries[index - 1] = Object.assign({ id: index - 1 }, ele);
    });

    list.insertAdjacentHTML("afterbegin", html);
  }

  //selecting the country
  _clickCountry(e) {
    const countryEl = e.target.closest(".list_border");
    if (!countryEl) return;

    this.#country = this.#countries.find(
      (country) => country.id === +countryEl.dataset.id
    );
    this._renderRequest();
  }

  //Creating new country and ajax call
  _newCountry(e) {
    e.preventDefault();
    const inputName = input.value;
    fetch(`https://restcountries.com/v3.1/name/${inputName}`)
      .then((response) => {
        if (!response.ok)
          throw new Error(`Country Not Found ${response.status}`);
        return response.json();
      })
      .then((data) => {
        this.#countries = data;
        this._countryList();
      })
      .catch((err) => console.log(err.message));
  }

  _renderRequest() {
    list.innerHTML = "";

    //setting zoom level (area funtion => base area = china)
    this.#zoomLevel = 5;
    const area = this.#country.area;

    if (area >= this.#countrySize) {
      this.#zoomLevel -= area / (this.#countrySize * 2.5);
    } else {
      this.#zoomLevel += this.#countrySize / (area * 3.5);
    }

    //calling : adding the info html of new country
    this._renderCountryInfo();

    //calling : rendering the new marker on the map if its now default
    this._renderCountryMarker();

    //calling : focusing map on country
    this._focusCountry();
  }

  //adding info html to dom
  _renderCountryInfo() {
    const current = this.#country;

    let html = `
        <img class="country__img" src="${current.flags.png}" />
        <div class="country__data">
          <h3 class="country__name">${current.name?.common}</h3>
          <h4 class="country__region">${current.region}</h4>
          <div class="country__data__list">
          <p class="country__row"><span>👀</span>Acha API mile tab kardunga</p>
            <p class="country__row"><span>📌</span>:  ${current.capital}</p>
            <p class="country__row"><span>🗣️</span>: ${current.languages}</p>
            <p class="country__row"><span>💰</span>: </p>
            <p class="country__row"><span>👨‍👩‍👧‍👦</span>: ${current.population}</p>
            <p class="country__row"><span>🗺️</span>: ${current.area} sqmeters</p>
          </div>
        </div>
        `;
    tile.innerHTML = "";
    tile.insertAdjacentHTML("afterbegin", html);
  }

  //render the Marker for the country
  _renderCountryMarker() {
    //removing last marker if exists
    if (this.#currentMarker) this.#map.removeLayer(this.#currentMarker);

    this.#currentMarker = new L.marker(this.#country.latlng, {
      shadowPane: "shadowPane",
      autoPan: true,
    });
    this.#map.addLayer(this.#currentMarker);
    this.#currentMarker
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `popup`,
        })
      )
      .setPopupContent(`${this.#country.name.common}`)
      .openPopup();
  }

  //Moving the map to focus on coordinates of country
  _focusCountry() {
    const [lat, lng] = this.#country.latlng;
    this.#map.setView([lat, lng], this.#zoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
}

//creating the instance of the App class
const app = new App();
