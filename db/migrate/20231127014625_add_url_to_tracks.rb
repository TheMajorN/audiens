class AddUrlToTracks < ActiveRecord::Migration[7.1]
  def change
    add_column :tracks, :url, :string
  end
end
