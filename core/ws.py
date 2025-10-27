import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

from .models import ChatRoom, Message

User = get_user_model()


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.group_name = f"chat_{self.room_id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        message_text = content.get("message")
        if not message_text:
            return
        user = self.scope.get("user")
        if user is None or not user.is_authenticated:
            await self.send_json({"error": "auth_required"})
            return
        room = await self.get_room(self.room_id)
        if room is None:
            await self.send_json({"error": "room_not_found"})
            return
        msg = await self.create_message(room.id, user.id, message_text)
        payload = {
            "id": msg["id"],
            "sender": msg["sender_id"],
            "content": msg["content"],
            "timestamp": msg["timestamp"],
        }
        await self.channel_layer.group_send(self.group_name, {"type": "chat.message", "message": payload})

    async def chat_message(self, event):
        await self.send_json(event["message"])

    @database_sync_to_async
    def get_room(self, room_id):
        try:
            return ChatRoom.objects.get(id=room_id)
        except ChatRoom.DoesNotExist:
            return None

    @database_sync_to_async
    def create_message(self, room_id, sender_id, content):
        msg = Message.objects.create(chat_room_id=room_id, sender_id=sender_id, content=content)
        return {"id": msg.id, "sender_id": msg.sender_id, "content": msg.content, "timestamp": msg.timestamp.isoformat()}
