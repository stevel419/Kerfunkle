class PagesController < ApplicationController
  def privacy_policy
    @page_title = "Privacy Policy"
  end

  def refund_policy
    @page_title = "Refund Policy"
  end

  def terms_of_service
    @page_title = "Terms of Service"
  end
end




