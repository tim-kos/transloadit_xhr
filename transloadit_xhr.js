/* This file handles uploading to Transloadit, a 3rd party service.
 It was originally written by the Transloadit team, but we may
 end up modifying it more in the future.
 */
(function(window) {

    function TransloaditXhr(opts) {
        this.params = opts.params;
        this.signature = opts.signature;
        this.successCb = opts.successCb || null;    // Callback: Completed 
        this.errorCb = opts.errorCb || null;        // Callback: Failed
        this.progressCb = opts.progressCb || null;  // Callback: File upload progressed
        this.processCb = opts.processCb || null;    // Callback: File uploaded, still processing the file

        this.XMLHTTPRequestUpload = null;
    }

    TransloaditXhr.prototype.checkAssemblyStatus = function(assemblyUrl) {
        var self = this;

        $.ajax({
            url: assemblyUrl,
            type: "GET",
            dataType: "json",
            success: function(data, textStatus) {
                if (data.ok && data.ok == "ASSEMBLY_COMPLETED") {
                    if (typeof self.successCb === "function") {
                        self.successCb(data.results);
                    }
                    return;
                }

                if (data.ok == "ASSEMBLY_EXECUTING")
                    if (typeof self.processCb === "function")
                        self.processCb();

                if (data.error || (data.ok != "ASSEMBLY_EXECUTING" && data.ok != "ASSEMBLY_UPLOADING")) {
                    if (typeof self.errorCb === "function") {
                        self.errorCb("Failed to check assembly (" + textStatus + ")");
                    }
                    return;
                }

                setTimeout(function() {
                    self.checkAssemblyStatus(assemblyUrl);
                }, 1000);
            },
            error: function(XMLHttpRequest, textStatus) {
                if (typeof self.errorCb === "function") {
                    self.errorCb("Failed to check assembly (" + textStatus + ")");
                }
            }
        });
    };

    TransloaditXhr.prototype.onProgress = function(progressEvent) {
        if (typeof this.progressCb === "function")
            this.progressCb(100.0 * progressEvent.loaded / progressEvent.total);
    };

    TransloaditXhr.prototype.uploadFile = function(file, fieldsArr) {
        var self = this,
        	i;

        var formPost = new FormData();
        formPost.append("params", this.params);
        formPost.append("signature", this.signature);
        if (typeof fieldsArr !== "undefined") {
	        for (i=0; i < fieldsArr.length; i++) {
	  			formPost.append(fieldsArr[i].name, fieldsArr[i].value);
			}
		}
        formPost.append("file", file);

        var xhr = new XMLHttpRequest();
        xhr.open("POST", "//api2.transloadit.com/assemblies", true);
        xhr.upload.self = this;
        xhr.upload.onprogress = this.onProgress.bind(this);

        xhr.onreadystatechange = function(event) {
            var req = event.target;

            if (req.readyState === 4) {
                if (req.status === 200) {
                    var parsedData = jQuery.parseJSON(req.responseText);
                    self.checkAssemblyStatus(parsedData.assembly_url);
                } else if (typeof self.errorCb === "function") {
                    if(req.responseText.length > 0) {
                      self.errorCb(jQuery.parseJSON(req.responseText).message);
                    } else {
                      self.errorCb("Failed to upload file");
                    }
                }
            }
        };

        xhr.send(formPost);
    };

    window.TransloaditXhr = TransloaditXhr;

})(window);