class Playlist < ApplicationRecord
  has_many :tracks, dependent: :destroy
end
