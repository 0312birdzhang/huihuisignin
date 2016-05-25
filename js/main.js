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
                      	mui.toast("打卡失败！")
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
					'<div class="mui-switch mui-switch-blue mui-switch-mini mui-active">'+
						'<div class="mui-switch-handle"></div>'+
					'</div>'+
				'</li>';
			}
		    if(len == 0){
		    	var p = compareDate(date);
		    	if(p == "P"){
		    		htmls = '<li class="mui-table-view-cell">这天你没有打卡</li>';
		    	}else if(p == "F"){
		    		htmls = '<li class="mui-table-view-cell">还没到这一天呢</li>';
		    	}else{
		    		//htmls = '<li class="mui-table-view-cell">点击左上角菜单键进入打卡内容管理进行添加</li>';
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
				        });
          })
}



//比较两个日期
function compareDate(date){
	var today = new Date();
	date = new Date(date);
	if(today.getTime() > date.getTime()){
		//过去的日子
		return "P";//pass
	}else if(today.getTime() < date.getTime()){
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
	var year = d.getFullYear();
    var mon = d.getMonth()+1;
    var day=d.getDate();
    return year+"-"+(mon<10?('0'+mon):mon)+"-"+(day<10?('0'+day):day)
}

//获取d日期前的n天日期
function getBeforeDate(d,n){
    var year = d.getFullYear();
    var mon = d.getMonth()+1;
    var day=d.getDate();
    var hour = d.getHours();
    if(day <= n){
        if(mon>1) {
            mon=mon-1;
        }
        else {
            year = year-1;
            mon = 12;
        }
    }
    d.setDate(d.getDate()-n);
    year = d.getFullYear();
    mon=d.getMonth()+1;
    day=d.getDate();
    var s = year+"-"+(mon<10?('0'+mon):mon)+"-"+(day<10?('0'+day):day);
    return s;
}

//统计一周打卡数
function sumWeek(callback){
	var db = getDatabase();
	var today = parseDate(new Date());
	var before = getBeforeDate(new Date(),7);
    db.transaction(function(tx){
                           tx.executeSql('select count(1) as count from event where startDate >= ? and startDate <= ?;',[before,today],
                           function (tx, results) {
                           	callback.sumWeek(results);
                       	  },function (tx, error){
				        });
          })
}

//统计一周打卡频率最高的
function sumFrequence(callback){
	var db = getDatabase();
	var today = parseDate(new Date());
	var before = getBeforeDate(new Date(),7);
    db.transaction(function(tx){
                           tx.executeSql('select name,count(1) as count from event where startDate >= ? and startDate <= ? group by name;',[before,today],
                           function (tx, results) {
                           	callback.sumFrequence(results);
                       	  },function (tx, error){
				        });
          })
}