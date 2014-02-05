var transloadit = new TransloaditXhr({
  authKey: "MY_AUTH_KEY",
  templateId: "MY_TEMPLATE_ID",
  steps: {step_name: {step: "options"}} //optional

  successCb: function(fileUrl) {
    console.log("Finished upload of file, amazon file url is: " + fileUrl);
  },

  errorCb: function(error) {
    alert(error);
  }
});

var file = $('#file_input').get(0).files[0];
transloadit.uploadFile(file);
