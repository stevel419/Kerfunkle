class CartController < ApplicationController
  def show
    @cart = cart_for_current_context
    # Order by created_at to maintain insertion order (items added first appear first)
    @cart_items = @cart&.cart_items&.includes(:product)&.order(created_at: :asc) || []
  end
end
