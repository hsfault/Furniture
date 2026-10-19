#!/usr/bin/env python3
"""Generate images with the Pollinations API (https://gen.pollinations.ai).

Standard library only. Reads POLLINATIONS_API_KEY from the environment or a
.env file at the repo root. Get a key at https://enter.pollinations.ai/keys.

Output paths are relative to public/ (so "images/room-1.jpg" lands in
public/images/room-1.jpg and is served at /images/room-1.jpg).

Examples:
  python3 scripts/pollinations.py "walnut wood grain macro" -o images/preloader-walnut.jpg --seed 7
  python3 scripts/pollinations.py --batch scripts/image-manifest.json --skip-existing
  python3 scripts/pollinations.py --list-models
"""
import argparse
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUT_DIR = REPO_ROOT / "public"
TIMEOUT = 180
RETRIES = 3


def load_dotenv():
    env_file = REPO_ROOT / ".env"
    if not env_file.exists():
        return
    for line in env_file.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("'\""))


def base_url():
    return os.environ.get("POLLINATIONS_BASE_URL", "https://gen.pollinations.ai").rstrip("/")


def request(url, api_key=None):
    headers = {"User-Agent": "taaq-mockup/1.0"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        return resp.read(), resp.headers.get("Content-Type", "")


class OutOfBalance(RuntimeError):
    """The account has no pollen left; every further request will fail too."""


class Unreachable(OutOfBalance):
    """A proxy or firewall refuses the host; retrying will not help."""


def free_url():
    return os.environ.get("POLLINATIONS_FREE_URL", "https://image.pollinations.ai").rstrip("/")


FREE_GAP = 8  # seconds between keyless requests; the free endpoint is rate limited
FREE_STRIP = 0.07  # extra height requested, then cut off: the free tier stamps a logo bottom-right


def trim_free_image(data, width, height):
    """Cut the watermark strip off the bottom, then centre-crop to width:height.

    Uses Pillow when it is installed; otherwise the image is saved untouched.
    """
    try:
        from io import BytesIO
        from PIL import Image
    except ImportError:
        print("  note: Pillow not installed, the free-tier watermark stays", file=sys.stderr)
        return data
    im = Image.open(BytesIO(data)).convert("RGB")
    w, h = im.size
    strip = max(36, round(h * FREE_STRIP))
    im = im.crop((0, 0, w, h - strip))
    w, h = im.size
    target = width / height
    if w / h > target:
        nw = round(h * target)
        im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
    else:
        nh = round(w / target)
        im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    buf = BytesIO()
    im.save(buf, "JPEG", quality=88, optimize=True, progressive=True)
    return buf.getvalue()
_free = {"on": False, "allowed": True, "last": 0.0}


def fetch(url, api_key, label):
    """GET an image, retrying transient failures. Raises OutOfBalance on HTTP 402."""
    for attempt in range(1, RETRIES + 1):
        try:
            data, ctype = request(url, api_key)
            if not ctype.startswith("image/"):
                raise RuntimeError(f"expected an image, got {ctype}: {data[:200]!r}")
            return data
        except urllib.error.HTTPError as e:
            body = e.read()[:300].decode(errors="replace")
            if e.code == 402:
                raise OutOfBalance(f"HTTP 402 (out of pollen) for {label!r}: {body}") from None
            if e.code == 429 and attempt < RETRIES:
                wait = 20 * attempt
                print(f"  rate limited, waiting {wait}s", file=sys.stderr)
                time.sleep(wait)
                continue
            # Auth and bad-request errors won't fix themselves on retry.
            if e.code in (400, 401, 403, 404) or attempt == RETRIES:
                raise RuntimeError(f"HTTP {e.code} for {label!r}: {body}") from None
        except (urllib.error.URLError, TimeoutError, RuntimeError) as e:
            if "Tunnel connection failed" in str(e):
                host = urllib.parse.urlsplit(url).hostname
                raise Unreachable(f"{host} is blocked by the network ({e}); "
                                  f"allow it in the environment's network settings") from None
            if attempt == RETRIES:
                raise RuntimeError(f"failed for {label!r}: {e}") from None
        wait = 2 ** attempt
        print(f"  retrying in {wait}s (attempt {attempt}/{RETRIES})", file=sys.stderr)
        time.sleep(wait)


def generate(prompt, out, width=1024, height=1024, model=None, seed=None,
             quality=None, api_key=None):
    """Paid API first; once it reports no pollen, the keyless free endpoint."""
    params = {"width": width, "height": height}
    if model:
        params["model"] = model
    if seed is not None:
        params["seed"] = seed
    if quality:
        params["quality"] = quality
    quoted = urllib.parse.quote(prompt, safe="")

    out = Path(out)
    if not out.is_absolute():
        out = DEFAULT_OUT_DIR / out
    out.parent.mkdir(parents=True, exist_ok=True)

    data = None
    if not _free["on"]:
        try:
            data = fetch(f"{base_url()}/image/{quoted}?{urllib.parse.urlencode(params)}", api_key, prompt)
        except OutOfBalance:
            if not _free["allowed"]:
                raise
            _free["on"] = True
            print(f"out of pollen; switching to the free endpoint {free_url()}", file=sys.stderr)
    if data is None:
        # Ask for a taller frame so the logo strip can be cut off afterwards.
        free_params = {"width": width, "height": round(height * (1 + FREE_STRIP) + 36), "nologo": "true"}
        if seed is not None:
            free_params["seed"] = seed
        gap = FREE_GAP - (time.time() - _free["last"])
        if gap > 0:
            time.sleep(gap)
        try:
            data = fetch(f"{free_url()}/prompt/{quoted}?{urllib.parse.urlencode(free_params)}", None, prompt)
        finally:
            _free["last"] = time.time()
        data = trim_free_image(data, width, height)

    out.write_bytes(data)
    print(f"saved {out.relative_to(REPO_ROOT) if out.is_relative_to(REPO_ROOT) else out} "
          f"({len(data) // 1024} KB)")
    return out


def run_batch(path, defaults, api_key, skip_existing=False):
    """Batch file: JSON list of {"prompt", "out", optional width/height/model/seed/quality}.

    A job whose seed fails is retried once with seed + 1000 before it counts as failed.
    """
    jobs = json.loads(Path(path).read_text())
    failures = []
    for i, job in enumerate(jobs):
        if skip_existing and (DEFAULT_OUT_DIR / job["out"]).exists():
            continue
        opts = {**defaults, **{k: v for k, v in job.items() if k not in ("prompt", "out")}}
        try:
            try:
                generate(job["prompt"], job["out"], api_key=api_key, **opts)
            except OutOfBalance:
                raise
            except RuntimeError as e:
                print(f"error: {e}; retrying with a new seed", file=sys.stderr)
                opts["seed"] = (opts.get("seed") or 0) + 1000
                generate(job["prompt"], job["out"], api_key=api_key, **opts)
        except OutOfBalance as e:
            print(f"error: {e}\nstopping: {len(jobs) - i} job(s) left", file=sys.stderr)
            failures.extend(j["out"] for j in jobs[i:])
            break
        except RuntimeError as e:
            failures.append(job["out"])
            print(f"error: {e}", file=sys.stderr)
    if failures:
        print("missing:\n  " + "\n  ".join(failures), file=sys.stderr)
    return len(failures)


def main():
    load_dotenv()
    p = argparse.ArgumentParser(description="Generate images with Pollinations.")
    p.add_argument("prompt", nargs="?", help="text prompt")
    p.add_argument("-o", "--out", help="output file, relative to public/ unless absolute")
    p.add_argument("-W", "--width", type=int, default=1024)
    p.add_argument("-H", "--height", type=int, default=1024)
    p.add_argument("-m", "--model", default=os.environ.get("POLLINATIONS_MODEL"),
                   help="model id (default: $POLLINATIONS_MODEL or the server default)")
    p.add_argument("-s", "--seed", type=int, help="seed for reproducible output")
    p.add_argument("-q", "--quality", choices=["low", "medium", "high", "hd"])
    p.add_argument("--batch", help="JSON file with a list of image jobs")
    p.add_argument("--no-free", action="store_true",
                   help="don't fall back to the keyless free endpoint when out of pollen")
    p.add_argument("--skip-existing", action="store_true",
                   help="in --batch mode, skip jobs whose output file already exists")
    p.add_argument("--list-models", action="store_true", help="print available image models")
    args = p.parse_args()

    if args.list_models:
        data, _ = request(f"{base_url()}/image/models")
        models = json.loads(data)
        for m in models:
            print(m.get("name", m) if isinstance(m, dict) else m)
        return 0

    api_key = os.environ.get("POLLINATIONS_API_KEY")
    if not api_key:
        print("note: POLLINATIONS_API_KEY is not set; this only works if a network proxy "
              "injects it. Get a key at https://enter.pollinations.ai/keys", file=sys.stderr)

    _free["allowed"] = not args.no_free
    defaults = {"width": args.width, "height": args.height, "model": args.model,
                "seed": args.seed, "quality": args.quality}

    if args.batch:
        return 1 if run_batch(args.batch, defaults, api_key, args.skip_existing) else 0

    if not args.prompt:
        p.error("a prompt is required (or use --batch / --list-models)")
    out = args.out or f"{int(time.time())}.jpg"
    try:
        generate(args.prompt, out, api_key=api_key, **defaults)
    except RuntimeError as e:  # includes OutOfBalance / Unreachable
        print(f"error: {e}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
