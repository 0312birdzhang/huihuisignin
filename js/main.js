function getDatabase() {
     return openDatabase("huihuisignin", "1.0", "huihui", 10000);
}

function initialize(){
    var db = getDatabase()
    db.transaction(function(tx){
        tx.executeSql("CREATE TABLE IF NOT EXISTS event (name TEXT, startDate DATE, startTime TEXT, primary key (name,startDate))");
        tx.executeSql('CREATE TABLE IF NOT EXISTS combo(cname TEXT UNIQUE, ctitle TEXT)');

       });
}

function addCombo(cname, ctitle){
    var db = getDatabase();
    var res = false;
    console.log("outer:"+res)
    db.transaction(function(tx){
                       tx.executeSql('INSERT OR REPLACE INTO combo VALUES (?,?);',[cname, ctitle],function(tx,results){
                       		res = results.rowsAffected > 0 ? true:false;
                       		console.log("inner:"+res)
                       });
                       
                   })
    console.log("last:"+res)
    return res;
}


function loadCombo(){
		var html ="";
    var db = getDatabase();
    db.transaction(function(tx){
    	tx.executeSql('SELECT * FROM combo', [], function (tx, results) {
	    var len = results.rows.length;
	    console.log(len)
	    for (i = 0; i < len; i++){
	       html += '<li class="mui-table-view-cell">'+
	       						'<div class="mui-slider-right mui-disabled">'+
	       						'<a class="mui-btn mui-btn-red">删除</a>'+
	       						'</div>'+
	       						'<div class="mui-slider-handle mui-table">'+
	       						'<div class="mui-table-cell">'+
	       							results.rows.item(i).ctitle+
	       						'</div></div></li>'
			     }
			 	});
		
	    })
   return html;
	}

function isExist(cname){
    var flag = false;
    var db = getDatabase();
    db.transaction(function(tx){
                           tx.executeSql('select * from combo where cname = ?;',[cname],function (tx, results) {
                           	if(results.rows.length>0){
                                flag = true;
                            };
                       });
          })
                            
    return flag;
}


function removeCombo(cname){
    var db = getDatabase();
    db.transaction(function(tx){
                       tx.executeSql('DELETE FROM combo WHERE cname= ?;',[cname],function (tx, results) {
                       	});
                   })
}


function isChecked(name,date){
    var flag = false;
    var db = getDatabase();
    db.transaction(function(tx){
                         tx.executeSql('select * from event where name = ? and startDate = ?;',[name,date],function (tx, results) {
                         	if(results.rows.length>0){
                                flag = true;
                            }
                       	});
                       });
    return flag;
}


function deleteData(name,date){
    var db = getDatabase();
    var flag = false;
    db.transaction(function(tx){
                       var rs = tx.executeSql('delete from event where name =? and startDate = ?;',[name,date],function (tx, results) {
                         	if(results.rows.length>0){
                                flag = true;
                            }
                       });
                   })
    return flag;
}


function insertData(name,date,stime){
    var db = getDatabase();
    var res = false;
    db.transaction(function(tx){
                      tx.executeSql('INSERT or REPLACE into event values(?,?,?);',[name,date,stime],function (tx, results) {
                       		res = results.rowsAffected > 0;
                       })
                   })
    return res;
}


function eventsForDate(model,date){
    var db = getDatabase();
    db.transaction(function(tx){
           tx.executeSql('SELECT * FROM event WHERE ? >= startDate AND ? <= startDate;',[date,date],function (tx, results) {
           	for (var i=0, l = results.rows.length; i < l; i++){
               var t = results.rows.item(i);
               model.append({
                                "name":t.name,
                                "startDate":t.startDate,
                                "startTime":t.startTime
                            })
           }
           })
           
       })
    return model;
}

function hasfeature(date){
    initialize();
    var db = getDatabase();
    var flag = false;
    db.transaction(function(tx){
                tx.executeSql('SELECT * FROM event WHERE ? >= startDate AND ? <= startDate;',[date,date],function (tx, results) {
                	flag = results.rows.length >0
                })
                           
       			})
    return flag;
}


