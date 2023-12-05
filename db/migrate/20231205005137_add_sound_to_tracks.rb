class AddSoundToTracks < ActiveRecord::Migration[7.1]
  def change
    add_column :tracks, :sound, :boolean, default: false
  end
end
