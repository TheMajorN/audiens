class TracksController < ApplicationController
include TracksHelper
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
        @track = Track.new(name: track_info[:name], source: source, length: track_info[:length], url: track_params[:track_url])
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

  def destroy
    @track = Track.find(params[:id])
    @track.destroy
    redirect_to tracks_path
  end

  private

  def determine_source(track_url)
    return 'youtube' if track_url.include?('youtube.com')
    return 'spotify' if track_url.include?('spotify.com')
  end

  def fetch_track_info(track_url, source)
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

  def fetch_spotify_track_info(track_url)
    # Extract the track ID or URI from the Spotify URL
    track_id = track_url.split('/').last

    begin
      track = RSpotify::Track.find(track_id)
      return { name: track.name, duration_ms: track.duration_ms } if track
    rescue RestClient::NotFound, RestClient::BadRequest => e
      puts "Error fetching track info from Spotify: #{e.message}"
    end

    nil  # Return nil if track information couldn't be fetched
  end

  def play
    @track = Track.find(params[:id])
    if @track.source == 'youtube'
      youtube_service = YoutubeService.new("AIzaSyDupsfoOrg0PrAbro_hxZqdLZ2FsSYJFlU")
      @youtube_embed_code = youtube_service.play_youtube_track(@track.source_id)
      # You might use @youtube_embed_code in the view to embed a YouTube player
    elsif @track.source == 'spotify'
      spotify_service = SpotifyService.new
      spotify_service.play_spotify_track(@track.source_id)
      # Implement logic to play the track using Spotify API
    else
      # Handle other sources if needed
    end
  end

  def pause
    # Logic to pause the track
  end

  private

  def load_tracks
    @tracks = Track.all
  end
end
