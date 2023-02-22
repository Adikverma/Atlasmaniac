"use strict";

//Elements
const form = document.querySelector(".form");
const input = document.querySelector(".form__input");
const btn1 = document.querySelector(".btn1");
const btn2 = document.querySelector(".btn2");
const tile = document.querySelector(".country");

class App {
  #map;
  #zoomLevel = 4;
  #countrySize = 3287590;
  #country;
  #currentMarker;

  //Event Listeners
  constructor() {
    this._getPosition();

    form.addEventListener("submit", this._newCountry.bind(this));

    btn1.addEventListener("click", this._newCountry.bind(this));

    btn2.addEventListener(
      "click",
      function () {
        this.#country = "";
        tile.innerHTML = "";
        tile.style.opacity = 0;
        if (this.#currentMarker) this.#map.removeLayer(this.#currentMarker);
      }.bind(this)
    );
  }

  //Loading the Location
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () => {
        alert("Cannot load your location ;(");
        this._loadMap("not");
      });
  }

  //Loading the Map
  _loadMap(position) {
    let latitude = 18;
    let longitude = 73;
    if (position !== "not") {
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
    }

    const coords = [latitude, longitude];
    this.#map = L.map("map").setView(coords, this.#zoomLevel);

    L.tileLayer(`https://stamen-tiles.a.ssl.fastly.net/toner/{z}/{x}/{y}.png`, {
      maxZoom: 8,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.#map);

    if (position != "not") {
      this.#country = {
        latlng: [latitude, longitude],
        name: {
          common: "Your Location",
        },
      };
      this._renderCountryMarker();
    }
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
      .then(
        function (data) {
          console.log(data);
          this.#country = data[0];
          this.#zoomLevel = 5;
          const area = this.#country.area;

          if (area >= this.#countrySize) {
            this.#zoomLevel -= area / (this.#countrySize * 2.5);
          } else {
            this.#zoomLevel += this.#countrySize / (area * 3.5);
          }

          this._renderRequest();
        }.bind(this)
      )
      .catch((err) => console.log(err.message));
  }

  _renderRequest() {
    //calling : adding the info html of new country
    this._renderCountryInfo();

    //calling : rendering the new marker on the map
    this._renderCountryMarker();

    //calling : focusing map on country
    this._focusCountry();
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

  //adding info html to dom
  _renderCountryInfo() {
    const current = this.#country;
    tile.style.opacity = 1;
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
