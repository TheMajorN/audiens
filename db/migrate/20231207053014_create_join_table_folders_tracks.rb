class CreateJoinTableFoldersTracks < ActiveRecord::Migration[7.1]
  def change
    create_join_table :folders, :tracks do |t|
      # t.index [:folder_id, :track_id]
      # t.index [:track_id, :folder_id]
    end
  end
end
