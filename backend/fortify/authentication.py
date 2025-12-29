from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework.exceptions import AuthenticationFailed
from django.conf import settings
import logging 

logger = logging.getLogger(__name__)

class CustomAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # Try to GET the token from cookies
        cookie_name = getattr(
            settings,
            'JWT_COOKIE_ACCESS_TOKEN_NAME',
            'access_token'
        )

        # Extract token from cookie
        authentication_token = request.COOKIES.get(cookie_name)

        if authentication_token is None:
            return None  # No token found in cookies
        
        # Get validated token and user
        try:
            validated_token = self.get_validated_token(authentication_token)
            user = self.get_user(validated_token)
        
        except InvalidToken as e:
            logger.warning(f"Invalid token attempt: {str(e)}")
            raise AuthenticationFailed('Invalid or expired token') from e
        
        except Exception as e:
            logger.error(f"Authentication failed: {str(e)}")
            raise AuthenticationFailed('Authentication failed') from e
        
        if not user.is_active:
            logger.warning(f"Inactive user attempted access: {user.username}")
            raise AuthenticationFailed('User account is disabled')

        return (user, validated_token)