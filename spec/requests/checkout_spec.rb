require 'rails_helper'

RSpec.describe "Checkouts", type: :request do
  describe "GET /new" do
    it "returns http success" do
      get "/checkout/new"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /create" do
    it "returns http success" do
      get "/checkout/create"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /success" do
    it "returns http success" do
      get "/checkout/success"
      expect(response).to have_http_status(:success)
    end
  end

end
