#!/usr/bin/ruby

require "rubygems"
require "oauth"
require "cgi"
require "cgi/session"
require "erb"

load 'config.rb'

LOGIN_URL = BASE_URL + "login.cgi"
CALLBACK_URL = BASE_URL + "oauth_callback.cgi"
EDIT_URL = BASE_URL + "edit.cgi"

class Consumer
  def initialize
    @consumer = OAuth::Consumer.new(Consumer_key, Consumer_secret, { :site => API_URL })
  end

  attr_reader :access_token

  def create_changeset
    Changeset.new(self)
  end

  def create_request_token(request_options = {})
    @consumer.get_request_token(request_options)
  end

  def get_access_token(request_token, request_token_secret, verifier)
    r = OAuth::RequestToken.new(@consumer, request_token, request_token_secret)
    @access_token = r.get_access_token(:oauth_verifier => verifier)
  end

  def set_access_token(token, secret)
    @access_token = OAuth::AccessToken.new(@consumer, token, secret)
  end

  private
  class Changeset
    def initialize(consumer)
      @consumer = consumer
      ret = consumer.access_token.put("/api/0.6/changeset/create",
                                      "<osm><changeset>" +
                                      "<tag k='created_by' v='osmpoi' />" +
                                      "<tag k='comment' v='osmpoi test' />" +
                                      "</changeset></osm>",
                                      {'Content-Type' => 'text/plain'})
      if ret.is_a?(Net::HTTPSuccess)
        @id = ret.body
        ObjectSpace.define_finalizer(self, Changeset.fin(@id))
      else
        ret.value
      end
    end

    def create_node(lat, lon, tags)
      tags_s = tags.inject("") {|res,e|
        res += "<tag k='#{e[0]}' v='#{e[1]}' />"
      }
      s = "<osm><node changeset='#{@id}' lat='#{lat}' lon='#{lon}'>" +
        tags_s +
        "</node></osm>"

      ret = @consumer.access_token.put("/api/0.6/node/create",
                                       s,
                                       {'Content-Type' => 'text/plain'})

      return ret.is_a?(Net::HTTPSuccess) ? ret.body : nil
    end

    private
    def Changeset.fin(id)
      proc {
        ret = @consumer.access_token.put("/api/0.6/changeset/#{id}/close",
                                      "",
                                      {'Content-Type' => 'text/plain'})
      }
    end
  end
end

def osmpoi_get_session(cgi)
  begin
    ret =CGI::Session.new(cgi, {"new_session" => false})
  rescue
    ret = nil
  end
  ret
end

def osmpoi_create_session(cgi)
  CGI::Session.new(cgi, {"new_session" => true })
end

def osmpoi_render(cgi, file, b=TOPLEVEL_BINDING)
  puts cgi.header
  erb = ERB.new(File.read(file))
  erb.run(b)
end

def osmpoi_redirect(cgi, url)
  print cgi.header({"status" => "REDIRECT", "Location" => url})  
end
