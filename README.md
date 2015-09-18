transloadit_xhr
===============

An XHR (XmlHttpRequest) file upload implementation for Transloadit.

Transloadit's jQuery plugin now also offers support for XmlHttpRequest. Just
set its "this._options.formData" attribute accordingly, which makes this very
project somewhat obsolete. If you want a lightweight implementation without
all the other functionality that the official jQuery plugin, then this project
is something for you.

**Example:**

First build your params and signature in the backend of your server (to be secure),
and then call upload(). Make sure to change the id on your #file_input field
accordingly before you start.

```
function upload() {
  var transloadit = new TransloaditXhr({
    params    : params,
    signature : signature,

    successCb: function(results) {
      console.log("Worked");
      console.log(results);
    },

    errorCb: function(err) {
      console.log(err);
    }
  });

  var file = $('#file_input').get(0).files[0];
  transloadit.uploadFile(file);
}
```
