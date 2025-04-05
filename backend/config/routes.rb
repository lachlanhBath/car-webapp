Rails.application.routes.draw do
  draw :madmin
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/*
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest

  # API routes
  namespace :api do
    namespace :v1 do
      # Listings
      resources :listings, only: [:index, :show]
      
      # Vehicles
      resources :vehicles, only: [:show] do
        resources :mot_histories, only: [:index]
      end
      
      # MOT Histories
      resources :mot_histories, only: [:show]
      
      # Searches
      resources :searches, only: [:create] do
        collection do
          get :recent
          get :popular
        end
      end
    end
  end

  # Defines the root path route ("/")
  # root "posts#index"
end
