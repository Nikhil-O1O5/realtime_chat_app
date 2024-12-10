// make chat interface and store class

export type UserId = string;

export interface Chat{
  chatId : string
  name : string
  userId : UserId
  message : string
  upvote : UserId[]
}

export abstract class Store {
  constructor(){

  }

  initRoom(roomId : string){

  }

  getChats(roomId : string, limit : number, offset : number){

  }

  addChat(roomId : string, name : string, message : string, userId : UserId){

  }

  upvote(roomId : string, chatId : string, userId : UserId){

  }
}