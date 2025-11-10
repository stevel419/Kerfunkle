class Rack::Attack
  # Throttle login attempts by IP address
  throttle('logins/ip', limit: 5, period: 1.hour) do |req|
    if req.path == '/login' && req.post?
      req.ip
    end
  end
  
  # Throttle verification code attempts by IP
  throttle('verify/ip', limit: 10, period: 1.hour) do |req|
    if req.path == '/sessions/verify' && req.post?
      req.ip
    end
  end
  
  # Throttle general API requests
  throttle('req/ip', limit: 300, period: 5.minutes) do |req|
    req.ip unless req.path.start_with?('/assets')
  end
  
  # Block suspicious requests
  blocklist('block bad actors') do |req|
    # Example: block specific IPs
    # '1.2.3.4' == req.ip
    false # Disabled for now
  end
end

# Configure response for throttled requests
Rack::Attack.throttled_responder = lambda do |env|
  match_data = env['rack.attack.match_data']
  now = match_data[:epoch_time]
  
  headers = {
    'Content-Type' => 'application/json',
    'Retry-After' => match_data[:period].to_s
  }
  
  [429, headers, [{ error: 'Too many requests. Please try again later.' }.to_json]]
end














