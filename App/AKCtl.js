/**
 * Created by abhijit on 3/2/17.
 */

var  request = require('request'),
    async_parallel = require('async-parallel'),
    query = require("pg-query");

var AKCtl = {baseURL:function(url){return "https://53unhwyitj.execute-api.us-east-1.amazonaws.com/prod/ImageDownloaderViaNodeJS?imageurl="+url},imageResizeBaseUrl:'http://lavaimagerepo.s3-website-us-west-2.amazonaws.com'};


AKCtl.configApp = function (CONFIG) {
    query.connectionParameters=("postgres://"+CONFIG.USERNAME+":"+CONFIG.PASSWORD+"@"+CONFIG.HOST+":5432/"+CONFIG.DATABASE);
    //query.connectionParameters=("postgres://"+"test"+":"+"Hive2013"+"@"+"hivelauncherrds2.ciw9asb47tat.us-east-1.rds.amazonaws.com"+":5432/"+"lancherbackend");
    return this;
};

/***
 *
 *
 */
AKCtl.init = function () {
    var feed_id=null;
    var counter;
    var image_size_arr={
        
        "fullcard":["168","336","504"],
        "halfcard":["112x114","224x228","336x342"]
    };
    

    query('select cardtype, width, height from imagesizes',function(err,rows){

        try{
            for(counter in rows){    
                
                if(rows[counter].cardtype=='fullcard'){
                    image_size_arr.fullcard.push(rows[counter].height);
                }else{
                    image_size_arr.halfcard.push(rows[counter].width+'x'+rows[counter].height);
                }
            }

        }catch(err){
            console.log(err);
            return false;
        }
    });


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

                        var size;

                         if(row.template=='fullcard')   
                           {

                            for(size in image_size_arr.fullcard){
                                
                                url=AKCtl.imageResizeBaseUrl+'/0x'+image_size_arr.fullcard[size]+'/'+imagename;

                                request(url, function (error, response, body) {
                                    if (!error && response.statusCode == 200) {
                                        console.log('Its working '+url);
                                    }
                                });
                            }
                        }     

                        else{
                         
                            for(size in image_size_arr.halfcard){
                                
                                url=AKCtl.imageResizeBaseUrl+'/'+image_size_arr.halfcard[size]+'/'+imagename;

                                request(url, function (error, response, body) {
                                    if (!error && response.statusCode == 200) {
                                        console.log('Its working '+url);
                                    }
                                });
                            }
                        }

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
