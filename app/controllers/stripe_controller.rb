class StripeController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:webhooks]

  def webhooks
    payload = request.body.read
    sig_header = request.env['HTTP_STRIPE_SIGNATURE']
    endpoint_secret = ENV['STRIPE_WEBHOOK_SECRET']

    begin
      event = Stripe::Webhook.construct_event(payload, sig_header, endpoint_secret)
    rescue JSON::ParserError => e
      # Invalid payload
      render json: { error: 'Invalid payload' }, status: 400
      return
    rescue Stripe::SignatureVerificationError => e
      # Invalid signature
      render json: { error: 'Invalid signature' }, status: 400
      return
    end

    # Handle the event
    case event.type
    when 'checkout.session.completed'
      handle_checkout_session_completed(event.data.object)
    else
      puts "Unhandled event type #{event.type}"
    end

    render json: { status: 'success' }, status: 200
  end

  private

  def handle_checkout_session_completed(session)
    # Find the order and update it
    order = Order.find_by(stripe_checkout_session_id: session.id)
    return unless order

    # Update order with payment details
    order.update!(
      stripe_payment_intent_id: session.payment_intent,
      status: 'paid',
      paid_at: Time.current
    )

    # Send confirmation email
    OrderMailer.confirmation(order).deliver_later
  end
end
