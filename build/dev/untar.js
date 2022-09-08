;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['ProgressivePromise'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('ProgressivePromise'));
  } else {
    root.untar = factory(root.ProgressivePromise);
  }
}(this, function(ProgressivePromise) {
"use strict";
/* globals Blob: false, Promise: false, console: false, Worker: false, ProgressivePromise: false */

var workerScriptUri; // Included at compile time

var global = window || this;

var URL = global.URL || global.webkitURL;

/**
Returns a ProgressivePromise.
*/
function untar(arrayBuffer) {
	if (!(arrayBuffer instanceof ArrayBuffer)) {
		throw new TypeError("arrayBuffer is not an instance of ArrayBuffer.");
	}

	if (!global.Worker) {
		throw new Error("Worker implementation is not available in this environment.");
	}

	return new ProgressivePromise(function (resolve, reject, progress) {
		var worker = new Worker(workerScriptUri);

		worker.onerror = function (err) {
			reject(err);
		};

		worker.onmessage = function (message) {
			message = message.data;

			switch (message.type) {
				case "log":
					console[message.data.level]("Worker: " + message.data.msg);
					break;
				case "extract":
					var file = decorateExtractedFile(message.data);
					progress(file);
					break;
				case "complete":
					worker.terminate();
					resolve();
					break;
				case "error":
					worker.terminate();
					reject(new Error(message.data.message));
					break;
				default:
					worker.terminate();
					reject(new Error("Unknown message from worker: " + message.type));
					break;
			}
		};

		//console.info("Sending arraybuffer to worker for extraction.");
		worker.postMessage({ type: "extract", buffer: arrayBuffer }, [arrayBuffer]);
	});
}

var decoratedFileProps = {
	blob: {
		get: function () {
			return this._blob || (this._blob = new Blob([this.buffer]));
		}
	},
	getBlobUrl: {
		value: function () {
			return this._blobUrl || (this._blobUrl = URL.createObjectURL(this.blob));
		}
	},
	readAsString: {
		value: function () {
			var buffer = this.buffer;
			var charCount = buffer.byteLength;
			var charSize = 1;
			var byteCount = charCount * charSize;
			var bufferView = new DataView(buffer);

			var charCodes = [];

			for (var i = 0; i < charCount; ++i) {
				var charCode = bufferView.getUint8(i * charSize, true);
				charCodes.push(charCode);
			}

			return (this._string = String.fromCharCode.apply(null, charCodes));
		}
	},
	readAsJSON: {
		value: function () {
			return JSON.parse(this.readAsString());
		}
	}
};

function decorateExtractedFile(file) {
	Object.defineProperties(file, decoratedFileProps);
	return file;
}

workerScriptUri = '/base/build/dev/untar-worker.js';
return untar;
}));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ1bnRhci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBnbG9iYWxzIEJsb2I6IGZhbHNlLCBQcm9taXNlOiBmYWxzZSwgY29uc29sZTogZmFsc2UsIFdvcmtlcjogZmFsc2UsIFByb2dyZXNzaXZlUHJvbWlzZTogZmFsc2UgKi9cclxuXHJcbnZhciB3b3JrZXJTY3JpcHRVcmk7IC8vIEluY2x1ZGVkIGF0IGNvbXBpbGUgdGltZVxyXG5cclxudmFyIGdsb2JhbCA9IHdpbmRvdyB8fCB0aGlzO1xyXG5cclxudmFyIFVSTCA9IGdsb2JhbC5VUkwgfHwgZ2xvYmFsLndlYmtpdFVSTDtcclxuXHJcbi8qKlxyXG5SZXR1cm5zIGEgUHJvZ3Jlc3NpdmVQcm9taXNlLlxyXG4qL1xyXG5mdW5jdGlvbiB1bnRhcihhcnJheUJ1ZmZlcikge1xyXG5cdGlmICghKGFycmF5QnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpKSB7XHJcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKFwiYXJyYXlCdWZmZXIgaXMgbm90IGFuIGluc3RhbmNlIG9mIEFycmF5QnVmZmVyLlwiKTtcclxuXHR9XHJcblxyXG5cdGlmICghZ2xvYmFsLldvcmtlcikge1xyXG5cdFx0dGhyb3cgbmV3IEVycm9yKFwiV29ya2VyIGltcGxlbWVudGF0aW9uIGlzIG5vdCBhdmFpbGFibGUgaW4gdGhpcyBlbnZpcm9ubWVudC5cIik7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4gbmV3IFByb2dyZXNzaXZlUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0LCBwcm9ncmVzcykge1xyXG5cdFx0dmFyIHdvcmtlciA9IG5ldyBXb3JrZXIod29ya2VyU2NyaXB0VXJpKTtcclxuXHJcblx0XHR3b3JrZXIub25lcnJvciA9IGZ1bmN0aW9uIChlcnIpIHtcclxuXHRcdFx0cmVqZWN0KGVycik7XHJcblx0XHR9O1xyXG5cclxuXHRcdHdvcmtlci5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAobWVzc2FnZSkge1xyXG5cdFx0XHRtZXNzYWdlID0gbWVzc2FnZS5kYXRhO1xyXG5cclxuXHRcdFx0c3dpdGNoIChtZXNzYWdlLnR5cGUpIHtcclxuXHRcdFx0XHRjYXNlIFwibG9nXCI6XHJcblx0XHRcdFx0XHRjb25zb2xlW21lc3NhZ2UuZGF0YS5sZXZlbF0oXCJXb3JrZXI6IFwiICsgbWVzc2FnZS5kYXRhLm1zZyk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFwiZXh0cmFjdFwiOlxyXG5cdFx0XHRcdFx0dmFyIGZpbGUgPSBkZWNvcmF0ZUV4dHJhY3RlZEZpbGUobWVzc2FnZS5kYXRhKTtcclxuXHRcdFx0XHRcdHByb2dyZXNzKGZpbGUpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdFx0Y2FzZSBcImNvbXBsZXRlXCI6XHJcblx0XHRcdFx0XHR3b3JrZXIudGVybWluYXRlKCk7XHJcblx0XHRcdFx0XHRyZXNvbHZlKCk7XHJcblx0XHRcdFx0XHRicmVhaztcclxuXHRcdFx0XHRjYXNlIFwiZXJyb3JcIjpcclxuXHRcdFx0XHRcdHdvcmtlci50ZXJtaW5hdGUoKTtcclxuXHRcdFx0XHRcdHJlamVjdChuZXcgRXJyb3IobWVzc2FnZS5kYXRhLm1lc3NhZ2UpKTtcclxuXHRcdFx0XHRcdGJyZWFrO1xyXG5cdFx0XHRcdGRlZmF1bHQ6XHJcblx0XHRcdFx0XHR3b3JrZXIudGVybWluYXRlKCk7XHJcblx0XHRcdFx0XHRyZWplY3QobmV3IEVycm9yKFwiVW5rbm93biBtZXNzYWdlIGZyb20gd29ya2VyOiBcIiArIG1lc3NhZ2UudHlwZSkpO1xyXG5cdFx0XHRcdFx0YnJlYWs7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblxyXG5cdFx0Ly9jb25zb2xlLmluZm8oXCJTZW5kaW5nIGFycmF5YnVmZmVyIHRvIHdvcmtlciBmb3IgZXh0cmFjdGlvbi5cIik7XHJcblx0XHR3b3JrZXIucG9zdE1lc3NhZ2UoeyB0eXBlOiBcImV4dHJhY3RcIiwgYnVmZmVyOiBhcnJheUJ1ZmZlciB9LCBbYXJyYXlCdWZmZXJdKTtcclxuXHR9KTtcclxufVxyXG5cclxudmFyIGRlY29yYXRlZEZpbGVQcm9wcyA9IHtcclxuXHRibG9iOiB7XHJcblx0XHRnZXQ6IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0cmV0dXJuIHRoaXMuX2Jsb2IgfHwgKHRoaXMuX2Jsb2IgPSBuZXcgQmxvYihbdGhpcy5idWZmZXJdKSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHRnZXRCbG9iVXJsOiB7XHJcblx0XHR2YWx1ZTogZnVuY3Rpb24gKCkge1xyXG5cdFx0XHRyZXR1cm4gdGhpcy5fYmxvYlVybCB8fCAodGhpcy5fYmxvYlVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwodGhpcy5ibG9iKSk7XHJcblx0XHR9XHJcblx0fSxcclxuXHRyZWFkQXNTdHJpbmc6IHtcclxuXHRcdHZhbHVlOiBmdW5jdGlvbiAoKSB7XHJcblx0XHRcdHZhciBidWZmZXIgPSB0aGlzLmJ1ZmZlcjtcclxuXHRcdFx0dmFyIGNoYXJDb3VudCA9IGJ1ZmZlci5ieXRlTGVuZ3RoO1xyXG5cdFx0XHR2YXIgY2hhclNpemUgPSAxO1xyXG5cdFx0XHR2YXIgYnl0ZUNvdW50ID0gY2hhckNvdW50ICogY2hhclNpemU7XHJcblx0XHRcdHZhciBidWZmZXJWaWV3ID0gbmV3IERhdGFWaWV3KGJ1ZmZlcik7XHJcblxyXG5cdFx0XHR2YXIgY2hhckNvZGVzID0gW107XHJcblxyXG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGNoYXJDb3VudDsgKytpKSB7XHJcblx0XHRcdFx0dmFyIGNoYXJDb2RlID0gYnVmZmVyVmlldy5nZXRVaW50OChpICogY2hhclNpemUsIHRydWUpO1xyXG5cdFx0XHRcdGNoYXJDb2Rlcy5wdXNoKGNoYXJDb2RlKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0cmV0dXJuICh0aGlzLl9zdHJpbmcgPSBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGNoYXJDb2RlcykpO1xyXG5cdFx0fVxyXG5cdH0sXHJcblx0cmVhZEFzSlNPTjoge1xyXG5cdFx0dmFsdWU6IGZ1bmN0aW9uICgpIHtcclxuXHRcdFx0cmV0dXJuIEpTT04ucGFyc2UodGhpcy5yZWFkQXNTdHJpbmcoKSk7XHJcblx0XHR9XHJcblx0fVxyXG59O1xyXG5cclxuZnVuY3Rpb24gZGVjb3JhdGVFeHRyYWN0ZWRGaWxlKGZpbGUpIHtcclxuXHRPYmplY3QuZGVmaW5lUHJvcGVydGllcyhmaWxlLCBkZWNvcmF0ZWRGaWxlUHJvcHMpO1xyXG5cdHJldHVybiBmaWxlO1xyXG59XHJcbiJdLCJmaWxlIjoidW50YXIuanMifQ==
