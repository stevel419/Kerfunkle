class SessionsController < ApplicationController
  skip_before_action :require_login, only: [:new, :create, :verify, :verify_code], raise: false
  
  def new
    # Email input form
  end
  
  def create
    user = User.find_or_create_by(email: params[:email].downcase.strip)
    user.generate_verification_code
    
    # Send verification email synchronously (faster and works without job queue)
    UserMailer.verification_code(user).deliver_now
    
    session[:pending_email] = user.email
    redirect_to verify_sessions_path, notice: "Verification code sent to #{user.email}"
  end
  
  def verify
    # Code verification form
    @email = session[:pending_email]
    redirect_to login_path, alert: "Please enter your email first" unless @email
  end
  
  def verify_code
    user = User.find_by(email: session[:pending_email])
    
    unless user
      redirect_to login_path, alert: "Session expired. Please request a new code."
      return
    end
    
    # Check if user has too many failed attempts
    if user.login_attempts >= 5
      flash.now[:alert] = "Too many failed attempts. Please request a new verification code."
      @email = session[:pending_email]
      render :verify, status: :unprocessable_entity
      return
    end
    
    if user.verify_code(params[:code])
      session[:user_id] = user.id
      session.delete(:pending_email)
      redirect_to root_path, notice: "Welcome back!"
    else
      remaining_attempts = 5 - user.login_attempts
      if remaining_attempts > 0
        flash.now[:alert] = "Invalid or expired code. #{remaining_attempts} attempts remaining."
      else
        flash.now[:alert] = "Too many failed attempts. Please request a new verification code."
      end
      @email = session[:pending_email]
      render :verify, status: :unprocessable_entity
    end
  end
  
  def destroy
    session.delete(:user_id)
    redirect_to root_path, notice: "Logged out successfully"
  end
end
