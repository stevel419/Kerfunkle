class DashboardController < ApplicationController
  before_action :require_login

  def index
    @user = current_user
    @recent_orders = current_user.orders.order(created_at: :desc).limit(5)
    @total_orders = current_user.orders.count
    @total_spent = current_user.orders.where(status: ['paid', 'shipped', 'completed']).sum(:total_amount)
    @cart_items_count = current_cart.cart_items.count
  end
end




