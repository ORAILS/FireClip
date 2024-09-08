import { DateTime } from 'luxon'
import { userPreferences } from '../App/UserPreferences'

export const ClipsEndpoints = {
    CreateUpdate: `${userPreferences.storeUrl.value}/v1/clips`,
    Delete: (hash: string) => `${userPreferences.storeUrl.value}/v1/clips/${hash}`,
    GetOne: (hash: string) => `${userPreferences.storeUrl.value}/v1/clips/${hash}`,
    GetAllSince: (time: DateTime) =>
        `${userPreferences.storeUrl.value}/v1/clips/since/${time.toUTC().toISO()}`,
    GetNBefore: (time: DateTime, limit: number) =>
        `${userPreferences.storeUrl.value}/v1/clips/before/${time.toUTC().toISO()}/limit/${limit}`,
    GetInBetween: (start: DateTime, end: DateTime) =>
        `${userPreferences.storeUrl.value}/v1/clips/between/${start.toUTC().toISO()}/${end.toUTC().toISO()}`,
    DeletAllData: () =>
        `${userPreferences.storeUrl.value}/v1/deleteMyData`,
    GetDatabaseFile: () =>
        `${userPreferences.storeUrl.value}/v1/database`
}

export const UserEndpoints = {
    Register: `${userPreferences.authUrl.value}/v1/register`,
    Login: `${userPreferences.authUrl.value}/v1/login`,
    RefreshToken: `${userPreferences.authUrl.value}/v1/refresh`,
    DeleteProfile: `${userPreferences.authUrl.value}/v1/deleteAccount`,
    Confirm2FA: `${userPreferences.authUrl.value}/v1/confirm2fa`,
}
