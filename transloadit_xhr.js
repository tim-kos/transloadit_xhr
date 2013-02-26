// Transloadit xhr file upload implementation
function TransloaditXhr(opts) {
  this.authKey    = opts.authKey;
  this.templateId = opts.templateId;
  this.successCb  = opts.successCb || null;
  this.errorCb    = opts.errorCb || null;
}

TransloaditXhr.prototype.checkAssemblyStatus = function(assemblyUrl) {
  var self = this;

  $.ajax({
    url: assemblyUrl,
    type: "GET",
    dataType: "json",
    success: function(data, textStatus, XMLHttpRequest) {
      if (data.ok && data.ok == "ASSEMBLY_COMPLETED") {
        var result = data.results[':original'][0];

        if (typeof self.successCb === 'function') {
          self.successCb(result.url);
        }
        return;
      }

      if (data.error || data.ok != "ASSEMBLY_EXECUTING") {
        if (typeof self.errorCb === 'function') {
          self.errorCb("Failed to check assembly (" + textStatus + ")");
        }
        return;
      }

      setTimeout(function() {
        self.checkAssemblyStatus(assemblyUrl);
      }, 1000);
    },
    error: function(XMLHttpRequest, textStatus, error) {
      if (typeof self.errorCb === 'function') {
        self.errorCb("Failed to check assembly (" + textStatus + ")");
      }
    }
  });
};

TransloaditXhr.prototype.uploadFile = function(file) {
  var params = {
    auth: {key: this.authKey},
    "template_id": this.templateId
  };
  var self = this;

  var formPost = new FormData();
  formPost.append("params", JSON.stringify(params));
  formPost.append("file", file);

  var xhr = new XMLHttpRequest();
  xhr.open('POST', "http://api2.transloadit.com/assemblies", true);

  xhr.onreadystatechange = function(event) {
    var req = event.target;
    if (req.readyState >= 0 && req.readyState < 4) {
      console.log("Ready state is " + req.readyState);
    }

    if (req.readyState === 4) {
      if (req.status === 200) {
        var parsedData = jQuery.parseJSON(req.responseText);
        self.checkAssemblyStatus(parsedData.assembly_url);
      } else if (typeof self.errorCb === 'function') {
        self.errorCb("Failed to upload file");
      }
    } else if (typeof self.errorCb === 'function') {
      self.errorCb("Unhandled ready state for xmlhttprequest");
    }
  };

  xhr.send(formPost);
};

var transloadit = new TransloaditXhr({
  authkey: "MY_AUTH_KEY",
  templateId: "MY_TEMPLATE_ID",

  successCb: function(fileUrl) {
    console.log("Finished upload of file, amazon file url is: " + fileUrl);
  },

  errorCb: function() {
    alert(error);
  }
});

var file = $('#file_input').get(0).files[0];
transloadit.uploadFile(file);
