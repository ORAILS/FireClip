import { DateTime } from 'luxon'
import { userPreferences } from '../App/UserPreferences'

export const ClipsEndpoints = {
    CreateUpdate: `${userPreferences.storeUrl.value}/v1/clips`,
    Delete: (hash: string) => `${userPreferences.storeUrl.value}/v1/clips/${hash}`,
    GetOne: (hash: string) => `${userPreferences.storeUrl.value}/v1/clips/${hash}`,
    GetAllSince: (time: DateTime) =>
        `${userPreferences.storeUrl.value}/v1/clips/since/${time.toUTC().toISO()}`
}

export const UserEndpoints = {
    Register: `${userPreferences.authUrl.value}/v1/register`,
    Login: `${userPreferences.authUrl.value}/v1/login`,
    RefreshToken: `${userPreferences.authUrl.value}/v1/refresh`,
    DeleteProfile: `${userPreferences.authUrl.value}/v1/deleteAccount`,
}
