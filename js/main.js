function getDatabase() {
     return openDatabase("huihuisignin", "1.0", "huihui", 10000);
}

function initialize(){
    var db = getDatabase()
    db.transaction(function(tx){
        tx.executeSql("CREATE TABLE IF NOT EXISTS event (name TEXT, startDate TEXT, startTime TEXT, primary key (name,startDate))");
        tx.executeSql('CREATE TABLE IF NOT EXISTS combo(cname TEXT UNIQUE, ctitle TEXT)');

       });
}

function addCombo(cname, ctitle){
    var db = getDatabase();
    var res = true;
    db.transaction(function(tx){
                       tx.executeSql('INSERT OR REPLACE INTO combo VALUES (?,?);',[cname, ctitle],
                       function(tx,results){
         
                       },function (tx, error){
				            res = false;
				        }
                       );
                       
                   })
    return res;
}


function loadCombo(eventsCallback){
	
    var db = getDatabase();
    db.transaction(function(tx){
    	tx.executeSql('SELECT * FROM combo', [], 
    	function (tx, results) {
    		var htmlList = new Array();
		    var len = results.rows.length;
		    for (i = 0; i < len; i++){
		    	htmlList[i] = results.rows.item(i).ctitle;
		    }
		   eventsCallback.combo(htmlList);
		},
    	function (tx,error){
    	  	
    	});
		
	    })
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
    var flag = true;
    db.transaction(function(tx){
                       var rs = tx.executeSql('delete from event where name =? and startDate = ?;',[name,date],
                       function (tx, results) {
                       },function (tx, error){
				            flag = false;
				        });
                   })
    return flag;
}


function insertData(name,date,stime){
    var db = getDatabase();
    db.transaction(function(tx){
                      tx.executeSql('INSERT or REPLACE into event values(?,?,?);',[name,date,stime],
                      function (tx, results){
                      },function (tx, error){
				      })
                   })
}


function eventsForDate(date,eventsCallback){
    var db = getDatabase();
    db.transaction(function(tx){
    	
           tx.executeSql('SELECT * FROM event WHERE startDate =? ;',[date],
           function (tx, results) {
           	
           	var len = results.rows.length;
		    var htmls = ""
		    for (i = 0; i < len; i++){
		    	htmls += '<li class="mui-table-view-cell">'+
					'<span>'+results.rows.item(i).name+ '</span>'+
					'<div class="mui-switch mui-switch-blue mui-switch-mini mui-switch-active">'+
						'<div class="mui-switch-handle"></div>'+
					'</div>'+
				'</li>';
				
			}
		    if(len == 0){
		    	var p = compareDate(date);
		    	if(p == "P"){
		    		htmls = '<li class="mui-table-view-cell">今天你没有打卡</li>';
		    	}else if(p == "F"){
		    		htmls = '<li class="mui-table-view-cell">请当天再来打卡</li>';
		    	}else{
		    		//htmls = '<li class="mui-table-view-cell">点击左上角日期或按菜单键进入打卡内容管理进行添加</li>';
		    	}
		    }
		    
		    eventsCallback.init(htmls);
          },
          function(tx,error){
          	var htmls = '<li class="mui-table-view-cell">哎呀，出错了╮(╯▽╰)╭</li>';
          	eventsCallback.init(htmls);
          })
           
       })
    //return model;
}

function hasfeature(date){
    var db = getDatabase();
    var flag = false;
    db.transaction(function(tx){
                tx.executeSql('SELECT 1 FROM event WHERE startDate = ?;',[date],function (tx, results) {
                	flag = results.rows.length >0
                })
                           
       			})
    return flag;
}


//添加打卡内容

function addSignFun(cname,ctitle,callback){
	var db = getDatabase();
    db.transaction(function(tx){
                           tx.executeSql('select * from combo where cname = ?;',[cname],
                           function (tx, results) {
                           	if(results.rows.length > 0){
                           		callback.alert(ctitle);
                           	}else{
                           		addCombo(cname,ctitle);
                           		callback.initload();
                           	}
                       	  },function (tx, error){
				            res = false;
				        });
          })
}



//比较两个日期
function compareDate(date){
	var today = new Date();
	date = new Date(date);
	var today_str = today.getFullYear() +"-"+ (today.getMonth()+1) +"-"+ today.getDate();
	var date_str = date.getFullYear() +"-"+ (date.getMonth()+1) +"-"+ date.getDate();
	if(today_str > date_str){
		//过去的日子
		return "P";//pass
	}else if(today_str < date_str){
		//将来的日子
		return "F";//future
	}else{
		//今天
		return "N";//now
	}
}

//处理日期
function parseDate(date){
	var d = new Date(date);
	return d.getFullYear() +"-"+ (d.getMonth()+1) +"-"+ d.getDate();
}
