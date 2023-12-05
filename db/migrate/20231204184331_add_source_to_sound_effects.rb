class AddSourceToSoundEffects < ActiveRecord::Migration[7.1]
  def change
    add_column :sound_effects, :source, :string
  end
end
