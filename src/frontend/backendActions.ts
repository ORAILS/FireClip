import { events, eventsToBackend } from "./events"

export function sendShortcuts(serialized: string) {
    events.notify(eventsToBackend.setShortcuts, serialized)
}
