function getCookie() {
    let cookies = JSON.parse(atob(document.cookie.split('userData=')[1].replaceAll('"', '').replaceAll('\\', '')))
    return cookies
}

function setCookie(cookies) {
    document.cookie = `userData=${btoa(JSON.stringify(cookies))}`
}

async function update() {
    let list = document.getElementById('companies')
    let stocks = await fetch('/api?c=stocks')
    stocks = await stocks.json()

    for (stock of stocks['stocks']) {
        list.innerHTML += `<div class="company">${stock['name']}</div>`
    }
}