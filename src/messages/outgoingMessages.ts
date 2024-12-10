export enum outgoingSupportedMessages {
  AddChat = "ADD_CHAT",
  UpdateChat = "UPDATE_CHAT",
  UserLeft = "USER_LEFT" // New message type for user left event
}

interface outgoingMessage {
  message: string;
  chatId: string;
  name: string;
  roomId: string;
  upvotes: number;
}

interface userLeftMessage {
  message: string;
  roomId: string;
  name: string;
  userId: string; // Add userId here
}


export type OutgoingMessageType = 
  | {
      type: outgoingSupportedMessages.AddChat;
      payload: outgoingMessage;
    }
  | {
      type: outgoingSupportedMessages.UpdateChat;
      payload: Partial<outgoingMessage>;
    }
  | {
      type: outgoingSupportedMessages.UserLeft;  // New message type for user left event
      payload: userLeftMessage;
    };
