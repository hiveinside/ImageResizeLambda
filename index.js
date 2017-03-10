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
