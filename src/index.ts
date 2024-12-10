import { WebSocketServer, WebSocket } from "ws";
import { UserManager } from "./class/userManager";
import { InMemoryStore } from "./class/InmemoryStore";
import {
  IncomingMessage,
  Supported_Message_Type,
} from "./messages/incomingMessages";
import {
  OutgoingMessageType,
  outgoingSupportedMessages,
} from "./messages/outgoingMessages";

const ws = new WebSocketServer({ port: 8080 });
const users = new UserManager();
const store = new InMemoryStore();

ws.on("connection", (socket: WebSocket) => {
  console.log("New connection established");

  socket.on("message", (data: string) => {
    try {
      const message: IncomingMessage = JSON.parse(data);
      handleMessage(message, socket);
    } catch (error) {
      console.error("Error processing message:", error);
    }
  });

  socket.on("close", () => {
    console.log("Connection closed");

    for (const [roomId, room] of users.getRooms()) {
      const userIndex = room.users.findIndex((u) => u.conn === socket);
      if (userIndex !== -1) {
        const removedUser = room.users[userIndex];
        users.removeUser(removedUser.userId, roomId);
        console.log(
          `User ${removedUser.name} (ID: ${removedUser.userId}) removed from room ${roomId}`
        );
  
        const outgoingPayload: OutgoingMessageType = {
          type: outgoingSupportedMessages.UserLeft,
          payload: {
            message: `${removedUser.name} has left the room.`,
            roomId: roomId,
            name: removedUser.name,
            userId: removedUser.userId,  
          },
        };
        users.broadcast(roomId, removedUser.userId, outgoingPayload);
        break; 
      }
    }
  });
  

  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

function handleMessage(message: IncomingMessage, socket: WebSocket) {
  switch (message.type) {
    case Supported_Message_Type.JoinRoom: {
      const { name, userId, roomId } = message.payload;
      store.initRoom(roomId);
      users.addUser(name, userId, roomId, socket);
      console.log(`User ${name} joined room ${roomId}`);
      break;
    }

    case Supported_Message_Type.SendMessage: {
      const { roomId, message: chatMessage, userId } = message.payload;

      const user = users.getUser(roomId, userId);
      if (!user) {
        console.log("User not found");
        return;
      }

      store.addChat(roomId, user.name, chatMessage, userId);

      const outgoingPayload: OutgoingMessageType = {
        type: outgoingSupportedMessages.AddChat,
        payload: {
          message: chatMessage,
          chatId: (store as any).lastChatId?.toString() ?? "",
          name: user.name,
          roomId,
          upvotes: 0,
        },
      };

      users.broadcast(roomId, userId, outgoingPayload);
      break;
    }

    case Supported_Message_Type.Upvote_Message: {
      const { roomId, chatId, userId } = message.payload;
      const user = users.getUser(roomId, userId);
      if (!user) {
        console.log("User not found");
        return;
      }
      const chat = store.getChat(roomId, chatId);
      if (!chat) {
        console.log("Chat not found");
        return;
      }
      store.upvote(roomId, chatId, userId);
      const outgoingPayload: OutgoingMessageType = {
        type: outgoingSupportedMessages.UpdateChat,
        payload: {
          chatId: chat.chatId,
          name: chat.name,
          message: chat.message,
          roomId,
          upvotes: chat.upvote.length,
        },
      };
      users.broadcast(roomId, userId, outgoingPayload);
      break;
    }
    default:
      console.log("Unsupported message type");
  }
}
