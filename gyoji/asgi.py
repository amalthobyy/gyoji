import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "gyoji.settings")
django.setup()

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import re_path

from core.ws import ChatConsumer
from core.middleware import JWTAuthMiddlewareStack

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddlewareStack(
        URLRouter([
            re_path(r"^ws/chat/(?P<room_id>\d+)/?$", ChatConsumer.as_asgi()),
        ])
    ),
})
