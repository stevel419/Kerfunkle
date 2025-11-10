class Product < ApplicationRecord
  # Associations
  has_many :cart_items, dependent: :destroy
  has_many :order_items, dependent: :restrict_with_error
  
  # Validations
  validates :name, presence: true
  validates :price, presence: true, numericality: { greater_than: 0 }
  validates :product_number, presence: true, uniqueness: true
  
  # Scopes
  scope :active, -> { where(active: true) }
  scope :by_category, ->(category) { where(category: category) }
  scope :ordered_by_position, -> { order(:position) }
  
  # Methods
  def formatted_price
    "$#{'%.2f' % price}"
  end

  def features
    # For now, return empty array since we don't have features in the database
    # This can be extended later when we add features to the products table
    []
  end

  # Parse thumbnail images JSON
  def thumbnail_urls
    return [] unless thumbnail_images.present?
    begin
      JSON.parse(thumbnail_images)
    rescue JSON::ParserError
      []
    end
  end

  # Check if product has multiple images
  def has_thumbnails?
    thumbnail_urls.any?
  end
end
