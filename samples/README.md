# Synthetic workshop samples

These are original training assets, not university or customer data:

- [`sample-image.jpg`](sample-image.jpg): warm orange campus illustration, 1600×1200, with visible crop markers.
- [`sample-video.mp4`](sample-video.mp4): a **different scene** — blue recording studio with a microphone and lesson screen; 20-second 1280×720 H.264/AAC clip with English synthetic speech.
- [`video-poster.jpg`](video-poster.jpg): the video's separate 16:9 studio artwork; optional preview asset, not the Images crop-lab source.
- `captions-en.vtt`: the matching four English caption cues.
- `sample-document.txt`: a small private-download example.

`npm run fixture` generates the 12 MiB multipart binary locally. Generated files are ignored by Git. Before live class, review the audio and captions together.

The image and video intentionally use different pictures. Use the JPEG for Images resizing/crop exercises and the MP4 for Stream upload/caption/playback exercises.
