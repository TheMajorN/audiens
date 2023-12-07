class FoldersController < ApplicationController
  before_action :load_folders, only: [:index]

  def index
    @folders = Folder.all
  end

  def create
    @folder = Folder.find_or_create_by(name: params[:folder][:name])

    if @folder.save
      render json: @folder, status: :created
    else
      render json: @folder.errors, status: :unprocessable_entity
    end
  end

  private

  def load_folders
    @folders = Folder.all
  end
end
