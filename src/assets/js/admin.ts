
(function ($) {

    $(document).ready(() => {
        const btn = $('<button class="button"></button>').html('Get Place')
        $('.field-place_id > div').append(btn)

        btn.click((event) => {
            event.preventDefault()
            let placeid = $('#id_place_id').val()
            $.getJSON('/admin/hotels/hotel/places', { placeid }, (data) => {
                $('#id_name').val(data.place.result.name)
                $('#id_phone_number').val(data.place.result.formatted_phone_number)
                $('#id_address_line_1').val(data.place.result.address_components[0].long_name)
                $('#id_address_line_2').val(data.place.result.address_components[1].long_name)
                $('#id_post_code').val(data.place.result.address_components[data.place.result.address_components.length - 1].long_name)

                $('#id_reception_distance').val(data.reception.routes[0].legs[0].distance.value)
                $('#id_reception_duration').val(data.reception.routes[0].legs[0].duration.value)

                $('#id_church_distance').val(data.church.routes[0].legs[0].distance.value)
                $('#id_church_duration').val(data.church.routes[0].legs[0].duration.value)

            })
        })

    })


})(window.django.jQuery)
