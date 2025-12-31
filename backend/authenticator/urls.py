from django.urls import path
from authenticator.views import LoginView, LogoutView, RefreshTokenView

urlpatterns = [
    # Define your account-related URL patterns here
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/refresh/', RefreshTokenView.as_view(), name='refresh'),
]