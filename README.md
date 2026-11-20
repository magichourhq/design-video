# Magic Hour Editor Kit

[![npm](https://img.shields.io/npm/v/@magichourhq/editor-kit)](https://www.npmjs.com/package/@magichourhq/editor-kit)

The video generation flow shared by Magic Hour's design editor apps for Framer, Adobe Express and Canva. A person picks an image or writes a brief, the app generates a short video with the [Magic Hour API](https://docs.magichour.ai), and the editor host inserts it into the design. It is built on [`@magichourhq/browser-client`](https://github.com/magichourhq/browser-client).

```sh
npm install @magichourhq/editor-kit
```

> [!WARNING]
> The API key is the key of the person using the app, which they enter themselves. Anyone using the page can read it. Never ship a shared key.

The accepted project ID is saved before the app waits, so a generation that was interrupted can be resumed without paying again.

## Entry points

`@magichourhq/editor-kit` has the logic and no CSS or DOM rendering: `VideoPanel`, `VideoService`, `EditorHost`, `EditorInsertionError`, `validateImage`, `projectId`, `videoMetadata`, `videoPoster` and `messageCatalog`.

`@magichourhq/editor-kit/panel` has `mountPanel(host, requireGenerationConsent = false)`. It renders a plain-HTML panel into `#root` and imports `style.css`, so your bundler (Vite, esbuild) includes the styles in its output.

An app describes its editor with an `EditorHost`:

```ts
import type { EditorHost } from "@magichourhq/editor-kit";
import { mountPanel } from "@magichourhq/editor-kit/panel";

const host: EditorHost = {
  name: "Framer", // Used in the project name, "Magic Hour for Framer"
  selectionLabel: "Use selected image",
  // Optional. Returns the image selected in the editor.
  captureImage: async () => ({ blob, label: "Selected image" }),
  // Optional. Throws if the editor can't accept a video, before anything is paid for.
  prepareGeneration: async () => {},
  // Keeps the accepted project ID, for example in the editor's plugin data.
  store: {
    load: async () => localStorage.getItem("project"),
    save: async (id) => (id ? localStorage.setItem("project", id) : localStorage.removeItem("project")),
  },
  // Adds the finished MP4 to the design. Throw an EditorInsertionError to show a code.
  insertVideo: async ({ blob, url, id, credits, expiresAt }) => {},
};

mountPanel(host);
```

## Custom UI

`VideoPanel` holds the state without any UI framework. Subscribe to it from your own components, for example with React's `useSyncExternalStore`:

```ts
import { VideoPanel } from "@magichourhq/editor-kit";

const panel = new VideoPanel(host);
void panel.init(); // Loads a saved project ID from host.store
const state = useSyncExternalStore(panel.subscribe, panel.snapshot);

await panel.generate(apiKey, { prompt, duration: 5, resolution: "720p", aspectRatio: "16:9" });
await panel.insert(apiKey);
```

The state has `ready`, `busy`, `message`, `error`, `savedId`, `source` and `result`. Other methods are `capture()`, `selectFile(file)`, `removeImage()`, `resume(apiKey, projectId)`, `stop()`, `reset()` and `dispose()`.

## Translations

Every message has a fixed `id`. Pass `formatMessage` in the second argument of `VideoPanel` to translate them, and add `messageCatalog()` to your source-language file so your translators get the strings. Errors from the API come from `@magichourhq/browser-client`, which has its own `messageCatalog()`.

```ts
import { messageCatalog } from "@magichourhq/editor-kit";
import { messageCatalog as clientCatalog } from "@magichourhq/browser-client";

const messagesEn = { ...clientCatalog(), ...messageCatalog() };
```
