var express = require('express');
var router = express.Router();
var config = require('config.json')('./config/config.json');

var util = require('util');

var mqtt = require('mqtt');

var mysql = require('mysql');
var conn = mysql.createConnection({
	host      : config.rds.host,
	user      : config.rds.user,
	password  : config.rds.password,
	database  : config.rds.iotdatabase
});

conn.connect();

/* GET home page. */
router.get(['/', '/:id'], function(req, res, next) {
  var myName = config.rds.user;
	var topicId = req.params.id;
	var topicSeq = null;
	var mqtt_client = config.iot.mqttproxy;

  var sql = 'SELECT * FROM cnt';

  conn.query(sql, function(err, rows, fields){
  	if(err){
  		console.log(err);
  	}else{
  		if(!rows.length){
  			console.log("Missing DB data.");
  		}else{
				var sRows = JSON.stringify(rows);
				var pRows = JSON.parse(sRows);

				for(var i = 0; i < rows.length; i++){
					if(rows[i].id == topicId){
							topicSeq = i;
					}
				}
				var message = mqtt_req_connect(mqtt_client);


				res.render('iot', { title: 'KYM coms', rows: pRows, id:topicId , message : message});

			}
		}
  });

});


function mqtt_req_connect(brokerip) {
		var usemqttaeid = config.iot.mqttaeid;
    var req_topic = util.format('/oneM2M/req/+/%s/#', usemqttaeid);
    var mqtt_client = mqtt.connect('mqtt://' + brokerip);

    mqtt_client.on('connect', function () {
        mqtt_client.subscribe(req_topic);

				var message = "connect"

				console.log(message);

				return message;
    });

    mqtt_client.on('message', function (topic, message) {
        //var topic_arr = topic.split("/");
				console.log(message);

				return message;
    });
}

module.exports = router;
