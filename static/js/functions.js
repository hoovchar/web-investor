let ctx = document.getElementById('myChart');
let userData = getCookie()
let step = userData['stp']

let chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [step - 4, step - 3, step - 2, step - 1, step],
      datasets: [{
        label: 'Стоимость за 5 дней',
        data: [0, 0, 0, 0, 0],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
});

function getCookie() {
    let cookies = JSON.parse(atob(document.cookie.split('userData=')[1].replaceAll('"', '').replaceAll('\\', '')))
    return cookies
}

function setCookie(cookies) {
    document.cookie = `userData=${btoa(JSON.stringify(cookies))}`
}

function select(id) {
    console.log(id)
    
    for (stock of userData['stocks']) {
        if (stock['i'] == id) {

            chart.destroy()

            chart = new Chart(ctx, {
                type: 'line',
                data: {
                  labels: [step - 4, step - 3, step - 2, step - 1, step],
                  datasets: [{
                    label: 'Стоимость за 5 дней',
                    data: stock['cost'],
                    borderWidth: 1
                  }]
                },
                options: {
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }
            });

            break
        }
    }

    document.getElementById('chart-name').innerText = id
}

async function update() {
    let compList = document.getElementById('companies')
    let newsList = document.getElementById('news')
    let investments = document.getElementById('stocks')
    // let userData = getCookie()

    let stocks = await fetch('/api?c=stocks')
    let events = await fetch('/api?c=news')
    stocks = await stocks.json()
    events = await events.json()

    console.log(userData)
    console.log(events)


    document.getElementById('day').innerText = `${userData['stp']} день`
    document.getElementById('money').innerText = `${userData['mny']} $`

    for (stock of stocks['stocks']) {
        compList.innerHTML += `
        <div class="company" onclick="select('${stock['id']}')">
            <div class="company-title-cont">
                <p class="company-title">${stock['name']}</p>
                <p class="company-id" id="comp-${stock['id']}">${stock['id']}</p>
            </div>
            <p class="company-desc">${stock['desc']}</p>
            <p class="company-industry">${stock['ind']}</p>
        </div>`
    }

    for (stock of userData['stocks']) {
        if (stock['own'] > 0) {
            // investments.innerHTML += `<div class="stock" id="stock-${stock['i']}" onclick="select('${stock['i']}')">${stock['i']} -> ${stock['own']}</div>`
            investments.innerHTML += `
            <div class="bought-stock" onclick="select('${stock['i']}')">
                <p class="stock-id">${stock['i']}</p>
                <p class="company-id">Куплено: ${stock['own']}</p>
            </div>`
        }

        document.getElementById(`comp-${stock['i']}`).innerText += ` | ${stock['cost'][stock['cost'].length - 1]} $`

        for (event_ of stock['evs']) {
            document.getElementById('news').innerHTML += `
            <div class="event-${event_[1]}" onclick="select('${stock['i']}')">
                <div class="event-header">
                    <p class="event-title">${events[ stock['i'] ][ event_[0] ][ 'name' ]}</p>
                    <p class="company-id">${stock['i']}</p>
                </div>
                <p class="company-desc">${events[ stock['i'] ][ event_[0] ][ 'desc' ] }</p>
            </div>`
        }
    }

    for (event_ of userData['events']) {
        document.getElementById('news').innerHTML += `
        <div class="event-${event_[1]} global-event">
            <div class="event-header">
                <p class="event-title">${events[ event_[0] ]['name']}</p>
                <p class="company-id">ГЛОБАЛЬНОЕ</p>
            </div>
            <p class="company-desc">${events[event_[0]][ 'desc' ] }</p>
        </div>`
    }

    document.getElementById('step').onclick = function() {
        setCookie(userData);
        window.location.href = '/?c=update'
    }


    select(userData['stocks'][0]['i'])
}