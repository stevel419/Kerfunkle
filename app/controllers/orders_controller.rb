class OrdersController < ApplicationController
  before_action :require_login

  def index
    @orders = current_user.orders.order(created_at: :desc).includes(:order_items)
    @total_orders = current_user.orders.count
    @total_spent = current_user.orders.where(status: ['paid', 'shipped', 'completed']).sum(:total_amount)
  end

  def show
    @order = current_user.orders.find(params[:id])
    @order_items = @order.order_items.includes(:product)
  end
end
