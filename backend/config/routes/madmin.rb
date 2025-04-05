# Below are the routes for madmin
namespace :madmin do
  resources :listings
  resources :mot_histories
  resources :searches
  resources :vehicles
  root to: "dashboard#show"
end
