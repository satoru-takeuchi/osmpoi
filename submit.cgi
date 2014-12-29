#!/usr/bin/ruby
# -*- coding: utf-8 -*-

require "cgi"
require "cgi/session"
require "erb"

load "osmpoi.rb"

cgi = CGI.new

if !(session = osmpoi_get_session(cgi))
  osmpoi_render(cgi, "notify_login.erb")
  exit 0
end

name = CGI.escapeHTML(cgi['name'])
category = cgi['category']
kind = cgi['kind']
lat = cgi['lat']
lon = cgi['lon']

c = Consumer.new
c.set_access_token(session['access_token'], session['access_token_secret'])
cs = c.create_changeset

status = "failed"
if cs.create_node(lat, lon,
                  {"name" => name,
                    category => kind})
  status = "succeeded"
end
 
osmpoi_render(cgi, "after_submit.erb", binding)
