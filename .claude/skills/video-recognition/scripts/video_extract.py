#!/usr/bin/env python3
"""Extract metadata, frames, and (optionally) a speech transcript from a video.

Turns a video into artifacts Claude can read natively: JPEG frames (vision) and
a timestamped transcript (text). Requires `ffmpeg`/`ffprobe` on PATH; the
--transcribe option additionally requires `faster-whisper` (pip install).

Examples:
    video_extract.py clip.mp4 --out /tmp/frames --fps 0.5
    video_extract.py clip.mp4 --out /tmp/frames --scene 0.4
    video_extract.py clip.mp4 --out /tmp/frames --start 30 --end 90 --fps 2
    video_extract.py clip.mp4 --out /tmp/frames --transcribe
"""
import argparse
import json
import os
import shutil
import subprocess
import sys


def need(tool: str) -> str:
    path = shutil.which(tool)
    if not path:
        sys.exit(
            f"error: '{tool}' not found on PATH. See the skill's Prerequisites "
            f"section for install instructions."
        )
    return path


def probe(video: str) -> dict:
    """Return basic stream/format metadata via ffprobe."""
    need("ffprobe")
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-print_format", "json",
         "-show_format", "-show_streams", video],
        capture_output=True, text=True,
    )
    if out.returncode != 0:
        sys.exit(f"ffprobe failed: {out.stderr.strip()}")
    data = json.loads(out.stdout)
    vstream = next((s for s in data.get("streams", [])
                    if s.get("codec_type") == "video"), {})
    has_audio = any(s.get("codec_type") == "audio"
                    for s in data.get("streams", []))
    fmt = data.get("format", {})
    # frame rate like "30000/1001"
    rate = vstream.get("avg_frame_rate", "0/0")
    try:
        num, den = rate.split("/")
        fps = round(float(num) / float(den), 3) if float(den) else 0.0
    except (ValueError, ZeroDivisionError):
        fps = 0.0
    return {
        "duration_sec": round(float(fmt.get("duration", 0) or 0), 2),
        "width": vstream.get("width"),
        "height": vstream.get("height"),
        "video_codec": vstream.get("codec_name"),
        "fps": fps,
        "has_audio": has_audio,
        "size_bytes": int(fmt.get("size", 0) or 0),
    }


def extract_frames(video, out_dir, fps, scene, start, end):
    need("ffmpeg")
    os.makedirs(out_dir, exist_ok=True)
    cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error"]
    if start is not None:
        cmd += ["-ss", str(start)]
    if end is not None:
        cmd += ["-to", str(end)]
    cmd += ["-i", video]

    if scene is not None:
        # Keep frames at scene changes; force_key_frames-style timestamps.
        vf = f"select='gt(scene,{scene})',showinfo"
        cmd += ["-vf", vf, "-vsync", "vfr"]
    else:
        cmd += ["-vf", f"fps={fps}"]

    pattern = os.path.join(out_dir, "frame_%04d.jpg")
    cmd += ["-qscale:v", "3", pattern]

    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        sys.exit(f"ffmpeg frame extraction failed: {res.stderr.strip()}")

    frames = sorted(f for f in os.listdir(out_dir)
                    if f.startswith("frame_") and f.endswith(".jpg"))

    # Map each frame to an approximate timestamp.
    base = start or 0
    mapping = {}
    if scene is not None:
        # Scene timestamps are not uniform; best-effort note.
        for i, f in enumerate(frames):
            mapping[f] = None  # unknown exact time for scene mode
    else:
        for i, f in enumerate(frames):
            mapping[f] = round(base + i / fps, 2)

    with open(os.path.join(out_dir, "frames.json"), "w") as fh:
        json.dump({"mode": "scene" if scene else "fps",
                   "fps": None if scene else fps,
                   "frames": mapping}, fh, indent=2)
    return frames


def transcribe(video, out_dir):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        sys.exit("error: faster-whisper not installed. Run: "
                 "pip install faster-whisper")
    need("ffmpeg")
    os.makedirs(out_dir, exist_ok=True)
    wav = os.path.join(out_dir, "audio.wav")
    res = subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", video,
         "-ac", "1", "-ar", "16000", wav],
        capture_output=True, text=True,
    )
    if res.returncode != 0:
        sys.exit(f"ffmpeg audio extraction failed: {res.stderr.strip()}")

    model = WhisperModel("base", device="cpu", compute_type="int8")
    segments, info = model.transcribe(wav, vad_filter=True)
    lines = []
    for seg in segments:
        lines.append(f"[{seg.start:7.2f} -> {seg.end:7.2f}] {seg.text.strip()}")
    text = "\n".join(lines)
    path = os.path.join(out_dir, "transcript.txt")
    with open(path, "w") as fh:
        fh.write(f"# language={info.language} prob={info.language_probability:.2f}\n")
        fh.write(text + "\n")
    return path, len(lines)


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video", help="path to the video file")
    ap.add_argument("--out", default="/tmp/vid_frames", help="output directory")
    ap.add_argument("--fps", type=float, default=0.5,
                    help="frames per second to sample (default 0.5)")
    ap.add_argument("--scene", type=float, default=None,
                    help="extract scene-change frames; threshold 0-1 (e.g. 0.4)")
    ap.add_argument("--start", type=float, default=None, help="start time (sec)")
    ap.add_argument("--end", type=float, default=None, help="end time (sec)")
    ap.add_argument("--transcribe", action="store_true",
                    help="also extract audio and transcribe speech")
    ap.add_argument("--no-frames", action="store_true",
                    help="skip frame extraction (metadata/transcribe only)")
    args = ap.parse_args()

    if not os.path.isfile(args.video):
        sys.exit(f"error: file not found: {args.video}")

    meta = probe(args.video)
    print("=== video metadata ===")
    print(json.dumps(meta, indent=2))

    if not args.no_frames:
        frames = extract_frames(args.video, args.out, args.fps,
                                args.scene, args.start, args.end)
        print(f"\n=== frames ===\nwrote {len(frames)} frames to {args.out}")
        print(f"timestamp map: {os.path.join(args.out, 'frames.json')}")
        if not frames:
            print("warning: no frames extracted (try a different --fps/--scene)")

    if args.transcribe:
        print("\n=== transcript ===")
        path, n = transcribe(args.video, args.out)
        print(f"wrote {n} segments to {path}")


if __name__ == "__main__":
    main()
