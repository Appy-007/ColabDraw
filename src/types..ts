export interface RegisterDataType{
    name:string,
    email:string,
    password:string
}

export interface LoginDataType {
    email:string,
    password:string,
}

export interface CreateRoomType {
    name:string,
    roomId:string,
    rounds:number,
}

export interface JoinRoomType {
    name:string,
    roomId:string,
}

export interface CheckRoomIdType {
    roomId:string
}

export const ToolType = {
  PENCIL: "pencil",
  LINE: "line",
  RECTANGLE: "rectangle",
};

export const GameStatus = {
  IDLE: "idle",
  PLAYING: "playing",
  ROUND_END: "round_end",
  FINISHED: "finished",
};