SecureHeaders::Configuration.default do |config|
  # Development: Allow framing for letter_opener
  if Rails.env.development?
    config.x_frame_options = "SAMEORIGIN"
  else
    config.x_frame_options = "DENY"
  end

  config.x_content_type_options = "nosniff"
  config.x_xss_protection = "1; mode=block"
  config.x_download_options = "noopen"
  config.x_permitted_cross_domain_policies = "none"
  config.referrer_policy = %w[origin-when-cross-origin strict-origin-when-cross-origin]

  config.csp = {
    default_src: %w['self'],
    font_src: %w['self' data:],
    img_src: %w['self' data: https:],
    object_src: %w['none'],
    script_src: %w['self' 'unsafe-inline' https://js.stripe.com],
    style_src: %w['self' 'unsafe-inline'],
    connect_src: %w['self' https://api.stripe.com],
    frame_src: %w['self' https://js.stripe.com https://hooks.stripe.com]
  }
end

