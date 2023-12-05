class CreateSoundEffects < ActiveRecord::Migration[7.1]
  def change
    create_table :sound_effects do |t|
      t.string :name
      t.string :url

      t.timestamps
    end
  end
end
