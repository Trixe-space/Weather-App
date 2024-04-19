let regionList
let WMOcodes
let regionSelector = document.querySelector('#region-select')

const regionInputs = () => {
    for (i in regionList) {
        regionSelector.innerHTML += `<option value="${i}">${regionList[i].country}</option>`
    }
}

fetch('WMO codes.json')
    .then(response => response.json())
    .then(data => {
        WMOcodes = data
    })

fetch('Regions.json')
    .then(response => response.json())
    .then(data => {
        regionList = data
        regionInputs()
    })

let latitude = document.querySelector('#latitude')
let longitude = document.querySelector('#longitude')

let temperatureIndicator = document.querySelector('.temperature.main')
let statusIndicator = document.querySelector('.status.main')
let sunriseIndicator = document.querySelector('#sunrise-time')
let sunsetIndicator = document.querySelector('#sunset-time')

const infoSet = (temperature, weatherCode, day, sunrise, sunset) => {
    temperatureIndicator.innerText = temperature

    fetch('WMO codes.json')
        .then(response => response.json())
        .then(data => {
            if (day == 1) {
                statusIndicator.innerText = data[weatherCode].day.description
            } else {
                statusIndicator.innerText = data[weatherCode].night.description
            }
        })
    
    sunriseIndicator.innerText = sunrise.split('T').pop()
    sunsetIndicator.innerText = sunset.split('T').pop()

}

const extraHourlyTemplate = 
`
<div class="extra-info">
    <span class="extra-time">00:00</span>
    <span>•</span>
    <img src="Images/Temperature.svg" alt="">
    <span><span class="extra-temperature">00</span>°C</span>
    <span>•</span>
    <img src="" alt="" class="extra-status">
    <span>•</span>
    <img src="Images/Precipitation.svg" alt="">
    <span class="extra-precipitation">00%</span>
    <span>•</span>
    <img src="Images/Humidity.svg" alt="">
    <span class="extra-humidity">00%</span>
</div>
`

const extraDailyTemplate = 
`
<div class="extra-info">
    <span class="extra-date">1 Jan</span>
    <span>•</span>
    <img src="Images/High-Temperature.svg" alt="">
    <span><span class="extra-high-temp">00</span>°C</span>
    <span>•</span>
    <img src="Images/Low-Temperature.svg" alt="">
    <span><span class="extra-low-temp">00</span>°C</span>
    <span>•</span>
    <img src="" alt="" class="extra-status">
    <span>•</span>
    <img src="Images/Precipitation.svg" alt="">
    <span class="extra-precipitation">00%</span>
</div>
`

const monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
let isToday = true

let extraInfoContainer = document.querySelector('#extra-info-container')

const extraInfoSet = (hourlyData, dailyData) => {
    extraInfoContainer.innerHTML = ''

    if (isToday) {
        for (let i = 0; i <= 23; i++) {
            extraInfoContainer.innerHTML += extraHourlyTemplate
        }

        let status = document.querySelectorAll('.extra-status')
        fetch('WMO codes.json')
            .then(response => response.json())
            .then(codes => {
                for (statusNum in status) {
                    status[statusNum].src = codes[hourlyData.weather_code[statusNum]].day.image
                }
            })
        
        let time = document.querySelectorAll('.extra-time')
        let temperature = document.querySelectorAll('.extra-temperature')
        let precipitation = document.querySelectorAll('.extra-precipitation')
        let humidity = document.querySelectorAll('.extra-humidity')
        for (i in extraInfoContainer.childNodes) {
            time[i].innerText = hourlyData.time[i].split('T').pop()
            temperature[i].innerText = hourlyData.temperature_2m[i].toFixed(0)
            precipitation[i].innerText = hourlyData.precipitation_probability[i] + '%'
            humidity[i].innerText = hourlyData.relative_humidity_2m[i] + '%'

        }
    } else {
        for (i in dailyData.time) {
            extraInfoContainer.innerHTML += extraDailyTemplate
        }

        let status = document.querySelectorAll('.extra-status')
        fetch('WMO codes.json')
            .then(response => response.json())
            .then(codes => {
                for (statusNum in status) {
                    status[statusNum].src = codes[dailyData.weather_code[statusNum]].day.image
                }
            })

        let date = document.querySelectorAll('.extra-date')
        let highTemperature = document.querySelectorAll('.extra-high-temp')
        let lowTemperature = document.querySelectorAll('.extra-low-temp')
        let precipitation = document.querySelectorAll('.extra-precipitation')
        let humidity = document.querySelectorAll('.extra-humidity')
        for (i in extraInfoContainer.childNodes) {
            date[i].innerText = dailyData.time[i].slice(8) + ' ' + monthList[new Date().getMonth()]
            highTemperature[i].innerText = dailyData.temperature_2m_max[i].toFixed(0)
            lowTemperature[i].innerText = dailyData.temperature_2m_min[i].toFixed(0)
            precipitation[i].innerText = dailyData.precipitation_probability_max[i] + '%'
        }
    }
}

const updateInfo = () => {
    if (regionSelector.value != 'auto') {
        latitude.innerText = regionList[regionSelector.value].latitude.toFixed(3)
        longitude.innerText = regionList[regionSelector.value].longitude.toFixed(3)

        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${regionList[regionSelector.value].latitude}&longitude=${regionList[regionSelector.value].longitude}&current=temperature_2m,is_day,weather_code&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max&timezone=auto`)
            .then(response => response.json())
            .then(data => {
                infoSet(data.current.temperature_2m, data.current.weather_code, data.current.is_day, data.daily.sunrise[0], data.daily.sunset[0])
                extraInfoSet(data.hourly, data.daily)
            })
    } else if (regionSelector.value == 'auto') {
        navigator.geolocation.getCurrentPosition(position => {
            latitude.innerText = position.coords.latitude.toFixed(3)
            longitude.innerText = position.coords.longitude.toFixed(3)
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&current=temperature_2m,is_day,weather_code&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_probability_max&timezone=auto`)
            .then(response => response.json())
            .then(data => {
                infoSet(data.current.temperature_2m, data.current.weather_code, data.current.is_day, data.daily.sunrise[0], data.daily.sunset[0])
                console.log(data)
                extraInfoSet(data.hourly, data.daily)
            })
        })
    }
}

regionSelector.addEventListener('input', event => {
    updateInfo()
})

let todaySelector = document.querySelector('#today-selector')
let weekSelector = document.querySelector('#week-selector')

todaySelector.addEventListener('click', () => {
    todaySelector.disabled = true
    weekSelector.disabled = false
    isToday = true
    updateInfo()
})

weekSelector.addEventListener('click', () => {
    weekSelector.disabled = true
    todaySelector.disabled = false
    isToday = false
    updateInfo()
})