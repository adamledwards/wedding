import { TweenLite, TimelineLite } from 'gsap'
import { getEl, empty } from './helpers.ts'
import pathToRegexp from 'path-to-regexp'
import createHistory from 'history/createBrowserHistory'

var icons = {
    church: {
        url: window.location.origin + '/static/location/church.svg',
        size: new google.maps.Size(32, 51.2),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(16, 51.2)
    },
    hotel: {
        url: window.location.origin + '/static/location/hotel.svg',
        size: new google.maps.Size(32, 51.2),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(16, 51.2)
    },
    reception: {
        url: window.location.origin + '/static/location/reception.svg',
        size: new google.maps.Size(32, 51.2),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(16, 51.2)
    },
};


const hotelRegex = pathToRegexp('/:guest/hotel/:id/')
const guestRegex = pathToRegexp('/:guest')
const history = createHistory()
let getMap = (result: any) => document.createElement('div')

function goToPath(pathname) {
    const hotelRegexResult = hotelRegex.exec(pathname)
    if (hotelRegexResult) {
        empty(document.getElementById('HotelDetail'))
        goToHotel(hotelRegexResult[2])

    } else {
        const elClone = getEl('#HotelDetail .js-hotels')
        if (elClone) {
            const id = elClone.dataset.id
            const el = getEl(`.Hotels .js-hotels[data-id='${id}']`)
            if (el) {
                backToMain(el)
            }
        }
    }
}

const query = '.HotelDetail-header, .Hotel-review, .Hotel-map, .Hotel-section'

function getPlaceMemorize() {
    const cache = {}
    return (placeId) => {
        if (cache[placeId]) {
            return Promise.resolve(cache[placeId])
        }
        var service = new google.maps.places.PlacesService(getEl(`.Hotels .js-hotels[data-id='${placeId}']`).querySelector('.js-google-places'));
        let request = {
            placeId,
            fields: ['name', 'rating', 'formatted_phone_number', 'international_phone_number', 'geometry', 'photos', 'geometry', 'reviews'],
            region: 'de',
            language: 'de',
        };
        return new Promise((resolve, reject) => {
            service.getDetails(request, (place) => {
                cache[placeId] = place
                resolve(place)
            });
        })
    }
}

const getPlace = getPlaceMemorize()

function hotels() {
    const els = document.getElementsByClassName('js-hotels')

    for (let i = 0; els.length > i; i++) {
        getPlace(els[i].dataset.id).then((place) => {
            els[i].querySelector('.JS-RATE').append(createRattingTemplate(place))
        });
    }
}

function createRattingTemplate(place) {
    const rattingTemplate = document.getElementById('RattingTemplate')
    const svg_clone = rattingTemplate.content.cloneNode(true)
    const polygons = svg_clone.querySelectorAll('polygon')
    for (let i = 0; Math.round(place.rating) > i; i++) {
        polygons[i].setAttribute('fill', '#F8E71C')
    }

    const fragment = document.createDocumentFragment()
    const p = document.createElement('p')
    p.textContent = `${place.rating.toFixed(1)}`
    fragment.appendChild(p)
    fragment.appendChild(svg_clone)

    return fragment

}

export function hotelDetail() {
    history.listen((location, action) => {
        goToPath(location.pathname)
    })
    goToPath(history.location.pathname)
    getEl('.Hotels').addEventListener('click', (event: Event) => {
        event.preventDefault()
        const target = event.target as HTMLAnchorElement
        if (target.classList.contains('js-hotel-detail')) {
            history.push(target.dataset.pathname)
        }
    })
    getMap = renderMap()
}

function goToHotel(id) {
    const scrollY = window.scrollY
    const el = getEl(`.Hotels .js-hotels[data-id='${id}']`)
    const bg = getEl('.Hotel-bg')

    const { top, height } = el.getBoundingClientRect();
    const windowHeight = window.innerHeight
    const hotelDetailEl = document.getElementById('HotelDetail')
    const hotelClone = prePopulatePage(el, hotelDetailEl)

    const hotelCloneRect = hotelClone.getBoundingClientRect()

    hotelDetailEl.className = "HotelDetail show"
    el.style.opacity = 0

    getEl('body').style.overflow = 'hidden'
    getEl('.inner-body').style.position = 'fixed'
    getEl('.inner-body').style.top = `-${scrollY}px`

    hotelClone.style.transform = `translateY(${top - hotelCloneRect.top}px)`

    const tl = new TimelineLite()
    tl.add(TweenLite.fromTo(hotelClone, 0.2,
        {
            y: top - hotelCloneRect.top,
        },
        {
            y: 0,
        })
    )

    tl.add(TweenLite.fromTo(bg, 0.2,
        {
            y: top + height / 2,
            opacity: 1,
        },
        {
            y: windowHeight / 2,
            scaleY: windowHeight,
        }), 0
    )

    tl.add(TweenLite.fromTo(document.querySelectorAll(query), 0.1,
        {
            opacity: 0,
        },
        {
            opacity: 1,
        })
    )
    window.setTimeout(() => {
        tl.eventCallback('onComplete', () => {
            postPopulatePage(el, hotelDetailEl)
        })
        if (hotelDetailEl.scrollTo) {
            hotelDetailEl.scrollTo(0, 0)
        } else {
            hotelDetailEl.scrollLeft = 0
        }

        tl.play()
    }, 0)
}

function postPopulatePage(el, hotelDetailEl) {
    getPlace(el.dataset.id).then(result => {
        hotelDetailEl.querySelector('.Hotel-map').appendChild(getMap(result))
        const ReviewsTemplate = document.getElementById('ReviewsTemplate')
        const fragment = document.createDocumentFragment()

        for (let i = 0; result.reviews.length > i; i++) {
            console.log(result, fragment)
            const template = ReviewsTemplate.content.cloneNode(true)
            const review = result.reviews[i]
            template.querySelector('.js-name').textContent = review.author_name
            template.querySelector('.js-text').textContent = review.text
            template.querySelector('.JS-RATE').appendChild(createRattingTemplate(review))
            fragment.appendChild(template)
        }
        hotelDetailEl.querySelector('#HotelReviews').appendChild(fragment)
    })
}

function makeMarker(map, position, icon, title) {
    new google.maps.Marker({
        position: position,
        map: map,
        icon: icon,
        title: title
    });
}

function renderMap() {
    let dom = document.createElement('div')
    let map: google.maps.Map
    let marker: google.maps.Marker

    const littleTeyLocation = new google.maps.LatLng(51.8863045, 0.7490323);
    const churchLocation = new google.maps.LatLng(51.874752, 0.691848);
    let directionsService = new google.maps.DirectionsService();
    let directionsDisplay = new google.maps.DirectionsRenderer({
        suppressMarkers: true
    });

    return (result) => {
        if (!map) {
            map = new google.maps.Map(dom);
            directionsDisplay.setMap(map);
            new google.maps.Marker({
                position: littleTeyLocation,
                map: map,
                icon: icons.reception
            });
            new google.maps.Marker({
                position: churchLocation,
                map: map,
                icon: icons.church
            });
        }
        const hotelLatLong = result.geometry.location.toJSON()
        const request = {
            origin: hotelLatLong,
            destination: littleTeyLocation,
            waypoints: [
                {
                    location: churchLocation,
                    stopover: true,
                },
            ],
            travelMode: 'DRIVING'
        };
        directionsService.route(request, function (mapResult, status) {
            if (status == 'OK') {
                var leg = mapResult.routes[0].legs[0];
                if (marker) {
                    marker.setMap(null)
                }
                marker = new google.maps.Marker({
                    position: hotelLatLong,
                    map: map,
                    icon: icons.hotel
                });

                directionsDisplay.setDirections(mapResult);
            }
        });

        const bounds = new google.maps.LatLngBounds();
        if (result.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(result.geometry.viewport);
        } else {
            bounds.extend(result.geometry.location);
        }

        map.fitBounds(bounds);
        map.setCenter(result.geometry.location)
        // map.setZoom(8)

        return dom
    }
}

function prePopulatePage(el: HTMLElement, hotelDetailEl) {
    const hotelTemplate = document.getElementById('HotelTemplate').content.cloneNode(true)
    const hotelClone = hotelTemplate.querySelector('#Hotel-clone-content')
    hotelClone.appendChild(el.cloneNode(true))
    hotelDetailEl.appendChild(hotelTemplate)
    return hotelClone
}


function backToMain(el: HTMLElement) {
    const topScroll = getEl('.inner-body').offsetTop
    const hotelDetail = document.getElementById('HotelDetail')
    const { top } = el.getBoundingClientRect();
    const windowY = window.scrollY
    const hotelClone = getEl('#Hotel-clone-content')
    const bg = getEl('.Hotel-bg')
    const hotelCloneRect = hotelClone.getBoundingClientRect()
    getEl('body').style.overflow = 'auto'
    getEl('.inner-body').style.position = ''
    window.scrollTo(0, Math.abs(topScroll))

    const tl = new TimelineLite()
    tl.add(TweenLite.fromTo(document.querySelectorAll(query), 0.1,
        {
            opacity: 1,
        },
        {
            opacity: 0,
        })
    )
    tl.add(TweenLite.fromTo(hotelClone, 0.2,
        {
            y: 0,
        },
        {
            y: (top + windowY) - (hotelCloneRect.top + windowY),
        })
    )

    tl.add(TweenLite.fromTo(bg, 0.2,
        {
            opacity: 1,
        },
        {
            opacity: 0,
        })
    )



    tl.eventCallback('onComplete', () => {
        bg.style['transform'] = 'scaleY(0)'
        el.style.opacity = '1'
        hotelDetail.className = 'HotelDetail'
        empty(document.getElementById('HotelDetail'))
    })

    tl.play()
}

export default hotels