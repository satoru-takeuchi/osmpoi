#!/usr/bin/ruby

require "cgi"
require "cgi/session"
load "osmpoi.rb"

cgi = CGI.new

if session = osmpoi_get_session(cgi)
  osmpoi_redirect(EDIT_URL)
  exit 0
else
  session = osmpoi_create_session(cgi)
  c = Consumer.new
  r = c.create_request_token({:oauth_callback => CALLBACK_URL})
  session['request_token'] = r.token
  session['request_token_secret'] = r.secret
  session.close
  osmpoi_redirect(cgi, r.authorize_url)
  exit 0
end
