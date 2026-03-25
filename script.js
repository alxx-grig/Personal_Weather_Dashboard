/*========================================================== Clock Function ==========================================================*/
function updateClock(){
  const now = new Date(); // Creates a Date object called 'now' to access the date and time

  const hours = now.getHours().toString().padStart(2, '0'); // .padStart() function adds whatever character is specified at the beginning of the string if it doesn't have the required number of characters: in this case 2
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  document.getElementById('time').textContent = `${hours}:${minutes}:${seconds}`; // sets the hours, minutes and seconds by updating HTML

  const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }; // specifies the actual format for the date
  document.getElementById('date').textContent = now.toLocaleDateString('en-US', options); // using the 'now' object, it sets the date with the specified format and updtaes HTML
}



/*========================================================== Weather Function ==========================================================*/
async function getWeather(){ // async is a keyword that is used when we don't really want a function to activate instantly and is waiting for another condition
  const latitude = 28.586779934551355; // coordinates of where we are
  const longitude = -81.20615364774744;

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m&current_weather=true&temperature_unit=fahrenheit&wind_speed_unit=mph&daily=temperature_2m_max,temperature_2m_min`;
  /*https://api.open-meteo.com/v1/forecast?latitude=28.586779934551355&longitude=-81.20615364774744&current=temperature_2m,relative_humidity_2m&current_weather=true&temperature_unit=fahrenheit&wind_speed_unit=mph&daily=temperature_2m_max,temperature_2m_min`;*/

  try{
    const response = await fetch(url);
    if(!response.ok){
      throw new Error('Network response was not ok'); // If the response is not okay, then through an error out
    }

    const dataRecieved = await response.json(); // parsing the string that we got to an actual javascript object

    const currentWeather = dataRecieved.current_weather;
    const humidity = dataRecieved.current ? dataRecieved.current.relative_humidity_2m : "N/A";
    const dailyWeather = dataRecieved.daily;
    const weatherCodes = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Fog",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        80: "Slight rain showers",
        95: "Thunderstorm"
    }
    const description = weatherCodes[currentWeather.weathercode] || "Unknown condition";
    

    document.getElementById('weather-widget').innerHTML = `
            <p> Current Weather Stats: </p>
            <div class="current-day-stats">${Math.round(currentWeather.temperature)}°F</div>
            <div class="current-day-stats">High: ${Math.round(dailyWeather.temperature_2m_max[0])}°</div>
            <div class="current-day-stats">Wind Speed: ${currentWeather.windspeed} mph</div>
            <p style="font-size: 2.5rem; color: var(--text-secondary);">Humidity: ${humidity}%</p>
        `;

    document.getElementById('recommendations-widget').innerHTML = `
            <p>Weather Description:</p>
            <p>${description}</p>
    `

    // Array of day names to map the dates
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let forecastHTML = "";

    // Loop through the next 6 days (starting at index 1 for tomorrow)
    for(let i = 1; i <= 6; i++){
        const date = new Date(dailyWeather.time[i] + 'T00:00');
        const dayName = dayNames[date.getDay()];
        const dayNumber = date.getDate();
        const maxTemp = Math.round(dailyWeather.temperature_2m_max[i]);
        const minTemp = Math.round(dailyWeather.temperature_2m_min[i]);

        // Adding the HTML that will be injected into index.html
        forecastHTML += `
            <div class="forecast-day">
                <span class="day-name">${dayName} ${dayNumber}</span>
                <span class="day-temp">${maxTemp}° / ${minTemp}°</span>
            </div>
        `;
    }

    document.getElementById('forecast-bar').innerHTML = forecastHTML;
  }
  catch(error){
    console.error("Open-Meteo fetch failed:", error);
  }

}



/*========================================================== Shuttle Function ==========================================================*/
async function getShuttleData(){
    const targetUrl = "https://ucf.transloc.com/Services/JSONPRelay.svc/GetStopArrivalTimes?apiKey=8882812681&stopIds=54&version=2";

    try{
        const response = await fetch('http://localhost:3001');
        const data = await response.json();

        const route2Data = data.find(item => item.RouteDescription === "Route 2");

        if(route2Data && route2Data.Times && route2Data.Times.length > 0){
            const nextEntry = route2Data.Times.find(t => !t.IsDeparted);

            if(nextEntry){
                const allEntries = route2Data.Times.filter(t => !t.IsDeparted);
                const secondEntry = allEntries[1]; // second bus if it exists

                const getDisplayTime = (entry) => {
                    const minutesAway = Math.floor(entry.Seconds / 60);
                    if (entry.Seconds <= 120) return `Shuttle is Arriving!🚨`;
                    else if (entry.Seconds <= 300) return `Get Ready, Shuttle arrives in ${minutesAway} min`;
                    else return `Shuttle is ${minutesAway} min away...`;
                };

                // If the second entry exists, display it's information, else don't display anything
                const secondBusHTML = secondEntry ? `
                    <div id="next-shuttle">
                        Next: ${getDisplayTime(secondEntry)}
                    </div>
                ` : '';

                document.getElementById('shuttle-routes-widget').innerHTML = `
                    <p>Route 2 @ Boardwalk Stop</p>
                    <div>
                        ${getDisplayTime(nextEntry)}
                    </div>
                    ${secondBusHTML}
                `;
            }
            else{
                document.getElementById('shuttle-routes-widget').innerHTML = `
                    <p>Route 2 @ Boardwalk Stop</p>
                    <p style="margin-top: 1rem;">Checking for next bus...</p>
                `;
            }
        }
        else{
            document.getElementById('shuttle-routes-widget').innerHTML = `
                <p>Route 2 @ Boardwalk Stop</p>
                <p style="margin-top: 1rem;">No active shuttle routes</p>
            `;
        }
    }
    catch(error){
        console.error("UCF Shuttle Fetch Error:", error);
    }
}

// Run the functions!
updateClock();
getWeather();
getShuttleData();

// Updating Function
setInterval(updateClock, 1000); // Refresh clock every second (1000 milliseconds)
setInterval(getWeather, 1800000); // Refresh weather every 30 minutes (1800000 milliseconds)
setInterval(getShuttleData, 20000); // Refresh the Route 2 widget every minute (60000 milliseconds)