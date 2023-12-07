class TracksController < ApplicationController
include TracksHelper
  before_action :load_tracks, only: [:index]

  def index
    @folders = Folder.all
    @track = Track.new
  end

  def create
    if params[:track].present?
      track_params = params.require(:track).permit(:track_url, :audio_file, :sound)
      source = determine_source(track_params[:track_url])

      if source
        if track_params[:audio_file].present?
          @track = Track.new(name: track_params[:audio_file].original_filename,
                             source: 'upload',
                             audio_file: track_params[:audio_file],
                             sound: track_params[:sound])

          if @track.save
            redirect_to tracks_path, notice: 'Uploaded track added successfully!'
          else
            redirect_to tracks_path, alert: 'Error adding uploaded track!'
          end
        else
          # Handle YouTube link
          track_info = fetch_track_info(track_params[:track_url], source)
          if track_info
            @track = Track.new(name: track_info[:name],
                              source: source,
                              length: track_info[:length],
                              url: track_params[:track_url],
                              sound: track_params[:sound])
            if @track.save
              redirect_to tracks_path, notice: 'Track added successfully!'
            else
              redirect_to tracks_path, alert: 'Error adding track!'
            end
          else
            redirect_to tracks_path, alert: 'Could not fetch track information!'
          end
        end
      else
        redirect_to tracks_path, alert: 'Invalid track URL!'
      end
    else
      redirect_to tracks_path, alert: 'No track data provided!'
    end
  end


  def update
    @track = Track.find(params[:id])

    if @track.update(track_params)
      render json: { status: 'success', message: 'Track name updated successfully' }
    else
      render json: { status: 'error', message: 'Failed to update track name' }
    end
  end

  def track_params
    params.require(:track).permit(:name)
  end

  def destroy
    @track = Track.find(params[:id])
    @track.destroy
    redirect_to tracks_path
  end

  private

  def determine_source(track_url)
    return 'youtube' if track_url.include?('youtube.com/watch?v=')
    return 'spotify' if track_url.include?('spotify.com')
    return 'upload' if track_url.blank?

    'unknown'
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

  private

  def load_tracks
    @tracks = Track.all
  end
end
