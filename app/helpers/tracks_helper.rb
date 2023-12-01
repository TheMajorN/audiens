module TracksHelper
  def extract_youtube_video_id(track_url)
    # Regular expressions to match different YouTube URL formats and extract video ID
    regex_patterns = [
      %r{(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)},
      %r{(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)}
      # Add more patterns if needed to cover additional URL formats
    ]

    regex_patterns.each do |pattern|
      match = track_url.match(pattern)
      return match[1] if match && match[1]
    end

    nil  # Return nil if no video ID is found
  end

  def extract_spotify_track_id(track_url)
    # Regular expression to match Spotify track URL format and extract track ID
    spotify_pattern = %r{(?:https?:\/\/)?open\.spotify\.com\/track\/([a-zA-Z0-9]+)\b}

    match = track_url.match(spotify_pattern)
    match[1] if match
  end

end
