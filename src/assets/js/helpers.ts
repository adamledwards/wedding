export const removeClass = (el: HTMLElement, className: string) => {
    if (el.classList) {
        el.classList.remove(className);
    }
    else {
        el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }
}

export const addClass = (el: HTMLElement, className: string) => {
    if (el.classList) {
        el.classList.add(className);
    } else {
        el.className += ' ' + className;
    }
}

export const getEl = (el: string) => document.querySelector(el)

export const empty = (el: HTMLElement) => {
    while (el.firstChild) {
        el.firstChild.remove()
    }
}