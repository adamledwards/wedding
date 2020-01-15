import prefix from 'prefix'

let scrollY = window.scrollY
let startTick = false
function debounce(func, wait) {
  var timeout;
  return function () {
    var context = this, args = arguments;
    var later = function () {
      timeout = null;
      func.apply(context, args);
      startTick = false
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    func.apply(context, args);
    startTick = true
  };
};

class Parallax {
  img: HTMLImageElement
  containerRect: ClientRect
  top: number
  ref: Symbol
  loopStarted: boolean
  progress: number
  imgHeight: number
  windowHeight: number
  constructor(id: string) {
    this.id = id
    this.el = document.getElementById(this.id)
    this.loopStarted = false
    this.img = this.el.getElementsByClassName(
      'PhotoSection-bg'
    )[0] as HTMLImageElement
    this.ref = Symbol()

    this.checkImageLoaded()
    this.loop = this.loop.bind(this)
  }

  checkImageLoaded() {
    if (!this.img.naturalWidth) {
      const imgProxy = new Image()
      imgProxy.onload = () => {
        this.update()
      }
      imgProxy.src = this.img.src
    } else {
      this.update()
    }
  }

  update() {
    this.containerHeight = this.el.offsetHeight
    this.top = this.el.offsetTop
    this.setTranslateY()
  }

  setTranslateY() {
    this.imgHeight = this.img.height
    this.windowHeight = window.innerHeight
    const transition = this.containerHeight - this.imgHeight
    this.img.style[prefix('transform')] = `translate3d(0, ${transition}px, 0)`
  }

  loop() {

    const scrollStart = this.windowHeight - (this.top - scrollY)
    const all = this.containerHeight + this.windowHeight
    if (scrollStart > 0 && all > scrollStart) {
      this.progress = scrollStart / all
      const transformValueY = this.containerHeight - this.imgHeight
      const transition = transformValueY + Math.abs(transformValueY) * this.progress
      this.img.style[prefix('transform')] = `translate3d(0,${transition.toFixed(2)}px, 0)`
    }
  }
}

function startParallax(ids?: string[]) {

  const church = new Parallax('JS-CHURCH')
  const followed = new Parallax('JS-FOLLOWED')
  const reception = new Parallax('JS-RECEPTION')
  const churchLoop = Parallax.prototype.loop.bind(church)
  const followedLoop = Parallax.prototype.loop.bind(followed)
  const receptionLoop = Parallax.prototype.loop.bind(reception)

  const rAF = () => {
    churchLoop()
    followedLoop()
    receptionLoop()
    startTick = false
  }

  const requestTick = () => {
    if (!startTick) {
      window.requestAnimationFrame(rAF)
      startTick = true
    }
  }

  window.addEventListener('scroll', (evt: Event) => {
    scrollY = window.scrollY
    requestTick()
  }, { passive: true })


  window.addEventListener('resize', debounce(() => {
    church.update()
    followed.update()
    reception.update()
  }, 1000), { passive: true })
}

export default startParallax
