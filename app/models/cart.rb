class Cart < ApplicationRecord
  # Associations
  belongs_to :user, optional: true  # Allow guest carts (no user association)
  has_many :cart_items, dependent: :destroy
  has_many :products, through: :cart_items

  # Methods
  def add_product(product, quantity = 1)
    cart_item = cart_items.find_by(product: product)

    if cart_item
      cart_item.increment!(:quantity, quantity)
    else
      cart_items.create(product: product, quantity: quantity)
    end
  end

  def total_price
    cart_items.includes(:product).sum { |item| item.product.price * item.quantity }
  end

  def total_items
    cart_items.sum(:quantity)
  end

  def clear!
    cart_items.destroy_all
  end

  def guest?
    user_id.nil?
  end

  def user_cart?
    user_id.present?
  end
end
