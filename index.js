//First we 'require' the 'pg' module

var AKCtl = require("./App/AKCtl");




exports.handler = function index(event, context) {
    AKCtl.configApp({
        "HOST": process.env.HOST,
        "USERNAME": process.env.USERNAME,
        "PASSWORD": process.env.PASSWORD,
        "DATABASE": process.env.DATABASE
    }).init();
};


AKCtl.configApp({
        "HOST": "hivelauncherrds2.ciw9asb47tat.us-east-1.rds.amazonaws.com",
        "USERNAME": "test",
        "PASSWORD": "Hive2013",
        "DATABASE": "minusone"
    }).init();
	