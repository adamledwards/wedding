(function () {
    let activeEl: HTMLDivElement | undefined
    let guestListFilter: string[]

    function main() {
        const form = document.getElementById('tableName') as HTMLFormElement;
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            post(new FormData(form))
        })
        const filterInput = document.querySelector('input[name="filter"]')
        filterInput.addEventListener('input', (event: Event) => {
            filterName(event.target as HTMLInputElement)
        })
    }

    function post(formData: FormData, method = 'POST') {
        return fetch('', {
            method,
            body: formData,
        }
        ).then(data => data.json())
            .then((json) => {
                const main = document.querySelector('.main')
                const guestList = document.querySelector('.guestList')
                const tabWrapper = document.querySelector('.TablePlannerTabs')
                while (tabWrapper.firstChild) {
                    tabWrapper.removeChild(tabWrapper.firstChild);
                }
                while (main.firstChild) {
                    main.removeChild(main.firstChild);
                }
                while (guestList.firstChild) {
                    guestList.removeChild(guestList.firstChild);
                }
                const frag = new DocumentFragment()
                const listFrag = new DocumentFragment()
                const tabFrag = new DocumentFragment()

                const tab1 = document.createElement('a')
                tab1.className = 'RSVP-submit active'
                tab1.setAttribute('data-index', '0')
                tab1.textContent = 'All'
                tabFrag.appendChild(tab1)

                json.response.forEach((guest) => {
                    const guestEl = document.createElement('div')
                    guestEl.className = 'guest'
                    guestEl.setAttribute('data-id', guest.guest__pk)
                    guestEl.setAttribute('draggable', 'true')
                    guestEl.textContent = `${guest.guest__first_name} ${guest.guest__last_name}`
                    listFrag.appendChild(guestEl)
                })
                // create 
                const keys = Object.keys(json.tables)
                for (let i = 0; i < keys.length; i++) {
                    let currentTable = json.tables[keys[i]]
                    const tableDom = document.createElement('div')
                    tableDom.className = 'table'
                    tableDom.setAttribute('data-id', currentTable.pk)

                    const tableContent = document.createElement('div')
                    tableContent.className = 'table-content'
                    tableDom.appendChild(tableContent)

                    const header = document.createElement('div')
                    header.className = 'header'
                    tableContent.appendChild(header)
                    header.textContent = keys[i]
                    frag.appendChild(tableDom)

                    //tabs
                    const tab = document.createElement('a')
                    tab.className = 'RSVP-submit'
                    tab.setAttribute('data-index', String(i + 1))
                    tab.textContent = keys[i]
                    tabFrag.appendChild(tab)
                    //<a class="RSVP-submit" data-index="{{forloop.counter}}">{{t.name}}</a>

                    //list
                    if (currentTable.seats.length) {
                        const ul = document.createElement('ul')
                        currentTable.seats.forEach((element, idx) => {
                            const li = document.createElement('li')
                            const textEl = document.createElement('span')
                            const buttonEl = document.createElement('span')
                            buttonEl.className = 'js-remove-guest'
                            buttonEl.textContent = '❌'
                            li.setAttribute('data-id', element.pk)
                            li.setAttribute('draggable', 'true')
                            li.className = 'seat'
                            textEl.textContent = `${idx + 1}. ${element.guest__first_name} ${element.guest__last_name}`

                            li.appendChild(textEl)
                            li.appendChild(buttonEl)

                            ul.appendChild(li)
                        });
                        tableContent.appendChild(ul)
                    }

                }
                main.classList.remove('zoom')
                main.style.transform = ''
                main.appendChild(frag)
                guestList.appendChild(listFrag)
                tabWrapper.appendChild(tabFrag)
                updateGuestFilter()

                filterName(document.querySelector('input[name="filter"]'))
            })

    }

    function drag() {
        const main = document.querySelector('.main')
        main.addEventListener('dragover', (event) => {
            event.preventDefault();
            const table = event.path.find((el) => {
                return el.className == 'table'
            })

            if (table && activeEl !== table) {
                activeEl = table
                table.style['backgroundColor'] = '#ccc'
            }
        })

        main.addEventListener('dragleave', (event) => {
            event.preventDefault();
            const table = event.path.find((el) => {
                return el.className == 'table'
            })
            if (table) {
                activeEl = void 0
                table.style['backgroundColor'] = ''
            }
        })

        main.addEventListener('drop', (event: Event) => {
            event.preventDefault();
            let target = event.target as HTMLElement

            let table: HTMLElement | null = null
            while (!main.isEqualNode(target) || !table) {
                target = target.parentElement
                if (target.dataset.id) {
                    table = target
                }
            }

            if (table) {
                const form = new FormData()
                let seatLi: HTMLLIElement | null = null
                table.style['backgroundColor'] = ''
                const action = event.dataTransfer.getData("action") as string;
                const guestName = event.dataTransfer.getData("guestName") as string;
                const tableId = table.dataset.id
                if (action == 'newTable') {
                    const guestId = event.dataTransfer.getData("guestId");
                    form.append('guestId', guestId)
                    form.append('tableId', tableId)
                    form.append('action', 'addGuest')

                }
                if (action == 'updateGuest') {
                    const seatId = event.dataTransfer.getData("seatId");
                    form.append('seatId', seatId)
                    form.append('tableId', tableId)
                    form.append('action', 'updateGuest')
                    seatLi = document.querySelector<HTMLLIElement>(`li.seat[data-id="${seatId}"]`)
                    seatLi.style['display'] = 'none'
                }

                const optimisticEl = document.createElement('li')
                optimisticEl.textContent = guestName
                let ulEl = table.querySelector('.table-content ul')
                if (ulEl) {
                    ulEl.appendChild(optimisticEl)
                } else {
                    ulEl = document.createElement('ul')
                    ulEl.appendChild(optimisticEl)
                    table.querySelector('.table-content').appendChild(ulEl)
                }
                post(form).catch(() => {
                    if (seatLi) {
                        seatLi.style['display'] = 'block'
                    }
                    optimisticEl.remove()
                })
            }
        })

        document.querySelector('.guestList').addEventListener('dragstart', (event) => {
            const guest = event.target as HTMLDivElement
            console.log()
            if (guest) {
                event.dataTransfer.setData("guestId", guest.dataset.id);
                event.dataTransfer.setData("guestName", guest.textContent);
                event.dataTransfer.setData("action", 'newTable');
            }
        })

        document.querySelector('.main').addEventListener('dragstart', (event) => {
            const seat = event.target as HTMLDivElement
            console.log(event)
            if (seat) {
                event.dataTransfer.setData("seatId", seat.dataset.id);
                event.dataTransfer.setData("guestName", seat.querySelector('span').textContent);
                event.dataTransfer.setData("action", 'updateGuest');
            }
        })
    }


    function removeGuest() {
        const guestList = document.querySelector('.main')
        guestList.addEventListener('click', (event: Event) => {
            if (event.target.classList.contains('js-remove-guest')) {
                const form = new FormData()
                form.append('tableGuestPk', event.target.parentNode.dataset.id)
                form.append('action', 'removeGuest')
                post(form)
            }

        })
    }
    function updateGuestFilter() {
        const list = []
        document.querySelectorAll('.guest').forEach((el) => {
            list.push([el.textContent.toLowerCase(), el.dataset.id])
        })
        guestListFilter = list
    }

    function filterName(filterInput: HTMLInputElement) {
        const filterQuery = filterInput.value
        const showIDs = guestListFilter.filter((e) => (e[0].match('^' + filterQuery.toLowerCase()))).map(e => e[1])
        document.querySelectorAll<HTMLDivElement>('.guest').forEach((el) => {
            if (showIDs.indexOf(el.dataset.id) > -1) {
                el.style['display'] = 'block'
            } else {
                el.style['display'] = 'none'
            }
        })

    }

    function viewMode() {

        document.querySelector('.TablePlannerTabs').addEventListener('click', (event) => {
            if (event.target.nodeName == 'A') {
                const main = document.querySelector<HTMLDivElement>('.main')
                document.querySelectorAll('.TablePlannerTabs a').forEach(el => el.classList.remove('active'))


                const index = parseInt(event.target.dataset.index)
                event.target.classList.add('active')
                if (index) {
                    main.classList.add('zoom')
                    main.style.transform = `translateX(-${(index - 1) * 100}%)`
                } else {
                    main.classList.remove('zoom')
                    main.style.transform = ''
                }
            }
        })

    }

    window.addEventListener("DOMContentLoaded", () => {
        main()
        updateGuestFilter()
        drag()
        removeGuest()
        viewMode();
    })
})()