class Search < ApplicationRecord
  validates :query, presence: true
  
  scope :recent, -> { order(created_at: :desc) }
  scope :by_user, ->(user_id) { where(user_id: user_id) if user_id.present? }
  
  def self.popular_in_timeframe(days = 7, limit = 5)
    where('created_at > ?', days.days.ago)
      .group(:query)
      .select('query, COUNT(*) as count')
      .order('count DESC')
      .limit(limit)
  end
  
  def execute
    Listing.search(query)
  end
end
