class FoldersController < ApplicationController
  before_action :load_folders, only: [:index]

  def index
    @folders = Folder.all
  end

  def create
    @folder = Folder.find_or_create_by(name: params[:folder][:name])

    if @folder.save
      redirect_to tracks_path, notice: 'Uploaded track added successfully!'
    else
      render json: @folder.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @folder = Folder.find(params[:id])
    @folder.destroy
    redirect_to tracks_path
    format.html { redirect_to tracks_path }
    format.js
  end

  private

  def load_folders
    @folders = Folder.all
  end
end
