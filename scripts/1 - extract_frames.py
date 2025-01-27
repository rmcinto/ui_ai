import os
import cv2
import json
import numpy as np

# Adjustable parameters
THRESHOLD = 100000  # (Unused in this version, but kept for reference)
SENSITIVITY = 0.00002  # If the mean difference is below this, frames are considered "the same"
VIDEO_DIR = os.path.join("data", "raw", "videos")
OUTPUT_DIR = os.path.join("data", "frames")

FRAME_PREFIX = "frame"  # Prefix for saved frames
EXT_FRAMES = ".png"     # Extension for saved frame images
EXT_META = ".json"


def get_output_folder(video_path: str) -> str:
    """
    Given a full 'video_path' somewhere inside VIDEO_DIR,
    return a corresponding output folder path under OUTPUT_DIR
    that preserves the relative directory structure.

    Example:
      If VIDEO_DIR = data/raw/videos
      and video_path = data/raw/videos/subfolder1/subfolder2/video.mp4
      then the relative path = 'subfolder1/subfolder2/video.mp4'
      so the output folder (minus extension) would be:
      data/processed/subfolder1/subfolder2/video
    """
    # Compute the relative path from VIDEO_DIR
    relative_path = os.path.relpath(video_path, VIDEO_DIR)
    # Strip off the extension (.mp4, .mov, etc.)
    base_name, _ = os.path.splitext(relative_path)
    # Join with OUTPUT_DIR to create the final folder
    out_folder = os.path.join(OUTPUT_DIR, base_name)
    return out_folder


def is_video_processed(video_path: str) -> bool:
    """
    Checks if there's already a corresponding folder in OUTPUT_DIR
    that matches the full relative path (minus extension) of this video.
    """
    out_folder = get_output_folder(video_path)
    return os.path.exists(out_folder)


def save_segment(
    color_img,
    diff_img,
    t_first,
    t_last,
    idx_first,
    idx_last,
    out_folder,
    distinct_count,
    width,
    height,
    mean_diff
):
    """
    Immediately saves the old (distinct) frame segment as a PNG plus a JSON file
    containing metadata. Returns nothing; used for "save on the fly."
    """
    # Filenames for image + JSON
    frame_filename = f"{FRAME_PREFIX}_{distinct_count:05d}{EXT_FRAMES}"
    diff_filename = f"{FRAME_PREFIX}_{distinct_count:05d}_diff{EXT_FRAMES}"
    json_filename = f"{FRAME_PREFIX}_{distinct_count:05d}{EXT_META}"

    # Save color PNG (the representative distinct frame)
    out_png_path = os.path.join(out_folder, frame_filename)
    cv2.imwrite(out_png_path, color_img)

    # Save the masked-diff PNG (highlight changes from the previous distinct frame)
    out_diff_path = os.path.join(out_folder, diff_filename)
    cv2.imwrite(out_diff_path, diff_img)

    # Create JSON metadata
    metadata = {
        "name": frame_filename,
        "width": width,
        "height": height,
        "duration": round(t_last - t_first, 3),
        "start_frame_idx": idx_first,
        "end_frame_idx": idx_last,
        "start_frame_sec": round(t_first, 3),
        "end_frame_sec": round(t_last, 3),
        "mean_diff": mean_diff
    }
    out_json_path = os.path.join(out_folder, json_filename)
    with open(out_json_path, "w", encoding="utf-8") as jf:
        json.dump(metadata, jf, indent=2)


def process_video(video_path):
    """
    Extracts distinct frames from the given video file in color.
    Uses color-frame comparisons (with masking) to detect whether frames are effectively the same.
    Immediately saves each old segment as soon as a new distinct one is found.
    """
    video_name = os.path.basename(video_path)
    out_folder = get_output_folder(video_path)

    # Create output folder (including any missing subfolders)
    os.makedirs(out_folder, exist_ok=True)

    # Open the video
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error: Could not open video {video_path}")
        return

    fps = cap.get(cv2.CAP_PROP_FPS)
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = frame_count / fps if fps > 0 else 0.0

    print(f"Processing '{video_name}'...")
    print(f" - Resolution: {width}x{height}, FPS: {fps}, "
          f"Total frames: {frame_count}, Duration: {duration:.2f} sec")

    frame_idx = 0
    distinct_count = 0  # How many distinct segments we've saved so far

    # Track the "current distinct segment" (old frame) until we find a new one
    prev_gray_frame = None  # Grayscale version of the last distinct frame
    prev_color_frame = None # Color version of the last distinct frame
    first_seen_sec = 0.0
    last_seen_sec = 0.0
    first_frame_idx = 0
    last_frame_idx = 0

    mean_diff = 0.0  # Just for final save usage

    while True:
        ret, color_frame = cap.read()
        if not ret:
            # Reached end of video or read error
            break

        current_time_sec = frame_idx / fps if fps > 0 else 0.0

        # Convert to grayscale (for measuring how different it is)
        gray = cv2.cvtColor(color_frame, cv2.COLOR_BGR2GRAY)

        if prev_gray_frame is None:
            # First frame in the video is automatically considered distinct
            prev_gray_frame = gray
            prev_color_frame = color_frame
            first_seen_sec = current_time_sec
            last_seen_sec = current_time_sec
            first_frame_idx = frame_idx
            last_frame_idx = frame_idx
        else:
            # Compare current color frame to the last distinct color frame
            diff = cv2.absdiff(prev_color_frame, color_frame)

            # Create a grayscale version of this diff to measure overall difference
            diff_gray = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
            mean_diff = np.mean(diff_gray) / 255.0

            # Build a binary mask so that we only keep changed pixels in color
            _, mask = cv2.threshold(diff_gray, 25, 255, cv2.THRESH_BINARY)
            masked_diff = cv2.bitwise_and(color_frame, color_frame, mask=mask)

            if mean_diff < SENSITIVITY:
                # This frame is effectively the same as the last distinct frame
                last_seen_sec = current_time_sec
                last_frame_idx = frame_idx
            else:
                print(f" - Distinct change at frame {frame_idx}, mean diff: {mean_diff:.6f}")

                # Finalize/save the old distinct frame segment
                save_segment(
                    prev_color_frame,
                    masked_diff,       # Show changes from old -> current
                    first_seen_sec,
                    last_seen_sec,
                    first_frame_idx,
                    last_frame_idx,
                    out_folder,
                    distinct_count,
                    width,
                    height,
                    mean_diff
                )
                distinct_count += 1

                # Now this new frame becomes the "current distinct segment"
                prev_gray_frame = gray
                prev_color_frame = color_frame
                first_seen_sec = current_time_sec
                last_seen_sec = current_time_sec
                first_frame_idx = frame_idx
                last_frame_idx = frame_idx

        frame_idx += 1

    # After exiting the loop, we may have one last segment to save
    if prev_color_frame is not None:
        # No new frame to compare to, so we provide a zeroed diff image
        zero_diff = np.zeros_like(prev_color_frame)
        save_segment(
            prev_color_frame,
            zero_diff,
            first_seen_sec,
            last_seen_sec,
            first_frame_idx,
            last_frame_idx,
            out_folder,
            distinct_count,
            width,
            height,
            mean_diff
        )
        distinct_count += 1

    cap.release()
    print(f" - Saved {distinct_count} distinct frames (color) to '{out_folder}'")


def main():
    # Ensure data/raw/videos directory exists
    if not os.path.exists(VIDEO_DIR):
        print(f"No directory found at '{VIDEO_DIR}'. Nothing to process.")
        return

    valid_exts = (".mp4", ".mov", ".avi", ".mkv")

    # Recursively find all video files in data/raw/videos
    video_paths = []
    for root, dirs, files in os.walk(VIDEO_DIR):
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in valid_exts:
                full_path = os.path.join(root, f)
                video_paths.append(full_path)

    if not video_paths:
        print(f"No videos found in '{VIDEO_DIR}' (recursive search).")
        return

    for video_path in video_paths:
        if is_video_processed(video_path):
            # If a folder already exists for this relative path, skip it
            print(f"Video '{video_path}' is already processed. Skipping.")
        else:
            process_video(video_path)


if __name__ == "__main__":
    main()