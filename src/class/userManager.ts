import WebSocket from "ws";
import { OutgoingMessageType, outgoingSupportedMessages } from "../messages/outgoingMessages";

interface User {
  name: string;
  userId: string;
  conn: WebSocket;
}

interface Room {
  users: User[];
}

export class UserManager {
  private room: Map<string, Room>;

  constructor() {
    this.room = new Map<string, Room>();
  }

  addUser(name: string, userId: string, roomId: string, socket: WebSocket) {
    if (!this.room.get(roomId)) {
      this.room.set(roomId, {
        users: [],
      });
    }
    this.room.get(roomId)?.users.push({
      name,
      userId,
      conn: socket,
    });
  }

  removeUser(userId: string, roomId: string) {
    const room = this.room.get(roomId);
    if (!room) {
      return;
    }
    const user = room.users.find((user) => user.userId === userId);
    if (!user) {
      return;
    }

    // Notify other users that this user has left
    this.userLeft(roomId, user.name);

    // Remove the user from the room
    room.users = room.users.filter((user) => user.userId !== userId);

    // If the room is empty, delete the room
    if (room.users.length === 0) {
      this.room.delete(roomId);
    }
  }

  getUser(roomId: string, userId: string): User | null {
    const user = this.room.get(roomId)?.users.find((user) => user.userId === userId);
    return user ?? null;
  }

  broadcast(roomId: string, userId: string, message: OutgoingMessageType): void {
    const room = this.room.get(roomId);
    if (!room) {
      console.log("Room not found!");
      return;
    }

    room.users.forEach((user) => {
      if (user.userId !== userId) {
        user.conn.send(JSON.stringify(message));
      }
    });
  }

  userLeft(roomId: string, name: string): void {
    const room = this.room.get(roomId);
    if (!room) {
      console.log("Room not found!");
      return;
    }

    const message: OutgoingMessageType = {
      type: outgoingSupportedMessages.UpdateChat,
      payload: {
        message: `${name} has left the room.`,
        roomId: roomId,
        name: name,
      },
    };

    // Notify all users in the room
    room.users.forEach((user) => {
      user.conn.send(JSON.stringify(message));
    });
  }
  
  getRooms(): Map<string, Room> {
    return this.room;
  }

  getRoomIds(): string[] {
    return Array.from(this.room.keys());
  }
}
