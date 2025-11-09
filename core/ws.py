import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser

from .models import ChatRoom, Message
from .serializers import MessageSerializer

User = get_user_model()


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.user = self.scope.get("user")
        
        # Check authentication
        if not self.user or isinstance(self.user, AnonymousUser) or not self.user.is_authenticated:
            await self.close(code=4001)
            return
        
        # Check if user has access to this room
        room = await self.get_room(self.room_id)
        if room is None:
            await self.close(code=4004)
            return
        
        # Verify user is part of this room
        if room.user_id != self.user.id and room.trainer_id != self.user.id:
            await self.close(code=4003)
            return
        
        self.group_name = f"chat_{self.room_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        
        # Send confirmation
        await self.send_json({
            "type": "connection",
            "status": "connected",
            "room_id": self.room_id
        })

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        user = self.scope.get("user")
        if not user or isinstance(user, AnonymousUser) or not user.is_authenticated:
            await self.send_json({"error": "auth_required"})
            return
        
        message_type = content.get("type")
        
        # Handle different message types
        if message_type == "message":
            await self.handle_message(content)
        elif message_type in ["call-offer", "call-answer", "ice-candidate", "call-end", "call-reject"]:
            await self.handle_call_signaling(message_type, content)
        elif message_type == "typing":
            await self.handle_typing()

    async def handle_message(self, content):
        message_text = content.get("message")
        if not message_text:
            return
        
        room = await self.get_room(self.room_id)
        if room is None:
            await self.send_json({"error": "room_not_found"})
            return
        
        user = self.scope.get("user")
        msg_obj = await self.create_message(room.id, user.id, message_text)
        
        # Broadcast to all users in the room
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "chat.message",
                "message": msg_obj
            }
        )

    async def handle_call_signaling(self, message_type, content):
        """Handle WebRTC call signaling messages"""
        user = self.scope.get("user")
        room = await self.get_room(self.room_id)
        if room is None:
            return
        
        # Broadcast call signaling to other users in the room
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "call.signal",
                "message_type": message_type,
                "data": content,
                "sender_id": user.id,
            }
        )

    async def handle_typing(self):
        """Handle typing indicators"""
        user = self.scope.get("user")
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "typing.indicator",
                "user_id": user.id,
                "user_name": user.get_full_name() or user.username,
            }
        )

    async def chat_message(self, event):
        """Handle incoming chat messages"""
        # Send message to all users in the room (including sender for consistency)
        message_data = event.get("message", {})
        await self.send_json({
            "type": "message",
            **message_data
        })

    async def call_signal(self, event):
        """Handle call signaling messages"""
        # Don't send back to sender
        if event["sender_id"] == self.scope["user"].id:
            return
        
        await self.send_json({
            "type": event["message_type"],
            **event["data"]
        })

    async def typing_indicator(self, event):
        """Handle typing indicators"""
        # Don't send back to sender
        if event["user_id"] == self.scope["user"].id:
            return
        
        await self.send_json({
            "type": "typing",
            "user_name": event["user_name"]
        })

    @database_sync_to_async
    def get_room(self, room_id):
        try:
            return ChatRoom.objects.select_related("user", "trainer").get(id=room_id)
        except ChatRoom.DoesNotExist:
            return None

    @database_sync_to_async
    def create_message(self, room_id, sender_id, content):
        from django.http import HttpRequest
        from rest_framework.request import Request
        
        msg = Message.objects.create(chat_room_id=room_id, sender_id=sender_id, content=content)
        
        # Create a mock request for serializer context
        # This is needed for URL generation in the serializer
        request = HttpRequest()
        request.META["SERVER_NAME"] = "localhost"
        request.META["SERVER_PORT"] = "8000"
        # Set scheme via META instead of property
        request.META["wsgi.url_scheme"] = "http"
        
        drf_request = Request(request)
        serializer = MessageSerializer(msg, context={"request": drf_request})
        return serializer.data
