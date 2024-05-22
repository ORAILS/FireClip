export type IMessages = {
  successfullyWrittenDownloadLink: string
}

const en: IMessages = {
  successfullyWrittenDownloadLink: `The link was written to the clipboard.\nPaste it in a browser and the database will download.\nRemember to keep it a secret!`,

}

export const messages = (lang: "en" | "tbd" = "en"): IMessages => {
  return en
}