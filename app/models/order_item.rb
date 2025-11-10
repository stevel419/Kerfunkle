class OrderItem < ApplicationRecord
  # Associations
  belongs_to :order
  belongs_to :product
  
  # Validations
  validates :quantity, presence: true, numericality: { greater_than: 0 }
  validates :price_at_purchase, presence: true, numericality: { greater_than: 0 }
  
  # Methods
  def subtotal
    price_at_purchase * quantity
  end
end
