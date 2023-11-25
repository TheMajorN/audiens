class TracksController < ApplicationController
  before_action :load_tracks, only: [:index]

  def index
    @track = Track.new
  end

  def create
    track_params = params.require(:track).permit(:track_url)
    source = determine_source(track_params[:track_url])

    if source
      track_info = fetch_track_info(track_params[:track_url], source)
      if track_info
        @track = Track.new(name: track_info[:name], source: source, length: track_info[:length])
        if @track.save
          redirect_to tracks_path, notice: 'Track added successfully!'
        else
          redirect_to tracks_path, alert: 'Error adding track!'
        end
      else
        redirect_to tracks_path, alert: 'Could not fetch track information!'
      end
    else
      redirect_to tracks_path, alert: 'Invalid track URL!'
    end
  end

  private

  def determine_source(track_url)
    return 'youtube' if track_url.include?('youtube.com')
    return 'spotify' if track_url.include?('spotify.com')
  end

  def fetch_track_info(track_url, source)
    # Logic to fetch track information based on the source (YouTube or Spotify)
    # Use appropriate APIs or libraries to extract track details like name, duration, etc.
    # This code depends on the APIs and how you retrieve track information
    # Here's a basic example assuming you have methods to fetch track info
    if source == 'youtube'
      track_info = fetch_youtube_track_info(track_url)
      { name: track_info[:title], length: track_info[:duration] } if track_info
    elsif source == 'spotify'
      track_info = fetch_spotify_track_info(track_url)
      { name: track_info[:name], length: track_info[:duration_ms] } if track_info
    else
      nil
    end
  end

  # Methods to fetch track info from YouTube and Spotify APIs
  # These methods depend on how you interact with the respective APIs
  def fetch_youtube_track_info(track_url)
    video_id = extract_youtube_video_id(track_url)
    return unless video_id

    youtube_service = YoutubeService.new("AIzaSyDupsfoOrg0PrAbro_hxZqdLZ2FsSYJFlU")
    youtube_service.fetch_video_info(video_id)
  end

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

  def fetch_spotify_track_info(track_url)
    # Logic to fetch track information from Spotify API based on the URL
    # Example: Using the Spotify API to fetch track details (name, duration, etc.)
    # Return track information as a hash
  end

  def play
    # Logic to play the track
  end

  def pause
    # Logic to pause the track
  end

  private

  def load_tracks
    @tracks = Track.all
  end
end
