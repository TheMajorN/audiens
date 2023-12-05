class DropSoundEffectsTable < ActiveRecord::Migration[7.1]
  def change
    drop_table :sound_effects
  end
end
