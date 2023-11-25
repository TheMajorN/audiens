class YoutubeService
  def initialize(api_key)
    @api_key = api_key
    @youtube = Google::Apis::YoutubeV3::YouTubeService.new
    @youtube.key = @api_key
  end

  def fetch_video_info(video_id)
    begin
      video = @youtube.list_videos('snippet,contentDetails', id: video_id).items.first
      return { title: video.snippet.title, duration: parse_duration(video.content_details.duration) } if video
    rescue Google::Apis::ClientError => e
      puts "Error fetching video info: #{e.message}"
    end
    nil
  end

  private

  def parse_duration(duration)
    # Convert YouTube duration format (e.g., "PT1M30S") to seconds or other desired format
    # Example logic to parse the duration
    duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/) do |match|
      hours = match[1].to_i * 3600
      minutes = match[2].to_i * 60
      seconds = match[3].to_i
      hours + minutes + seconds
    end
  end
end
