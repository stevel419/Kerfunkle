class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern
  
  helper_method :current_user, :logged_in?, :current_cart, :guest_cart, :cart_for_current_context

  private

  def current_user
    @current_user ||= User.find_by(id: session[:user_id]) if session[:user_id]
  end

  def logged_in?
    current_user.present?
  end

  def current_cart
    return nil unless logged_in?
    @current_cart ||= current_user.cart || current_user.create_cart
  end

  def guest_cart
    # For development/testing, use a fallback approach
    session_key = session.id.to_s
    session_key = "guest_fallback_#{request.remote_ip}" if session_key.blank?

    @guest_cart ||= Cart.find_or_create_by(session_id: session_key) do |cart|
      # This will be created without a user_id (guest cart)
    end
  end

  def cart_for_current_context
    logged_in? ? current_cart : guest_cart
  end

  def require_login
    unless logged_in?
      flash[:alert] = "Please log in to continue"
      redirect_to login_path
    end
  end
end
