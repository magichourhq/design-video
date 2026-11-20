import type { MessageCatalog, MessageDescriptor } from "@magichourhq/browser-client";

const STATUS = "Status or recovery instruction in the video generation panel.";
const PREVIEW = "Error when preparing a preview thumbnail from the generated video.";

/** IDs are stable so translations in host apps keep matching. */
export const messages = {
  invalidProjectId: {
    id: "+uQJ6m",
    defaultMessage: "Enter a valid Magic Hour video project ID.",
    description: STATUS,
  },
  invalidImageType: {
    id: "UFyz/I",
    defaultMessage: "Choose a PNG, JPEG, or WebP image up to 20 MB.",
    description: STATUS,
  },
  imageBytesMismatch: {
    id: "ZFw9zG",
    defaultMessage: "The image bytes do not match its PNG, JPEG, or WebP type.",
    description: STATUS,
  },
  invalidPrompt: {
    id: "gnSIsq",
    defaultMessage: "Describe the motion in 1–2,000 characters.",
    description: STATUS,
  },
  invalidDuration: {
    id: "ahfrIE",
    defaultMessage: "Choose a duration from 1 to 10 seconds.",
    description: STATUS,
  },
  invalidOptions: {
    id: "1t4/xC",
    defaultMessage: "Choose a supported resolution and aspect ratio.",
    description: STATUS,
  },
  videoSize: {
    id: "EPGtP7",
    defaultMessage: "Video must be nonempty and at most 100 MB.",
    description: STATUS,
  },
  notMp4: {
    id: "8dZXQJ",
    defaultMessage: "The completed output is not an MP4 video.",
    description: STATUS,
  },
  downloadFailed: {
    id: "KEe8C9",
    defaultMessage: "Could not download the completed MP4. Resume to retrieve it again.",
    description: STATUS,
  },
  initial: {
    id: "NuIs9B",
    defaultMessage: "Choose an image or start from a creative brief.",
    description: "Initial instruction for the video generation panel.",
  },
  savedAvailable: {
    id: "jV7hxv",
    defaultMessage: "A saved generation is available. Resume it without another generation charge.",
    description: STATUS,
  },
  savedUnreadable: {
    id: "0DYMZR",
    defaultMessage: "Saved generation could not be read. You can enter its project ID to resume.",
    description: STATUS,
  },
  operationFailed: {
    id: "Q62B3J",
    defaultMessage: "The operation failed. Try again after checking the editor.",
    description: STATUS,
  },
  uploadRequired: {
    id: "/WcueI",
    defaultMessage: "Upload an image to use with this editor.",
    description: STATUS,
  },
  imageCaptured: {
    id: "i3RZZK",
    defaultMessage: "Image ready. Only this captured image will be uploaded when you generate.",
    description: STATUS,
  },
  imageSelected: {
    id: "0zz6+c",
    defaultMessage: "Image ready to animate.",
    description: STATUS,
  },
  imageRemoved: {
    id: "uVs2KL",
    defaultMessage: "Start from a creative brief.",
    description: STATUS,
  },
  savedLoading: {
    id: "rh/64g",
    defaultMessage: "Wait for saved generations to load before generating.",
    description: STATUS,
  },
  savedExists: {
    id: "D6mvMT",
    defaultMessage: "Resume the saved project, or choose New generation before another paid submission.",
    description: STATUS,
  },
  generating: {
    id: "FbNnnY",
    defaultMessage: "Generating with Magic Hour. You may stop waiting and resume later.",
    description: STATUS,
  },
  videoReady: {
    id: "bnMyIi",
    defaultMessage: "Video ready · {credits} Magic Hour credits. Preview it before adding it to your design.",
    description: "Successful video generation with charged credit amount.",
  },
  resuming: {
    id: "W7B/ho",
    defaultMessage: "Retrieving the existing generation. No new generation is submitted.",
    description: STATUS,
  },
  videoRetrieved: {
    id: "liTR0y",
    defaultMessage: "Video ready · original charge {credits} Magic Hour credits.",
    description: "Existing video retrieved without a new charge.",
  },
  videoRetrievedUnsaved: {
    id: "Z7wJK/",
    defaultMessage: "Video ready · original charge {credits} Magic Hour credits. Copy the project ID; local saving is unavailable.",
    description: "Existing video retrieved, but local recovery pointer could not be saved.",
  },
  noVideo: {
    id: "AsYXLo",
    defaultMessage: "Generate or resume a video first.",
    description: STATUS,
  },
  inserting: {
    id: "752heS",
    defaultMessage: "Adding the video to your design…",
    description: STATUS,
  },
  insertionUnconfirmed: {
    id: "OBPLFQ",
    defaultMessage: "The editor could not confirm insertion. Check your design before adding again. Your generation is saved.",
    description: STATUS,
  },
  errorCode: {
    id: "ghHH/N",
    defaultMessage: "Error code: {code}.",
    description: "Safe error code reported by the host editor during video insertion.",
  },
  errorDetail: {
    id: "DmCiga",
    defaultMessage: "Details: {detail}",
    description: "A bounded, redacted explanation of a rejected editor request.",
  },
  inserted: {
    id: "QEuY5P",
    defaultMessage: "Video added to your design.",
    description: STATUS,
  },
  resetDone: {
    id: "TxnZxk",
    defaultMessage: "Ready for a new paid generation. The previous project remains in your Magic Hour account.",
    description: STATUS,
  },
  resetFailed: {
    id: "h/MZQ2",
    defaultMessage: "Could not clear the saved project. Resume it or try New generation again.",
    description: STATUS,
  },
  previewTimeout: {
    id: "N+qxdF",
    defaultMessage: "Video preview timed out. Resume and try again.",
    description: PREVIEW,
  },
  previewDecode: {
    id: "bijDEs",
    defaultMessage: "Could not decode the MP4 preview.",
    description: PREVIEW,
  },
  noDimensions: {
    id: "sVU+/P",
    defaultMessage: "Video dimensions are missing.",
    description: PREVIEW,
  },
} satisfies Record<string, MessageDescriptor & { id: string }>;

/** Message catalog for hosts that translate this package's messages, such as Canva. */
export function messageCatalog(): MessageCatalog {
  const catalog: MessageCatalog = {};
  for (const { id, defaultMessage, description } of Object.values(messages))
    catalog[id] = { defaultMessage, description };
  return catalog;
}
