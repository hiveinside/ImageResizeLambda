/**
 * Created by abhijit on 3/2/17.
 */

var  request = require('request'),
    async_parallel = require('async-parallel'),
    promise_pg = require("promise-pg");

var AKCtl = {baseURL:function(url){return "https://53unhwyitj.execute-api.us-east-1.amazonaws.com/prod/ImageDownloaderViaNodeJS?imageurl="+url}};


AKCtl.configApp = function (CONFIG) {
    this.pg=promise_pg.connect("postgres://"+CONFIG.USERNAME+":"+CONFIG.PASSWORD+"@"+CONFIG.HOST+":5432/"+CONFIG.DATABASE);
    return this;
};

/***
 *
 *
 */
AKCtl.init = function () {

    this.pg.spread(function(client, done) {
        var query = client.query({
            text: "select * from feeds order by id desc limit 1000",
            buffer: true //if set to true, adds all the rows to the result object available on the rows property on the promise resolve value
        }).promise.then(
            function(result) {

                async_parallel.concurrency = 100;

                async_parallel.each(result.rows, function (row) {
                    var imageEncodedURL=AKCtl.baseURL(encodeURIComponent(row.img_hdpi));

                    console.log("Requesting for "+row.img_hdpi);
                    request(imageEncodedURL, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            console.log(body);
                        }
                    });

                });

            }, //rowCount etc
            function(err) { throw err; },
            function(row) {//console.log(row.img_hdpi);
            } //for each row
        ).finally(done);
    }).done();


};

module.exports = AKCtl;
