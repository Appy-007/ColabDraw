export interface RegisterDataType{
    name:string,
    email:string,
    password:string
}

export interface LoginDataType {
    name:string,
    password:string,
}

export interface CreateRoomType {
    name:string,
    roomId:string
}

export interface CheckRoomIdType {
    roomId:string
}