#! /usr/bin/env node
var followRedirects = require("follow-redirects");
var http = followRedirects.http;
var https = followRedirects.https;
var fs = require("fs");
var rdm = require("random-string");
var img = require("./Image");
var rdl = require("readline");
/* Require Commander configuration */
var cmd = require("./commanderConfig");
// Counter of files downloaded
var downloadedFileCounter = 0;
// List of files downloaded
var downloadedFileList = [];
// Download an image
var downloadPlaceHolder = (url, filePath) => {

	var fileStream = fs.createWriteStream(filePath);
	var handle = (response) => {
		response.pipe(fileStream);
		fileStream.on("finish", () => {
			fileStream.close(() => {
				
				downloadedFileCounter++;
				downloadedFileList.push(filePath);
				var downloadProgress = Math.ceil((downloadedFileCounter / cmd.number) * 100);
				rdl.cursorTo(process.stdout, 0);
				process.stdout.write(
					"Downloaded " + downloadedFileCounter + " of " + cmd.number + ". [" + downloadProgress + " %]",
				);
				if (downloadedFileCounter === cmd.number) {
					console.info("\n" + cmd.number + " image(s) successfully downloaded");
				}
			});
		});
		fileStream.on("error", () => {
			console.log("Failed");
		});
	};
	if (url.substring(0, 7) === "http://") {
		http.get(url, (response) => {
			handle(response);
		});
	} else {
		https.get(url, (response) => {
			handle(response);
		});
	}
};
followRedirects.maxRedirects = 10;
// Generate a randome file name
var generateRandomFileName = (fileNumber) => (
		"placeholder_" +
		cmd.size +
		"_" +
		rdm({ length: 4 }) +
		fileNumber +
		rdm({ length: 4 }) +
		".jpg"
	);
for (i = 1; i <= cmd.number; i++) {
	downloadPlaceHolder(img.getImgUrl(cmd.size), generateRandomFileName(i));
}
