import json
from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

User = get_user_model()


class JWTAuthMiddleware(BaseMiddleware):
    """
    JWT authentication middleware for Django Channels WebSocket connections.
    """

    def __init__(self, inner):
        super().__init__(inner)

    async def __call__(self, scope, receive, send):
        # Get token from query string or headers
        query_string = scope.get("query_string", b"").decode()
        query_params = parse_qs(query_string)
        token = None

        # Try to get token from query string
        if "token" in query_params:
            token = query_params["token"][0]
        else:
            # Try to get from headers
            headers = dict(scope.get("headers", []))
            auth_header = headers.get(b"authorization", b"").decode()
            if auth_header.startswith("Bearer "):
                token = auth_header[7:]

        if token:
            try:
                # Validate token and get user
                access_token = AccessToken(token)
                # Access user_id from token payload (AccessToken is dict-like)
                user_id = access_token.get("user_id")
                if user_id:
                    user = await self.get_user(user_id)
                    scope["user"] = user
                else:
                    scope["user"] = AnonymousUser()
            except (InvalidToken, TokenError, User.DoesNotExist, KeyError):
                scope["user"] = AnonymousUser()
        else:
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return AnonymousUser()


def JWTAuthMiddlewareStack(inner):
    return JWTAuthMiddleware(inner)

