---
name: video-recognition
description: Analyze and recognize the content of a video file — extract frames, read on-screen text and scenes with vision, transcribe speech, and summarize what happens. Use when the user gives a video (mp4, mov, mkv, webm, avi, gif) or a path/URL to one and asks what is in it, to describe it, find a moment, read text/subtitles, identify objects/people/actions, or get a transcript or summary.
---

# Video recognition

Recognize what is happening in a video and the information shown on it. The
workflow turns a video into things Claude can natively understand: **image
frames** (read with the Read tool's vision) and a **speech transcript** (text).

## When to use

- "What's in this video?" / "Describe this clip"
- "Read the text/subtitles/slides shown in the video"
- "Find the moment where X happens" / "At what timestamp does Y appear?"
- "Transcribe what's said" / "Summarize this recording"
- "Identify the objects / people / actions / scene"

## Prerequisites

The pipeline needs **ffmpeg** (frame + audio extraction). Speech transcription
additionally needs a transcriber. Check and install only what the task needs:

```bash
command -v ffmpeg && command -v ffprobe || echo "MISSING ffmpeg"
```

If ffmpeg is missing, install via the first that works:

```bash
# Debian/Ubuntu
apt-get update && apt-get install -y ffmpeg
# macOS
brew install ffmpeg
# No system package manager? Get a static binary into PATH via pip:
pip install imageio-ffmpeg && \
  ln -sf "$(python3 -c 'import imageio_ffmpeg,sys;print(imageio_ffmpeg.get_ffmpeg_exe())')" \
    /usr/local/bin/ffmpeg
```

For speech transcription, prefer `faster-whisper` (CPU-friendly):

```bash
pip install faster-whisper
```

## Workflow

Run the helper to extract metadata + frames, then read the frames.

### 1. Inspect & extract frames

```bash
python3 .claude/skills/video-recognition/scripts/video_extract.py \
  <video> --out /tmp/vid_frames --fps 0.5
```

- `--fps 0.5` = one frame every 2 seconds. Tune by length: long videos use a
  smaller fps (0.2); to find a brief moment use a larger fps (1–2).
- Use `--scene 0.4` instead of `--fps` to grab only frames at scene changes —
  efficient for slideshows, screen recordings, or cut-heavy footage.
- The script prints duration, resolution, fps and writes
  `frame_0001.jpg … frame_NNNN.jpg`, each named with its timestamp in a
  sidecar `frames.json` (frame → seconds) so you can map findings to time.

### 2. Read the frames

Read the extracted frames with the **Read** tool — it sees images directly. For
many frames, read a spread first (start/middle/end) to get the gist, then read
densely around the region that matters. Per frame, note: scene/setting, objects
and people, actions, and any **on-screen text** (titles, captions, UI, slides,
signs). Map each observation to its timestamp via `frames.json`.

No separate OCR tool is needed — Claude reads on-screen text from frames
directly. Only fall back to `tesseract` if frames are very low-resolution.

### 3. Transcribe speech (only if audio matters)

```bash
python3 .claude/skills/video-recognition/scripts/video_extract.py \
  <video> --transcribe --out /tmp/vid_frames
```

This extracts audio and runs faster-whisper, writing `transcript.txt` (with
timestamps). Read it and combine with the visual analysis. Skip this step for
silent clips, GIFs, or when only the visuals are asked about.

### 4. Synthesize

Answer the user's actual question, grounded in timestamps:

- **Describe / summarize**: a short narrative of what happens over time, plus
  key on-screen text and spoken content.
- **Find a moment**: report the timestamp(s) and what confirms it.
- **Read text**: transcribe the on-screen text, noting where each appears.
- **Identify**: name objects/people/actions/scene with the frames as evidence.

Be honest about uncertainty (motion blur, low resolution, ambiguous audio) and
say which timestamps you actually inspected.

## Tips

- Clean up large frame dirs (`rm -rf /tmp/vid_frames`) when done.
- For very long videos, do a coarse pass (low fps) to locate regions of
  interest, then a fine pass (`--start`/`--end` + higher fps) on just those.
- Vertical/social videos and screen recordings often carry the key info as
  on-screen text — prioritize reading captions and UI.
