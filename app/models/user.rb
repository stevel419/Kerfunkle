class User < ApplicationRecord
  # Associations
  has_one :cart, dependent: :destroy
  has_many :orders, dependent: :destroy
  
  # Validations
  validates :email, presence: true, 
                    uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  
  # Callbacks
  before_save :downcase_email
  after_create :create_cart

  # Methods
  def create_cart
    Cart.create(user: self)
  end

  def generate_verification_code
    self.verification_code = SecureRandom.random_number(1_000_000).to_s.rjust(6, '0')
    self.code_expires_at = 15.minutes.from_now
    self.login_attempts = 0  # Reset login attempts when generating new code
    save
  end
  
  def verify_code(code)
    # Check if too many failed attempts
    return false if login_attempts >= 5
    
    # Check if code is valid and not expired
    if verification_code == code && code_expires_at > Time.current
      # Success: reset attempts and update last login
      update(login_attempts: 0, last_login_at: Time.current)
      true
    else
      # Failure: increment attempts only AFTER checking the code
      increment!(:login_attempts)
      false
    end
  end
  
  private
  
  def downcase_email
    self.email = email.downcase.strip
  end
end
