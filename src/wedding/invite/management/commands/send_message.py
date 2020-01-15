from django.core.management.base import BaseCommand, CommandError
from wedding.invite.models import Guest
from twilio.rest import Client

message_en = "Dear {} {}, Sophie & Adam have the very special pleasure of inviting you to their wedding on Saturday, July 27th at 1pm, Coggeshall, Essex. Please visit https://sophieadam.co.uk{} for more information and kindly RSVP by April 1st. Best wishes, Sophie and Adam."
message_de_single = 'Liebe(r) {} {}, Wir laden Dich ganz herzlich zu unserer Hochzeit ein und würden uns sehr freuen wenn Du kommen kannst. Die Hochzeit wird am 27. Juli 2019 um 13 Uhr in Coggeshall, Essex, stattfinden. Mehr Information kann auf dieser Seite gefunden werden: https://sophieadam.de{} Bitte gib uns bis spätestens 1. April Bescheid ob Du teilnehmen kannst. Liebe Grüße, Sophie und Adam.'
message_de_plural = 'Liebe(r) {} {}, Wir laden Euch ganz herzlich zu unserer Hochzeit ein und würden uns sehr freuen wenn Ihr kommen könnt. Die Hochzeit wird am 27. Juli 2019 um 13 Uhr in Coggeshall, Essex, stattfinden. Mehr Information kann auf dieser Seite gefunden werden: https://sophieadam.de{} Bitte gebt uns bis spätestens 1. April Bescheid ob Ihr teilnehmen könnt. Liebe Grüße, Sophie und Adam.'


class Command(BaseCommand):
    help = 'Send message to guest'

    def handle(self, *args, **options):
        guests = Guest.invited.select_related(
            'additions').exclude(message_status='delivered').exclude(message_status='sent')
        for guest in guests:
            account = "AC71b980d1d4c3838cccff0b03434fd10b"
            token = "59313ca950edf5306a277b6c84853642"
            if guest.additions.country == 'DE':
                if guest.additions.guest_set.count() > 1:
                    message = message_de_plural.format(guest.first_name,
                                                       guest.last_name, guest.get_absolute_url())
                else:
                    message = message_de_single.format(guest.first_name,
                                                       guest.last_name, guest.get_absolute_url())
            elif guest.additions.country == 'UK':
                message = message_en.format(guest.first_name,
                                            guest.last_name, guest.get_absolute_url())

            client = Client(account, token)
            message = client.messages.create(
                to="+{}".format(guest.mobile_number),
                from_="Sophie Adam",
                status_callback="https://sophieadam.co.uk/status/",
                body=message)
