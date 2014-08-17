#!/usr/bin/ruby

require 'cgi'
require 'cgi/session'
require 'erb'

load 'osmpoi.rb'

cgi = CGI.new

if session = osmpoi_get_session(cgi)
  osmpoi_render(cgi, "edit.erb")
else
  osmpoi_render(cgi, "notify_login.erb")
end
