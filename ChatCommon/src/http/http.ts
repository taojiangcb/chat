
import request = require("request");


function post(url:string,otp?:request.CoreOptions) {
    return new Promise((resolve,reject)=>{
        request.post(url,otp,(error: any, response:request.Response, body: any)=>{
            if(!error && response.statusCode == 200) {
                resolve(response.body);
            }
            else {
                reject(error);
            }
        });
    })
}


export var httpRequest = {
    post:post
}