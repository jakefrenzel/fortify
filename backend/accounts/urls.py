from django.urls import path
from accounts.views import CurrentUserView

urlpatterns = [
    # Define your account-related URL patterns here
    path('accounts/current/', CurrentUserView.as_view(), name='current_user'),
]