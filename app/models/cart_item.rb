class CartItem < ApplicationRecord
  # Associations
  belongs_to :cart
  belongs_to :product
  
  # Validations
  validates :quantity, presence: true, numericality: { greater_than: 0 }
  
  # Methods
  def subtotal
    product.price * quantity
  end
end
