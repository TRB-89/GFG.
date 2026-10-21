import os
import re
import urllib.parse
import httpx
from typing import Optional, Dict, Any, List
from backend.app.config.settings import settings

# In-memory cache to avoid burning YouTube API quota on repeated requests
_VIDEO_CACHE: Dict[str, Dict[str, Any]] = {}

def parse_iso8601_duration(duration_str: str) -> int:
    """
    Parses ISO 8601 duration format (e.g. PT15M33S, PT1H2M10S, PT45S) into total seconds.
    """
    if not duration_str:
        return 0
    pattern = re.compile(r'P(?:T(?:(?P<hours>\d+)H)?(?:(?P<minutes>\d+)M)?(?:(?P<seconds>\d+)S)?)')
    match = pattern.match(duration_str)
    if not match:
        return 0
    hours = int(match.group('hours') or 0)
    minutes = int(match.group('minutes') or 0)
    seconds = int(match.group('seconds') or 0)
    return hours * 3600 + minutes * 60 + seconds

def format_duration(seconds: int) -> str:
    """Formats seconds into MM:SS or HH:MM:SS."""
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    if hours > 0:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    return f"{minutes}:{secs:02d}"

def extract_video_id(url_or_id: str) -> Optional[str]:
    """Extracts the 11-character YouTube video ID from various URL formats or raw ID."""
    if not url_or_id:
        return None
    url_or_id = url_or_id.strip()
    if re.match(r'^[a-zA-Z0-9_-]{11}$', url_or_id):
        return url_or_id
    patterns = [
        r'(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/|v\/|.+\?v=)([^"&?\/\s]{11})',
        r'(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^"&?\/\s]{11})'
    ]
    for pattern in patterns:
        match = re.search(pattern, url_or_id)
        if match:
            return match.group(1)
    return None

class YouTubeService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.YOUTUBE_API_KEY

    async def get_video_details(self, video_url_or_id: str) -> Dict[str, Any]:
        """
        Fetches metadata for a YouTube video using the YouTube Data API v3.
        """
        video_id = extract_video_id(video_url_or_id)
        if not video_id:
            return {"error": "Invalid YouTube URL or ID"}

        # Check cache
        if video_id in _VIDEO_CACHE:
            return _VIDEO_CACHE[video_id]

        if not self.api_key:
            # Return baseline fallback without API key
            fallback_data = {
                "video_id": video_id,
                "embed_url": f"https://www.youtube.com/embed/{video_id}?enablejsapi=1&playsinline=1",
                "watch_url": f"https://www.youtube.com/watch?v={video_id}",
                "title": f"Instructional Video ({video_id})",
                "channel_title": "GFG Learning Academy",
                "duration_formatted": "15:00",
                "duration_seconds": 900,
                "thumbnail_url": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
                "source": "fallback"
            }
            return fallback_data

        url = "https://www.googleapis.com/youtube/v3/videos"
        params = {
            "part": "snippet,contentDetails,statistics",
            "id": video_id,
            "key": self.api_key
        }

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(url, params=params)
                if res.status_code == 200:
                    data = res.json()
                    items = data.get("items", [])
                    if items:
                        item = items[0]
                        snippet = item.get("snippet", {})
                        content_details = item.get("contentDetails", {})
                        statistics = item.get("statistics", {})

                        duration_iso = content_details.get("duration", "PT0S")
                        duration_sec = parse_iso8601_duration(duration_iso)

                        thumbnails = snippet.get("thumbnails", {})
                        thumb = (
                            thumbnails.get("maxres")
                            or thumbnails.get("standard")
                            or thumbnails.get("high")
                            or thumbnails.get("medium")
                            or thumbnails.get("default")
                            or {}
                        ).get("url", f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg")

                        result = {
                            "video_id": video_id,
                            "embed_url": f"https://www.youtube.com/embed/{video_id}?enablejsapi=1&playsinline=1",
                            "watch_url": f"https://www.youtube.com/watch?v={video_id}",
                            "title": snippet.get("title", f"Video Lesson ({video_id})"),
                            "description": snippet.get("description", "")[:400],
                            "channel_title": snippet.get("channelTitle", "YouTube Creator"),
                            "published_at": snippet.get("publishedAt"),
                            "duration_seconds": duration_sec,
                            "duration_formatted": format_duration(duration_sec),
                            "view_count": int(statistics.get("viewCount", 0)),
                            "thumbnail_url": thumb,
                            "source": "youtube_data_v3"
                        }
                        _VIDEO_CACHE[video_id] = result
                        return result

            # If not found or error, return fallback
            fallback_data = {
                "video_id": video_id,
                "embed_url": f"https://www.youtube.com/embed/{video_id}?enablejsapi=1&playsinline=1",
                "watch_url": f"https://www.youtube.com/watch?v={video_id}",
                "title": f"Instructional Video ({video_id})",
                "channel_title": "GFG Learning Academy",
                "duration_formatted": "15:00",
                "duration_seconds": 900,
                "thumbnail_url": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
                "source": "fallback"
            }
            return fallback_data
        except Exception as e:
            return {
                "video_id": video_id,
                "embed_url": f"https://www.youtube.com/embed/{video_id}?enablejsapi=1&playsinline=1",
                "watch_url": f"https://www.youtube.com/watch?v={video_id}",
                "title": f"Instructional Video ({video_id})",
                "channel_title": "GFG Learning Academy",
                "duration_formatted": "15:00",
                "duration_seconds": 900,
                "thumbnail_url": f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
                "source": "fallback_error",
                "error_details": str(e)
            }

    async def search_videos(self, query: str, max_results: int = 5) -> List[Dict[str, Any]]:
        """
        Searches YouTube Data API v3 for embeddable educational videos matching a topic.
        """
        if not self.api_key:
            return []

        url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            "part": "snippet",
            "type": "video",
            "videoEmbeddable": "true",
            "q": query,
            "maxResults": min(max_results, 10),
            "key": self.api_key
        }

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get(url, params=params)
                if res.status_code == 200:
                    data = res.json()
                    results = []
                    for item in data.get("items", []):
                        vid_id = item.get("id", {}).get("videoId")
                        if not vid_id:
                            continue
                        snippet = item.get("snippet", {})
                        thumbs = snippet.get("thumbnails", {})
                        thumb = (thumbs.get("high") or thumbs.get("medium") or thumbs.get("default") or {}).get("url")
                        results.append({
                            "video_id": vid_id,
                            "title": snippet.get("title"),
                            "description": snippet.get("description", "")[:250],
                            "channel_title": snippet.get("channelTitle"),
                            "thumbnail_url": thumb,
                            "embed_url": f"https://www.youtube.com/embed/{vid_id}?enablejsapi=1&playsinline=1"
                        })
                    return results
            return []
        except Exception:
            return []

youtube_service = YouTubeService()
