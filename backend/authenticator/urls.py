from django.urls import path
from authenticator.views import LoginView, LogoutView, RefreshTokenView, csrf_token_view

urlpatterns = [
    # Define your account-related URL patterns here
    path('csrf/', csrf_token_view, name='csrf'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', RefreshTokenView.as_view(), name='refresh'),
]