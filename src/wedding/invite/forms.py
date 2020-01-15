from django.forms import ModelForm, widgets
from django import forms
from .models import Response
from django.utils.translation import gettext_lazy as _
from django.core.validators import RegexValidator
from .utils import phone_normalise


class ResponseNullBooleanSelect(widgets.NullBooleanSelect):
    def __init__(self):
        choices = (
            ('1', _('Response')),
            ('2', _('Will Attend')),
            ('3', _('Will Not Attend')),
        )
        super(widgets.NullBooleanSelect, self).__init__(None, choices)


class ResponseForm(ModelForm):

    def get_response_fields(self):
        for field_name in self.fields:
            if 'response' == field_name:
                yield self[field_name]

    def get_message_fields(self):
        for field_name in self.fields:
            if 'message' == field_name:
                yield self[field_name]

    class Meta:
        model = Response
        fields = ['response', 'message', 'guest']
        widgets = {
            'response': ResponseNullBooleanSelect(),
            'message': widgets.Textarea(attrs={'placeholder': _('Optional message to Sophie & Adam')}),
        }


class PhoneForm(forms.Form):

    phone = forms.CharField(
        label='phone',
        max_length=14,
        widget=forms.TextInput(attrs={'type': 'tel', 'class': 'phone'}),
        validators=[RegexValidator(
            r'^[0-9]+$', _('Enter a valid phone number.'))],
    )

    def clean(self):
        cleaned_data = super().clean()
        phone = cleaned_data.get('phone')
        if phone:
            try:
                phone_country = phone_normalise(phone)
                cleaned_data['phone'] = phone_country
                if phone_country is None:
                    self.add_error('phone', forms.ValidationError(
                        _('Enter a valid phone number.')))
            except:
                self.add_error('phone', forms.ValidationError(
                    _('Enter a valid phone number.')))

        return cleaned_data
