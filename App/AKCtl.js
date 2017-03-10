/**
 * Created by abhijit on 3/2/17.
 */

var  request = require('request'),
    async_parallel = require('async-parallel'),
    query = require("pg-query");

var AKCtl = {baseURL:function(url){return "https://53unhwyitj.execute-api.us-east-1.amazonaws.com/prod/ImageDownloaderViaNodeJS?imageurl="+url},imageResizeBaseUrl:'http://lavaimagerepo.s3-website-us-west-2.amazonaws.com'};


AKCtl.configApp = function (CONFIG) {
    query.connectionParameters=("postgres://"+CONFIG.USERNAME+":"+CONFIG.PASSWORD+"@"+CONFIG.HOST+":5432/"+CONFIG.DATABASE);
    return this;
};

/***
 *
 *
 */
AKCtl.init = function () {
    var feed_id=null;



    query('select * from lambdaconfig', function(err, rows) {

        try{
            var feed_id=(rows[0].feed_id|0);
        }catch(e){
            return false;
        }


        query("select id,img_hdpi,template from feeds where id>"+rows[0].feed_id+' order by id asc', function(err, rows) {



            async_parallel.concurrency = 100;
                        
            async_parallel.each(rows, function (row) {
                var imageEncodedURL=AKCtl.baseURL(encodeURIComponent(row.img_hdpi));

                console.log("Requesting for "+row.img_hdpi);
                request(imageEncodedURL, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        console.log(body);

                        imagenameArr=row.img_hdpi.split('\/');
                        imagename=imagenameArr[imagenameArr.length-1];

                         if(row.template=='fullcard')   
                           {
                            url=AKCtl.imageResizeBaseUrl+'/0x168/'+imagename;
                        }     

                        else{
                            url=AKCtl.imageResizeBaseUrl+'/112x114/'+imagename;
                        }

                     request(url, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            console.log('Its working '+url);
                        }


                    
                });

                 }

            });

            try{
                var new_feed_id=(rows[rows.length-1].id);
            }catch(e){
               return false;
            }

                query('update lambdaconfig set feed_id='+new_feed_id, function(err) {
                    console.log(err);
                });

            console.log("New Images count"+(new_feed_id-feed_id));
        });
    });



});
    /***
     * select * from lambdaconfig
     * select img_hdpi from feeds order by id desc limit 1
     */



};

module.exports = AKCtl;
