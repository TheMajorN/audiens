class ChangePlaylistIdInTracks < ActiveRecord::Migration[7.1]
  def change
    change_column :tracks, :playlist_id, :integer, null: true
  end
end
