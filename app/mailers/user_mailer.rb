class UserMailer < ApplicationMailer
  default from: 'Kerfunkle <noreply@kerfunkle.com>'
  
  def verification_code(user)
    @user = user
    @code = user.verification_code
    
    # Attach logo as inline image
    attachments.inline['logo.png'] = File.read(Rails.root.join('public', 'imgs', 'logo.png'))
    
    mail(
      to: @user.email,
      subject: "#{@code} is your Kerfunkle login code"
    )
  end
end
