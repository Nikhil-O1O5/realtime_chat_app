import { Chat, Store, UserId } from "./store";

export interface Room {
  roomId: string;
  chats: Chat[];
}

let universalChatId: any = 0;

export class InMemoryStore implements Store {
  private store: Map<string, Room>; // roomid , room

  constructor() {
    this.store = new Map<string, Room>();
  }

  initRoom(roomId: string): void {
    this.store.set(roomId, {
      roomId,
      chats: [],
    });
  }

  getChats(roomId: string, limit: number, offset: number): any {
    const room = this.store.get(roomId);
    if (!room) {
      return [];
    }
    return room.chats.reverse().slice(0, offset).slice(-1 * limit);
  }

  addChat(roomId: string, name: string, message: string, userId: UserId): any {
    const room = this.store.get(roomId);
    if (!room) {
      return [];
    }
    room.chats.push({
      chatId: (universalChatId++).toString(),
      name,
      userId,
      message,
      upvote: [],
    });
  }

  upvote(roomId: string, chatId: string, userId: UserId): any {
    const room = this.store.get(roomId);
    if (!room) {
      return [];
    }
    const chat = room.chats.find(({ chatId: id }) => id === chatId);
    if (chat) {
      chat.upvote.push(userId);
    }
  }

  getChat(roomId: string, chatId: string): Chat | null {
    const chat = this.store.get(roomId)?.chats.find(({ chatId: id }) => id === chatId);
    return chat ?? null;
  }
}
