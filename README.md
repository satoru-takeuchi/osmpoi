osmpoi
======

An easy-to-use web based OpenStreetMap POI editor

Note
----
This program is just a prototype. Please keep in mind the followings.
* Since it's currently *not* secure, please use it just for testing at present.
* Current editing target is not OpenStreetMap itself, but test map at http://api06.dev.openstreetmap.org

Usage
-----

1. Register your application to <http://api06.dev.openstreetmap.org>
2. Edit config.rb.sample as you need and save it as config.rb. For more detail, please refere to comments in this file.
3. Configure your web server: make *.cgi runnable as CGI script; prohibit to access without *.cgi, *.js, and *.css.
4. Put this source tree into anywhere can be accessed from your web server.
