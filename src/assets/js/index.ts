import 'whatwg-fetch'
import 'scroll-restoration-polyfill'
import 'events-polyfill'

import startParallax from './parallax'
import hotels, { hotelDetail } from './hotels'
import rsvp from './rsvp'


window.addEventListener("DOMContentLoaded", () => {
  hotels()
  rsvp()
  hotelDetail()
})
window.onload = () => {
  startParallax()
}

