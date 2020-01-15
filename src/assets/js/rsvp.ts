
const removeClass = (el, className) => {
    if (el.classList) {
        el.classList.remove(className);
    }
    else {
        el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
}

const addClass = (el, className) => {
    if (el.classList) {
        el.classList.add(className);
    } else {
        el.className += ' ' + className;
    }
}

const getEl = (el) => document.querySelector(el)

function rsvp() {
    document.querySelector('.RSVP-content').addEventListener('change', (event) => {
        const value = parseInt(event.target.value)
        const parent = event.target.parentElement.parentElement
        if (value === 2) {
            removeClass(parent, 'False')
            removeClass(parent, 'None')
            addClass(parent, 'True')
        } else if (value === 3) {

            addClass(parent, 'False')
            removeClass(parent, 'None')
            removeClass(parent, 'True')
        } else {
            removeClass(parent, 'False')
            removeClass(parent, 'True')
            addClass(parent, 'None')
        }
    })
    form()
}

function form() {
    document.getElementById('RSVP-form').addEventListener('submit', (event) => {
        var path = window.location.pathname;
        event.preventDefault()
        console.log(new FormData(event.target))
        return fetch(`${path}response/`, {
            method: 'post',
            body: new FormData(event.target)
        }).then((response) => {
            return response.json()
        }).then(json => {
            if (json.allValid) {
                addClass(event.target, 'submitted')
                addClass(getEl('.RSVP-confirmation'), 'submitted')
                event.target.firstElementChild.setAttribute('disabled', true)
                getEl('.RSVP-header').textContent = window.sophieAdamWedding.thanks
                removeClass(getEl(`.RSVP-error`), 'error')
            } else {
                const errorPrefix = Object.keys(json.errors)
                for (let i = 0; errorPrefix.length > i; i++) {
                    addClass(getEl(`.js-form-${errorPrefix[i]}`), 'error')
                    addClass(getEl(`.RSVP-error`), 'error')
                }
            }
        })
    })
}

export default rsvp