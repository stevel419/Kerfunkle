class OrderMailer < ApplicationMailer
  default from: 'Kerfunkle <orders@kerfunkle.com>'

  def confirmation(order)
    @order = order
    @user = order.user

    # Attach logo as inline image
    attachments.inline['logo.png'] = File.read(Rails.root.join('public', 'imgs', 'logo.png'))

    mail(
      to: order.customer_email,
      subject: "Order Confirmation ##{order.id} - Kerfunkle"
    )
  end
end
