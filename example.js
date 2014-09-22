
//ask your server to build and send back your params and signature then run upload()

function upload() {
	var transloadit = new TransloaditXhr({
		params: params,
		signature: signature,

		successCb: function(fileUrl) {
			alert("Worked");
		},

		errorCb: function(error) {
			alert(error);
		}
	});

	var file = $('#file_input').get(0).files[0];
	transloadit.uploadFile(file);
}