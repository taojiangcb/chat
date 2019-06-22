"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
function post(url, otp) {
    return new Promise((resolve, reject) => {
        request.post(url, otp, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                resolve(response.body);
            }
            else {
                reject(error);
            }
        });
    });
}
exports.httpRequest = {
    post: post
};
//# sourceMappingURL=http.js.map