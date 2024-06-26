class Track < ApplicationRecord
  has_one_attached :audio_file

  belongs_to :playlist, optional: true
  has_and_belongs_to_many :folders
end
