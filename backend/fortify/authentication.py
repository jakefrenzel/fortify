from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.conf import settings

class CustomAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # Try to GET the token from cookies
        cookie_name = getattr(settings, 'JWT_COOKIE_ACCESS_TOKEN_NAME', 'access_token')
        raw_token = request.COOKIES.get(cookie_name)

        if raw_token is None:
            return None  # No token found in cookies
        
        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token