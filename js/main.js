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
	console.log("cname:"+cname)
    var db = getDatabase();
    db.transaction(function(tx){
                       tx.executeSql('DELETE FROM combo WHERE cname= ?;',[cname],
                       function (tx, results) {
                       	},function (tx, error){
				           console.log("error:"+error) 
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
		    		htmls = '<li class="mui-table-view-cell">你可能忘记打卡了</li>';
		    	}else if(p == "F"){
		    		htmls = '<li class="mui-table-view-cell">还没到这一天</li>';
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



function checkTodaySign(date){
    var db = getDatabase();
    db.transaction(function(tx){
           tx.executeSql('SELECT * FROM event WHERE startDate =? ;',[date],
           function (tx, results) {
           	var len = results.rows.length;
		    if(len == 0){
		    	//进行通知
		    	//后续进行每个打卡内容单独通知
		    	createLocalPushMsg();
		    }
		    
          },
          function(tx,error){
          });
           
      });
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

function parseMonth(date){
	var d = new Date(date);
	var year = d.getFullYear();
    var mon = d.getMonth()+1;
    return year+"-"+(mon<10?('0'+mon):mon);
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
	var x_arr = new Array();
	for(i = 0;i < 7;i++){
		x_arr.push(getBeforeDate(new Date(),6-i))
	}
	
    db.transaction(function(tx){
                           tx.executeSql('select count(1) as count,startDate from event where startDate >= ? and startDate <= ? group by startDate;',[before,today],
                           function (tx, results) {
                           	var len = results.rows.length;
							var share_counts = 0;
							var y_arr = new Array();
							var tmp_arr = new Array();
							for (i = 0; i < len; i++){
								var startDate = results.rows.item(i).startDate;
								tmp_arr.push(results.rows.item(i).startDate);
								y_arr.push(
									{
										name: results.rows.item(i).startDate,
										value:results.rows.item(i).count
									}
								);
								
								share_counts += results.rows.item(i).count;
							}
							
							
							
							for (i = 0; i < 7; i++){
								var startDate = x_arr[i];
								if(tmp_arr.indexOf(startDate) > -1){
									
								}else{
									y_arr.push(
										{
											name:startDate,
											value:0
										}
									);
								}
								
							}
							var x_array = new Array();
							var y_array = new Array();
							y_arr = y_arr.sort(by("name"));
							for(i = 0;i < y_arr.length;i++){
								x_array.push(y_arr[i].name.substring(5));
								y_array.push(y_arr[i].value);
							}
                           	callback.sumWeek(x_array,y_array);
							callback.share_counts(share_counts);
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
                           	var len = results.rows.length;
							var x_arr = new Array();
							for (i = 0; i < len; i++){
								x_arr.push({
										name:results.rows.item(i).name,
										value:results.rows.item(i).count
									});
							}
                           		callback.sumFrequence(x_arr);
                       	  },function (tx, error){
				        });
          })
}

//根据name排序数组
var by = function(name){
    return function(o, p){
        var a, b;
        if (typeof o === "object" && typeof p === "object" && o && p) {
            a = o[name];
            b = p[name];
            if (a === b) {
                return 0;
            }
            if (typeof a === typeof b) {
                return a < b ? -1 : 1;
            }
            return typeof a < typeof b ? -1 : 1;
        }
        else {
            throw ("error");
        }
    }
}

//统计本月打卡数
function signCounts(startday,endday,callback){
	var db = getDatabase();
	var date = new Date();
	var mon = date.getMonth()+1;
	console.log("startday:"+startday+",endday:"+endday);
    db.transaction(function(tx){
                           tx.executeSql('select count(1) as count,startDate from event where startDate >= ? and startDate <= ? group by startDate;',[startday,endday],
                           function (tx, results) {
                           	var len = results.rows.length;
							var x_arr = new Array();
							for (i = 0; i < len; i++){
								x_arr.push({
										name:results.rows.item(i).startDate,
										value:results.rows.item(i).count
									});
								console.log("name:"+results.rows.item(i).startDate+",value:"+results.rows.item(i).count)									
							}
							x_arr.push({
									name:"2016-06-30",
									value:1
								});
                           	callback.signcounts(x_arr);
                       	  },function (tx, error){
				        });
          })
}