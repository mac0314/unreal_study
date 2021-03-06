
var db_sql = require('./sql_action');


exports.map_user = function(parentId, childId, topic, deviceToken, callback){
  db_sql.insert_user_map_user(parentId, childId, topic, function(error, results_map){
    var resultObject = new Object();

    if(error){
      resultObject.mapping = false;

      resultObject.mappingData = null;

      callback(true, resultObject);
    }else{
      resultObject.mapping = true;

      var userMapObject = new Object();

      userMapObject.topic = topic;
      userMapObject.parentId = parentId;
      userMapObject.childId = childId;

      resultObject.mappingData = userMapObject;

      var resultJson = JSON.stringify(resultObject);

      callback(null, resultJson);
    }
  });
};

exports.load_map_user = function(userId, userRole, callback){
  if(userRole == "parent"){
    db_sql.select_parent_map_user(userId, function(error, results_map){
      if(error){
        callback(true, results_map);
      }else{
        callback(null, results_map);
      }
    });
  }else if(userRole == "child"){
    db_sql.select_child_map_user(userId, function(error, results_map){
      if(error){
        callback(true, results_map);
      }else{
        callback(null, results_map);
      }
    });
  }


};
