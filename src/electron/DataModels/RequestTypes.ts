import { IClipboardItemEncrypted } from "./DataTypes";

export interface CommonRes {
    message: string
}


export interface LoginRes {
    access_token:  string;
    refresh_token: string;
    type:          string;
}


export interface SinceRes {
    clips: IClipboardItemEncrypted[]
}