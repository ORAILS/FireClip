import { IClipboardItemEncrypted } from "./DataTypes";

export interface CommonRes {
    message: string
}

export interface RegisterRes extends CommonRes {
    totp: TotpRes
}

export interface LoginResTotp {
    totp: TotpRes
}

export interface TotpRes {
    qr : string
    secret : string
    token : string
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