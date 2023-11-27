Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  # get "up" => "rails/health#show", as: :rails_health_check

  # Defines the root path route ("/")
  root 'tracks#index'

  resources :tracks, only: [:index, :create] do
    member do
      post 'play'
      post 'pause'
      delete 'delete', action: 'destroy', as: 'delete_track'
    end
  end
end
