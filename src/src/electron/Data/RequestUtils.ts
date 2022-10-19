import { NetworkSettings } from '../App/AppSettings'

const now = new Date()

export const ItemEndpoints = {
    Create: () => `${NetworkSettings.dataServerUrl}/item/`,
    GetRange: (start: number, end: number) => `${NetworkSettings.dataServerUrl}/item/range?start=${start}&end=${end}`,
    Update: () => `${NetworkSettings.dataServerUrl}/item`,
    Delete: (serverId: number) => `${NetworkSettings.dataServerUrl}/item/${serverId}`,
    GetOne: (serverId: number) => `${NetworkSettings.dataServerUrl}/item/${serverId}`,
    CreateMany: () => `${NetworkSettings.dataServerUrl}/item/bulk`,
    GetAllSince: (year = now.getFullYear(), month = now.getMonth(), day = 1, hour = 0) =>
        `${NetworkSettings.dataServerUrl}/item/since?year=${year}&month=${month}&day${day}&hour=${hour}`,
    GetAllInterval: (
        startYear = now.getFullYear(),
        startMonth = now.getMonth(),
        startDay = 1,
        endYear = now.getFullYear(),
        endMonth = now.getMonth(),
        endDay = 1
    ) =>
        `${NetworkSettings.dataServerUrl}/item/interval?startYear=${startYear}&startMonth=${startMonth}&startDay=${startDay}&endYear=${endYear}&endMonth=${endMonth}&endDay=${endDay}`,
    GetLastN: (n = 100) => `${NetworkSettings.dataServerUrl}/item/last?n=${n}`,
    GetByIdArray: () => `${NetworkSettings.dataServerUrl}/item/ids`,
    GetIdsRange: (start: number, end: number) => `${NetworkSettings.dataServerUrl}/item/ids/range?start=${start}&end=${end}`,
    GetAllSinceId: (id: number) => `${NetworkSettings.dataServerUrl}/item/all/since/${id}`,
    ServerHealth: () => `${NetworkSettings.dataServerUrl}/discovery/health`,
    Count: () => `${NetworkSettings.dataServerUrl}/item/all/count`,
    ExistIds: () => `${NetworkSettings.dataServerUrl}/item/ids/existCheck`
}

export const UserEndpoints = {
    Login: () => `${NetworkSettings.authServerUrl}/user/login`,
    Update: () => `${NetworkSettings.authServerUrl}/user`,
    DeleteProfile: () => `${NetworkSettings.authServerUrl}/user/profile`,
    Register: () => `${NetworkSettings.authServerUrl}/user/register`,
    RefreshToken: () => `${NetworkSettings.authServerUrl}/user/refresh`,
    Logout: () => `${NetworkSettings.authServerUrl}/user/logout`,
    ResendEmailConfirmation: () => `${NetworkSettings.authServerUrl}/User/email/confirm/resend`,
    ServerHealth: () => `${NetworkSettings.authServerUrl}/discovery/health`
}
