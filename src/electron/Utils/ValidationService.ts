function IsValidClipboardText(text: string) {
    if (text.length < 1) return false
    if (text === '\b') return false
    if (text === '\f') return false
    if (text === '\n') return false
    if (text === '\r') return false
    if (text === '\t') return false
    if (text === '\v') return false
    if (text === '\r\n') return false
    if (text === '') return false
    if (text === ' ') return false
    return true
}

export const Validator = {
    IsValidClipboardText
}
