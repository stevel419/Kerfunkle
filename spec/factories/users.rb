FactoryBot.define do
  factory :user do
    email { "MyString" }
    verification_code { "MyString" }
    code_expires_at { "2025-10-10 09:49:15" }
    login_attempts { 1 }
    last_login_at { "2025-10-10 09:49:15" }
  end
end
