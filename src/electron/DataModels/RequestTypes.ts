import { IClipboardItemEncrypted } from "./DataTypes";

export interface CommonRes {
    message: string
}

export interface RefreshRes {
    access_token: string;
    type: string;
}

export interface LoginRes extends RefreshRes {
    refresh_token: string;
}


export interface BulkRes {
    clips: IClipboardItemEncrypted[]
}