from django.core.management.base import BaseCommand, CommandError
from wedding.invite.models import Guest, TableGuest
from twilio.rest import Client

message_en = "Thank you all for coming it was an epic night. I'm really sorry to ask but a black and yellow umbrella was taken which holds some sentimental value it was last seen at the front door. If you've seen it can you give Sophie or Adam a call. Thanks"
message_de = "Hallo {},\n\nNur noch zwei Tage bis zum großen Fest! Wir hoffen Ihr seid bereit.\n\nWir bitten unsere Gäste, um 12.30 Uhr an der Kirche zu sein. Der Weg zur Kirche ist hier zu sehen: https://goo.gl/maps/HELSyY3nMrd25E648\n\nDanach geht es zur Feier in der Little Tey Barn um 14:30 Uhr. Der Weg ist hier zu finden https://goo.gl/maps/GnNFTqbgQsYrHQ3G6\n\n Achtet auf das weiße Schild, auf dem 'Wedding - Sophie & Adam' steht.\n\nAlle Details findet Ihr auf dieser Hochzeitseinladungs-link https://sophieadam.de{}\n\nAlles Gute.\n\nSophie & Adam"


class Command(BaseCommand):
    help = 'Send message to guest'

    def add_arguments(self, parser):

        # Named (optional) arguments
        parser.add_argument('--dryrun', action='store_true', default=False)

    def handle(self, *args, **options):
        tableGuestIds = list(
            TableGuest.objects.all().values_list('guest_id', flat=True))
        guests = Guest.invited.select_related(
            'additions').filter(pk__in=tableGuestIds)

        for guest in guests:
            account = "AC71b980d1d4c3838cccff0b03434fd10b"
            token = "59313ca950edf5306a277b6c84853642"
            if guest.additions.country == 'DE':
                message = message_de.format(guest.first_name, guest.get_absolute_url())
            elif guest.additions.country == 'UK':
                message = message_en.format(guest.first_name, guest.get_absolute_url())

                client = Client(account, token)
                if options['dryrun']:
                    print('dry run: '+message)
                else:
                    message = client.messages.create(
                        to="+{}".format(guest.mobile_number),
                        from_="Sophie Adam",
                        status_callback="https://sophieadam.co.uk/status/",
                        body=message_en)
