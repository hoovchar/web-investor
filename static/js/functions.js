function getCookie() {
    let cookies = JSON.parse(atob(document.cookie.split('userData=')[1].replaceAll('"', '').replaceAll('\\', '')))
    return cookies
}

function setCookie(cookies) {
    document.cookie = `userData=${btoa(JSON.stringify(cookies))}`
}

async function update() {
    let compList = document.getElementById('companies')
    let newsList = document.getElementById('news')
    let investments = document.getElementById('stocks')
    let userData = getCookie()
    console.log(userData)
    let stocks = await fetch('/api?c=stocks')
    let events = await fetch('/api?c=news')
    stocks = await stocks.json()
    events = await events.json()


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
            <p class="event-title">${events[ stock['i'] ][ event_[0] ][ 'name' ]}</p>
            <p class="event-desc"></p>
            `
        }

        
    }

    document.getElementById('step').onclick = function() {
        setCookie(userData);
        window.location.href = '/?c=update'
    }
}