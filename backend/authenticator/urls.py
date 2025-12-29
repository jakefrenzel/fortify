from django.urls import path
from authenticator.views import LoginView, LogoutView, RefreshView

urlpatterns = [
    # Define your account-related URL patterns here
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', RefreshView.as_view(), name='refresh'),
]