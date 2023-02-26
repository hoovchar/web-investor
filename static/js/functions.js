function getCookie() {
    let cookies = JSON.parse(atob(document.cookie.split('userData=')[1].replaceAll('"', '').replaceAll('\\', '')))
    return cookies
}

function setCookie(cookies) {
    document.cookie = `userData=${btoa(JSON.stringify(cookies))}`
}

function select(id) {
    
}

async function update() {
    let compList = document.getElementById('companies')
    let newsList = document.getElementById('news')
    let investments = document.getElementById('stocks')
    let userData = getCookie()
    let stocks = await fetch('/api?c=stocks')
    let events = await fetch('/api?c=news')
    stocks = await stocks.json()
    events = await events.json()

    console.log(userData)
    console.log(events)


    document.getElementById('day').innerText = `${userData['stp']} день`
    document.getElementById('money').innerText = `${userData['mny']} $`

    for (stock of stocks['stocks']) {
        compList.innerHTML += `<div class="company">
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
            investments.innerHTML += `<div class="stock" id="stock-${stock['i']}">${stock['i']}</div>`
        }

        document.getElementById(`comp-${stock['i']}`).innerText += ` | ${stock['cost'][stock['cost'].length - 1]} $`

        for (event_ of stock['evs']) {
            document.getElementById('news').innerHTML += `
            <div class="event-${event_[1]}">
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