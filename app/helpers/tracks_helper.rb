module TracksHelper
  def extract_youtube_video_id(track_url)
    regex_patterns = [
      %r{(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)},
      %r{(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)}
    ]

    regex_patterns.each do |pattern|
      match = track_url.match(pattern)
      return match[1] if match && match[1]
    end

    nil
  end

  def extract_spotify_track_id(track_url)
    spotify_pattern = %r{(?:https?:\/\/)?open\.spotify\.com\/track\/([a-zA-Z0-9]+)\b}

    match = track_url.match(spotify_pattern)
    match[1] if match
  end
end
