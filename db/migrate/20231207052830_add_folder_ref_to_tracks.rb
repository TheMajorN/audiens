class AddFolderRefToTracks < ActiveRecord::Migration[7.1]
  def change
    add_reference :tracks, :folder, foreign_key: true, null: true
  end
end
