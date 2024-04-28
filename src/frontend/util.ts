import { DateTime } from "luxon"

export const timestampToRelativeTime = (timestamp: number) =>
    DateTime.fromMillis(timestamp)
        .minus({ minute: 1 })
        .toRelative({ style: "narrow", round: true })
        .replace(" ago", "")
        .replace(" min", "m")
        .replace(" day", "d")
        .replace(" year", "y")
        .replace(" week", "w")
        .replace(" sec", "-")
        .replace("s", "")
        .replace("-", "s")
        .replace(" hr", "h")