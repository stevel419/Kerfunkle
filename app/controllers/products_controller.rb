class ProductsController < ApplicationController
  def home
    @products = Product.active.ordered_by_position.limit(4)
  end

  def index
    @products = Product.active.ordered_by_position
  end

  def show
    @product = Product.find(params[:id])
  end
end
