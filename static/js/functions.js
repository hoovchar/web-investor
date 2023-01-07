function getCookie() {
    let cookies = JSON.parse(atob(document.cookie.split('userData=')[1].replaceAll('"', '').replaceAll('\\', '')))
    return cookies
}

function setCookie(cookies) {
    document.cookie = `userData=${btoa(JSON.stringify(cookies))}`
}