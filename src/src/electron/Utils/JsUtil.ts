import { IClipboardItem } from '../DataModels/DataTypes'

function waitforme(milisec: number) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('')
        }, milisec)
    })
}
const printPart = (value: object) => {
    console.log(`\n${JSON.stringify(value, null, 2)}`)
}

function sortItemsByDate(a: IClipboardItem, b: IClipboardItem, ascending = false): number {
    if (ascending) new Date(a.lastModified).getTime() - new Date(b.lastModified).getTime()
    return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
}

function diff(num1: number, num2: number) {
    if (num1 > num2) {
        return num1 - num2
    } else {
        return num2 - num1
    }
}
export const JsUtil = {
    waitforme,
    printPart,
    sortItemsByDate,
    diff
}
