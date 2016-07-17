/**
 * 本地创建一条推动消息
 */
function createLocalPushMsg(){
	var options = {cover:true};
	var str = "Oh Dear,看上去";
	str += "你还没有打卡 "
	plus.push.createMessage( str, "LocalMSG", options );
	if(plus.os.name=="iOS"){
		//plus.nativeUI.toast('*如果无法创建消息，请到"设置"->"通知"中配置应用在通知中心显示!');
	}
}
/**
 * 清空所有推动消息
 */
function clearAllPush(){
	plus.push.clear();
	//outSet( "清空所有推送消息成功！" );
}