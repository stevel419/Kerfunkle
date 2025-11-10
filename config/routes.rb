Rails.application.routes.draw do
  get "stripe/webhooks"
  # Authentication routes
  get "login", to: "sessions#new"
  post "login", to: "sessions#create"
  get "sessions/verify", to: "sessions#verify", as: :verify_sessions
  post "sessions/verify", to: "sessions#verify_code"
  delete "logout", to: "sessions#destroy"
  
  # Dashboard route
  get "dashboard", to: "dashboard#index", as: :dashboard
  
  # Orders routes
  resources :orders, only: [:index, :show]
  
  # Policy pages
  get "privacy-policy", to: "pages#privacy_policy", as: :privacy_policy
  get "refund-policy", to: "pages#refund_policy", as: :refund_policy
  get "terms-of-service", to: "pages#terms_of_service", as: :terms_of_service
  
  # Product routes
  get "home", to: "products#home", as: :home
  resources :products, only: [:index, :show]

  # Cart routes
  resource :cart, only: [:show], controller: :cart
  resources :cart_items, only: [:create, :update, :destroy]

  # Checkout routes
  resources :checkout, only: [:new, :create]
  get 'checkout/success', to: 'checkout#success'

  # Stripe webhook
  post 'stripe/webhooks', to: 'stripe#webhooks'
  
  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Letter Opener web interface (development only)
  if Rails.env.development?
    mount LetterOpenerWeb::Engine, at: "/rails/letter_opener"
  end

  # Defines the root path route ("/")
  root "products#home"
end
