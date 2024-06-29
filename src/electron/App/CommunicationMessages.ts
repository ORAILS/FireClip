export type IMessages = {
  downloadLinkWritten: {
    ok: string
  },
  accountAndDataDeleted: {
    ok: string
    fail: string
  },
  dataDeleted: {
    ok: string
    fail: string
  },
  generic: {
    ok: string,
    fail: string
  }
}

const en: IMessages = {
  downloadLinkWritten: {
    ok: `The link was written to the clipboard.\nPaste it in a browser and the database will download.\nRemember to keep it a secret!`
  },
  accountAndDataDeleted: {
    ok: "Account and your data were successfully deleted",
    fail: "Failed to delete your account and/or data"
  },
  dataDeleted: {
    ok: "Failed to delete your data",
    fail: "Data successfully deleted"
  },
  generic: {
    ok: "Operation successfully completed",
    fail: "Operation failed"
  }
}

export const messages = (lang: "en" | "tbd" = "en"): IMessages => {
  return en
}