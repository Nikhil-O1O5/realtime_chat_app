import z from "zod"

const JOIN_ROOM = "JOIN_ROOM"
const SEND_MESSAGE = "SEND_MESSAGE"
const UPVOTE_MESSAGE = "UPVOTE_MESSAGE"

export enum Supported_Message_Type {
  JoinRoom = "JOIN_ROOM",
  SendMessage = "SEND_MESSAGE",
  Upvote_Message = "UPVOTE_MESSAGE"
}

const userInitMessageType = z.object({
  name : z.string().min(3).max(20),
  userId : z.string(),
  roomId : z.string()
})

export type userInitMessage = z.infer<typeof userInitMessageType>

const userMessageSendType = z.object({
  roomId : z.string(),
  message : z.string().min(1).max(250),
  userId : z.string() 
})

export type userMessageSend = z.infer<typeof userMessageSendType>

const userMessageUpvoteType = z.object({
  userId : z.string(),
  chatId : z.string(),
  roomId : z.string()
})

export type userMessageUpvote = z.infer<typeof userMessageUpvoteType>

export type IncomingMessage  = {
  type : Supported_Message_Type.JoinRoom
  payload : userInitMessage
} | {
  type : Supported_Message_Type.SendMessage
  payload : userMessageSend
} | {
  type : Supported_Message_Type.Upvote_Message
  payload : userMessageUpvote
}