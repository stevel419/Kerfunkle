class Order < ApplicationRecord
  # Associations
  belongs_to :user
  has_many :order_items, dependent: :destroy
  
  # Enums
  enum :status, {
    pending: 'pending',
    processing: 'processing',
    paid: 'paid',
    shipped: 'shipped',
    completed: 'completed',
    cancelled: 'cancelled'
  }, default: :pending
  
  # Class Methods
  def self.create_from_stripe_session(user, stripe_session)
    transaction do
      order = create!(
        user: user,
        stripe_checkout_session_id: stripe_session.id,
        stripe_payment_intent_id: stripe_session.payment_intent,
        status: 'paid',
        total_amount: stripe_session.amount_total / 100.0,
        customer_email: stripe_session.customer_details&.email,
        shipping_address: stripe_session.collected_information&.shipping_details&.address || {},
        billing_address: stripe_session.customer_details&.address || {},
        paid_at: Time.current
      )

      # Find the cart from metadata
      cart_id = stripe_session.metadata['cart_id']
      cart = Cart.find(cart_id)

      # Create order items from cart
      cart.cart_items.each do |cart_item|
        order.order_items.create!(
          product: cart_item.product,
          quantity: cart_item.quantity,
          price_at_purchase: cart_item.product.price,
          product_name: cart_item.product.name,
          product_image_url: cart_item.product.image_url
        )
      end

      order
    end
  end
end
