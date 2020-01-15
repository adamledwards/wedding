"""wedding URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.views.generic import View, TemplateView
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from .invite.views import InvitesView, ResponseSubmit, NotFound, StatusSubmit, Count, Tables, csv_export_confirmed, EveningView

urlpatterns = [
    path('', NotFound.as_view()),
    path('admin/', admin.site.urls),
    path('status/', StatusSubmit.as_view(), name='status'),
    path('count/', Count.as_view(), name='count'),
    path('tables/export', csv_export_confirmed, name='export_name_card'),
    path('tables/', Tables.as_view(), name='tables'),
    path('evening/', EveningView.as_view(template_name="evening.html"), name='evening'),
    path('<slug>/', InvitesView.as_view(), name='guest'),
    path('<slug>/hotel/<hotel>/', InvitesView.as_view(), name='hotel'),
    path('<slug>/response/', ResponseSubmit.as_view(), name='response'),

]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns = static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + \
        static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) + \
        [
            path('__debug__/', include(debug_toolbar.urls)),
    ] + urlpatterns

handler404 = NotFound.as_view()
