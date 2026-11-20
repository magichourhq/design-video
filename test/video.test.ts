import { expect, test } from "vitest";
import {
  VideoService,
  VideoPanel,
  type EditorHost,
  type JobStore,
  type VideoOptions,
  validateImage,
} from "../src/index.js";
const png = new Blob(
  [
    Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
      "base64"
    ),
  ],
  { type: "image/png" }
);
const mp4 = Uint8Array.from([0, 0, 0, 16, 102, 116, 121, 112, 105, 115, 111, 109]);
const options: VideoOptions = {
  prompt: "A slow camera push in",
  duration: 1,
  resolution: "480p",
  aspectRatio: "16:9",
};
function fixture(
  overrides: {
    pending?: boolean;
    saveFails?: boolean;
    downloadFails?: boolean;
  } = {}
) {
  const calls: { url: string; init: RequestInit }[] = [];
  let saved: string | null = null;
  const store: JobStore = {
    load: async () => saved,
    save: async (id) => {
      if (overrides.saveFails) throw Error("Storage unavailable");
      saved = id;
    },
  };
  const fetcher: typeof fetch = async (input, init = {}) => {
    const url = String(input);
    calls.push({ url, init });
    const headers = new Headers(init.headers);
    if (url.startsWith("https://api.magichour.ai/"))
      expect(headers.get("Authorization")).toBe("Bearer controlled-key");
    else expect(headers.has("Authorization")).toBe(false);
    if (url.endsWith("upload-urls"))
      return Response.json({
        items: [
          { upload_url: "https://storage.example/upload", file_path: "api-assets/source.png" },
        ],
      });
    if (url.endsWith("/upload")) return new Response(null, { status: 200 });
    if (init.method === "POST") {
      return Response.json({ id: "video-accepted" });
    }
    if (url.includes("/video-projects/")) {
      // The accepted ID must be persisted before polling.
      expect(saved).toBe("video-accepted");
      return Response.json({
        id: "video-accepted",
        status: overrides.pending ? "rendering" : "complete",
        credits_charged: 24,
        downloads: [
          { url: "https://storage.example/output.mp4", expires_at: "2030-01-01T00:00:00Z" },
        ],
      });
    }
    return new Response(overrides.downloadFails ? null : mp4, {
      status: overrides.downloadFails ? 403 : 200,
    });
  };
  const service = new VideoService({
    apiKey: "controlled-key",
    platform: "test",
    store,
    fetch: fetcher,
    pollIntervalMs: 1,
    timeoutMs: 1000,
  });
  return {
    calls,
    store,
    fetcher,
    service,
    get saved() {
      return saved;
    },
    set saved(id: string | null) {
      saved = id;
    },
  };
}
test("image-to-video uploads binary bytes without auth to storage, persists ID, retrieves completed MP4", async () => {
  const f = fixture();
  const result = await f.service.generate(options, { blob: png, label: "Selected" });
  expect(result.id).toBe("video-accepted");
  expect(result.credits).toBe(24);
  expect(result.blob.type).toBe("video/mp4");
  const post = f.calls.find((c) => c.url.endsWith("/image-to-video"))!;
  const body = JSON.parse(post.init.body as string);
  expect(body.model).toBe("ltx-2.5");
  expect(body.assets.image_file_path).toBe("api-assets/source.png");
  expect(body.audio).toBe(false);
  expect(body.aspect_ratio).toBe(undefined);
  expect(new Uint8Array(f.calls.find((c) => c.url.endsWith("/upload"))!.init.body as Uint8Array)).toEqual(
    new Uint8Array(await png.arrayBuffer())
  );
});
test("creative brief uses text-to-video and explicit aspect ratio without an upload", async () => {
  const f = fixture();
  await f.service.generate({ ...options, aspectRatio: "9:16" });
  expect(f.calls.some((c) => c.url.endsWith("upload-urls"))).toBe(false);
  expect(
    JSON.parse(f.calls.find((c) => c.url.endsWith("/text-to-video"))!.init.body as string)
      .aspect_ratio
  ).toBe("9:16");
});
test("failed durable storage retains the accepted project ID and stops before polling", async () => {
  const f = fixture({ saveFails: true });
  await expect(f.service.generate(options)).rejects.toMatchObject({ projectId: "video-accepted" });
  expect(f.calls.length).toBe(1);
});
test("stopping after acceptance retains ID and GET-only recovery never rebills", async () => {
  const f = fixture({ pending: true }),
    abort = new AbortController();
  const p = f.service.generate(options, undefined, abort.signal);
  setTimeout(() => abort.abort(), 10);
  await expect(p).rejects.toMatchObject({ projectId: "video-accepted" });
  const recovered = fixture();
  recovered.saved = f.saved;
  await recovered.service.retrieve(f.saved!);
  expect(recovered.calls.every((c) => !c.init.method || c.init.method === "GET")).toBe(true);
});
test("download failure keeps the accepted ID", async () => {
  const f = fixture({ downloadFails: true });
  await expect(f.service.generate(options)).rejects.toMatchObject({ projectId: "video-accepted" });
});
test("invalid image bytes and options fail before upload or paid POST", async () => {
  const f = fixture();
  await expect(f.service.generate({ ...options, duration: 0 })).rejects.toThrow();
  await expect(
    f.service.generate(options, {
      blob: new Blob(["not png"], { type: "image/png" }),
      label: "bad",
    })
  ).rejects.toThrow();
  expect(f.calls.length).toBe(0);
  await expect(validateImage(new Blob(["svg"], { type: "image/svg+xml" }))).rejects.toThrow();
});
test("panel blocks generation until saved jobs load, and while an accepted ID exists", async () => {
  const f = fixture();
  f.saved = "video-accepted";
  const host: EditorHost = {
    name: "Test",
    selectionLabel: "Test",
    store: f.store,
    insertVideo: async () => {},
  };
  const panel = new VideoPanel(host, { fetch: f.fetcher });
  await panel.generate("controlled-key", options);
  expect(f.calls.length).toBe(0);
  await panel.init();
  await panel.generate("controlled-key", options);
  expect(f.calls.length).toBe(0);
  expect(panel.state.message).toMatch(/Resume the saved project/);
});
test("panel serializes simultaneous clicks into one paid POST", async () => {
  const f = fixture();
  const panel = new VideoPanel(
    { name: "Test", selectionLabel: "Test", store: f.store, insertVideo: async () => {} },
    { fetch: f.fetcher }
  );
  await panel.init();
  await Promise.all([
    panel.generate("controlled-key", options),
    panel.generate("controlled-key", options),
  ]);
  expect(f.calls.filter((c) => c.url.endsWith("/text-to-video")).length).toBe(1);
});
test("host insertion failure leaves the result resumable without regeneration", async () => {
  const f = fixture();
  let inserts = 0;
  const panel = new VideoPanel(
    {
      name: "Test",
      selectionLabel: "Test",
      store: f.store,
      insertVideo: async () => {
        inserts++;
        throw Error("host response lost");
      },
    },
    { fetch: f.fetcher }
  );
  await panel.init();
  await panel.generate("controlled-key", options);
  const posts = f.calls.filter((c) => c.init.method === "POST").length;
  await panel.insert("controlled-key");
  expect(inserts).toBe(1);
  expect(panel.state.message).toMatch(/Check your design/);
  expect(panel.state.savedId).toBe("video-accepted");
  expect(f.calls.filter((c) => c.init.method === "POST").length).toBe(posts);
});

test("editor permission failure prevents a paid submission", async () => {
  const f = fixture();
  const panel = new VideoPanel(
    {
      name: "Test",
      selectionLabel: "Test",
      store: f.store,
      prepareGeneration: async () => {
        throw new Error("Editor is read only");
      },
      insertVideo: async () => {},
    },
    { fetch: f.fetcher }
  );
  await panel.init();
  await panel.generate("controlled-key", options);
  expect(f.calls.length).toBe(0);
  expect(panel.state.message).toMatch(/read only/);
});

test("manual resume still retrieves an existing project when local saving fails", async () => {
  const f = fixture({ saveFails: true });
  f.saved = "video-accepted";
  const panel = new VideoPanel(
    { name: "Test", selectionLabel: "Test", store: f.store, insertVideo: async () => {} },
    { fetch: f.fetcher }
  );
  await panel.init();
  await panel.resume("controlled-key", "video-accepted");
  expect(panel.state.result?.id).toBe("video-accepted");
  expect(panel.state.message).toMatch(/Copy the project ID/);
  expect(f.calls.some((c) => c.init.method === "POST")).toBe(false);
});
