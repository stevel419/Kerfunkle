class CartItemsController < ApplicationController
  before_action :set_product, only: [:create]
  before_action :set_cart_item, only: [:update, :destroy]

  def create
    cart = cart_for_current_context
    cart.add_product(@product, params[:quantity].to_i || 1)

    respond_to do |format|
      format.html { redirect_to cart_path, notice: "#{@product.name} added to cart" }
      format.turbo_stream
    end
  end

  def update
    @cart_item.update(quantity: params[:quantity])
    # Reload to get fresh associations
    @cart_item.reload

    respond_to do |format|
      format.html { redirect_to cart_path }
      format.turbo_stream
    end
  end

  def destroy
    @cart_item.destroy

    respond_to do |format|
      format.html { redirect_to cart_path, notice: "Item removed from cart" }
      format.turbo_stream
    end
  end

  private

  def set_product
    @product = Product.find(params[:product_id])
  end

  def set_cart_item
    cart = cart_for_current_context
    @cart_item = cart.cart_items.find(params[:id])
  end
end
