#!/usr/bin/ruby

require 'cgi'
require 'cgi/session'
load "osmpoi.rb"

cgi = CGI.new

if !(session = osmpoi_get_session(cgi))
  print cgi.header
  puts "something bad happens with callback"

  exit 0
end

c = Consumer.new
a = c.get_access_token(session['request_token'],
                       session['request_token_secret'],
                       cgi['oauth_verifier'])

session['access_token'] = a.token
session['access_token_secret'] = a.secret

osmpoi_redirect(cgi, EDIT_URL)
