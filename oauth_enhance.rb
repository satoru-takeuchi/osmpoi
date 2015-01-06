#!/usr/bin/ruby

=begin
Copyright (c) 2007 Blaine Cook, Larry Halff, Pelle Braendgaard

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
=end

class OAuth::AccessToken
  def delete(path, body, headers = {})
    request(:delete_override, path, body, headers)
  end
end

class OAuth::Consumer
  def create_http_request(http_method, path, *arguments)  
    http_method = http_method.to_sym

    if [:post, :put].include?(http_method)
      data = arguments.shift
    elsif [:delete_override].include?(http_method)
      data = arguments.shift
      http_method = :delete
    end

    # if the base site contains a path, add it now
    uri = URI.parse(site)
    path = uri.path + path if uri.path && uri.path != '/'

    headers = arguments.first.is_a?(Hash) ? arguments.shift : {}

    case http_method
    when :post
      request = Net::HTTP::Post.new(path,headers)
      request["Content-Length"] = '0' # Default to 0
    when :put
      request = Net::HTTP::Put.new(path,headers)
      request["Content-Length"] = '0' # Default to 0
    when :get
      request = Net::HTTP::Get.new(path,headers)
    when :delete
      request =  Net::HTTP::Delete.new(path,headers)
    when :head
      request = Net::HTTP::Head.new(path,headers)
    else
      raise ArgumentError, "Don't know how to handle http_method: :#{http_method.to_s}"
    end

    if data.is_a?(Hash)
      request.body = OAuth::Helper.normalize(data)
      request.content_type = 'application/x-www-form-urlencoded'
    elsif data
      if data.respond_to?(:read)
        request.body_stream = data
        if data.respond_to?(:length)
          request["Content-Length"] = data.length.to_s
        elsif data.respond_to?(:stat) && data.stat.respond_to?(:size)
          request["Content-Length"] = data.stat.size.to_s
        else
          raise ArgumentError, "Don't know how to send a body_stream that doesn't respond to .length or .stat.size"
        end
      else
        request.body = data.to_s
        request["Content-Length"] = request.body.length.to_s
      end
    end

    request
  end
end
