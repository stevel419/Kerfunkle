class CheckoutController < ApplicationController
  before_action :require_login, only: [:success]  # Only logged-in users can see success page

  def new
    cart = cart_for_current_context

    if !cart || cart.cart_items.empty?
      redirect_to cart_path, alert: "Your cart is empty. Add some items before checking out."
      return
    end

    @cart = cart
    @cart_items = @cart.cart_items.includes(:product)
  end

  def create
    cart = cart_for_current_context

    if !cart || cart.cart_items.empty?
      redirect_to cart_path, alert: "Your cart is empty"
      return
    end

    begin
      # Set Stripe API key
      Stripe.api_key = ENV['STRIPE_SECRET_KEY']

      # Create Stripe checkout session
      session = Stripe::Checkout::Session.create(
        ui_mode: 'embedded',
        line_items: stripe_line_items(cart),
        mode: 'payment',
        customer_email: logged_in? ? current_user.email : nil,
        return_url: "#{checkout_success_url}?session_id={CHECKOUT_SESSION_ID}",
        billing_address_collection: 'auto',
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'MX', 'AU', 'GB', 'DE', 'FR', 'IT', 'JP', 'SG', 'KR', 'BR', 'NL', 'NZ']
        },
        metadata: {
          cart_id: cart.id,
          user_id: logged_in? ? current_user.id : nil
        }
      )

      render json: { clientSecret: session.client_secret }
    rescue Stripe::InvalidRequestError => e
      # Handle invalid price IDs or other Stripe errors
      Rails.logger.error "Stripe checkout session creation failed: #{e.message}"
      if e.message.include?("No such price")
        render json: {
          error: "Product prices need to be configured in Stripe. Please create products and prices in your Stripe dashboard, then update the stripe_price_id values in the database."
        }, status: 422
      else
        render json: { error: "Payment processing temporarily unavailable. Please try again later." }, status: 422
      end
    rescue => e
      Rails.logger.error "Unexpected error creating Stripe checkout session: #{e.message}"
      render json: { error: "An unexpected error occurred. Please try again." }, status: 500
    end
  end

  def success
    if params[:session_id]
      @stripe_session = Stripe::Checkout::Session.retrieve(params[:session_id])
      @order = Order.create_from_stripe_session(logged_in? ? current_user : nil, @stripe_session)

      # Clear the cart after successful order
      cart_for_current_context&.clear!

      # Send order confirmation email synchronously
      OrderMailer.confirmation(@order).deliver_now if logged_in?
    else
      @order = nil
      flash[:alert] = "Order not found"
    end
  end

  private

  def stripe_line_items(cart)
    cart.cart_items.map do |item|
      {
        price: item.product.stripe_price_id,
        quantity: item.quantity
      }
    end
  end
end
