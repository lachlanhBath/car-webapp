# Configure Redis connection
redis_url = ENV.fetch('REDIS_URL', 'redis://localhost:6379/1')
REDIS = Redis.new(url: redis_url)

# Configure Redis cache store
Rails.application.config.cache_store = :redis_cache_store, {
  url: redis_url,
  expires_in: 1.hour,
  namespace: "car_app:cache"
} 