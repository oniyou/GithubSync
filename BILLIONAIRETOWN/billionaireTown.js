/*

富豪小镇
下载地址：https://hyskgame.com/apps/fuhaoxiaozhen/wxshare/index.html?createAt=1620856931&senderUserId=210824&senderInviteCode=FCNX&entryPointData=eyJzZW5kZXJVc2VySWQiOiIyMTA4MjQifQ

圈X

[rewrite_local]
#富豪小镇
https://sunnytown.hyskgame.com/api/messages\SaccessToken=\w+&msgtype=system_getGpvGameOptions url script-request-body billionairesTown.js

[MITM]
hostname = sunnytown.hyskgame.com

#loon
https://sunnytown.hyskgame.com/api/messages\SaccessToken=\w+&msgtype=system_getGpvGameOptions url script-request-body billionairesTown.js, requires-body=true, timeout=10, tag=富豪小镇

#surge
富豪小镇 = type=https://sunnytown.hyskgame.com/api/messages\SaccessToken=\w+&msgtype=system_getGpvGameOptions,requires-body=1,max-size=0,script-path=billionairesTown.js,script-update-interval=0

[task_local]
# 富豪小镇
10 * * * * billionairesTown.js, tag=富豪小镇, enabled=true

*/


const $ = new Env('富豪小镇');
let status;
status = (status = ($.getval("status") || "1")) > 1 ? `${status}`: ""; // 账号扩展字符 
const headerArr = [], idArr = [];
//let times = Math.round(Date.now() / 1000);
let header = $.getdata('header'); 
let token = $.getdata('token');
const logs = 1;  // 日志开关
const isFirst = 0;  // 是否第一次运行此脚本
// 时间节点
const date = new Date();
const hour = date.getHours();
const minute = date.getMinutes();


// 各个请求body常量，暂时在此书申明
let accelerateAllBody = '[{"type":"farmland_speedUpAll","data":{"farmlandDefId":0}}]';

let accelerateBody = '[{"type":"farmland_speedUp","data":{"farmlandDefId":1,"priceType":3001}}]';

let guardBody = '[{"type":"pet_buyPet","data":{}}]';

let chargeBody = '[{"type":"pet_feedPetFood","data":{}}]';

let drawBody = '[{"type":"lottery_draw","data":{"priceType":3001}}]';

let carBody = '[{"type":"carBox_receiveCarReward","data":{}}]';

let balloonBody = '[{"type":"carBox_receiveBoxReward","data":{}}]';

let repairBody = '[{"type":"farmland_repair","data":{"farmlandDefId":1}}]';

let collectBody = '[{"type":"farmland_harvest","data":{"farmlandDefId":1}}]';

let produceBody = '[{"type":"farmland_plant","data":{"farmlandDefId":1,"priceType":3001}}]';

// 农田ID
let farmlandDefId = 1;

// start here
! (async() => {
    if (typeof $request !== "undefined") {
        await getCookie()
    } else {
        headerArr.push($.getdata('header'));  
		let count = ($.getval('count') || '1');
        for (let i = 2; i <= count; i++) {
            headerArr.push($.getdata(`header${i}`))
            idArr.push($.getdata(`id${i}`))
        }
        console.log(`-------------共${headerArr.length}个账号-------------\n`) 
        for (let i = 0; i < headerArr.length; i++) {
            if (headerArr[i]) {
                header = headerArr[i];
                id = idArr[i];
                $.index = i + 1;
                console.log(`\n开始【富豪小镇${$.index}】`); 

                // 机器管家(第一次使用脚本请打开开关)
                if (isFirst) {
                  await guard()
                  await $.wait(4500) 
                }               
                
                $.log(`\nnow time minute is : ${minute}`)
                
                // 管家充电
                if (minute >= 5 && minute < 10) {
                  await charge()                
                  await $.wait(4500)                  
                }
                
                // 全体加速
                if (minute >= 10 && minute < 15) {
                  await accelerateAll()
                  await $.wait(4500)                 
                }                
               
                // 物资车
                if (minute === 15 || minute === 25 || minute === 35 || minute === 45 || minute === 55) {
                  await carBox()             
                  await $.wait(4500)  
                }                  
                              
                // 热气球
                if (minute === 20 || minute === 30 || minute === 40 || minute === 50) {
                  await balloon()             
                  await $.wait(4500)                
                }               
				             
                // 开始农田作业
                for (i=1; i<10; i++) {
                  farmlandDefId = i
                  // 加速
                  await accelerate()
                  await $.wait(4500)
                  // 修理
                  await repair();
                  await $.wait(4500)
                  // 收取
                  await collect(i)
                  await $.wait(4500)
                  // 生产
                  await produce(i);
                  await $.wait(4500)
                }
                
                // 偷金币                
                await steelCoin()
                await $.wait(7500)
                
                // 自动抽奖
                if((minute >= 30 && minute < 35) || (minute >= 10 && minute < 15)){
				//	await $.wait(1300)
                  await draw()
                  await $.wait(4500) 
                }
                
                // 每日金币
               // if (minute >= 5 && minute < 10) {
                  await dailyCoin()
                  await $.wait(4500)
               // }
                
                // 领加速器
                if (minute >= 15 && minute < 20 || (minute >= 45 && minute < 50)) {
                  await progressInfo()
                  await $.wait(4500)
                }                            
                
                // 打卡提现
                if (hour === 8 && minute === 40) {
                  await checkInInfo() 
                }
                
                // 出售商品
               // if (hour === 9 && minute === 50) {
                  await getItemList() 
               // }
                
            }
        }
    }
})().
catch((e) => $.logErr(e)).
finally(() => $.done())

// 数据获取 
function getCookie () {
    if ($request.url.indexOf("system_getGpvGameOptions") > -1) {
        const url = $request.url;
        let id = url.match(/accessToken=(\S+&)/)[1];
        if (id) $.setdata(id, `token${status}`);
        const header = JSON.stringify($request.headers);
        if (header) $.setdata(header, `header${status}`); 
        $.msg($.name, "", '富豪小镇' + `${status}` + '数据获取成功！')
    }
}

// 每日金币
async function dailyCoin () {
    return new Promise((resolve) => {
        let options = {
            url: 'https://sunnytown.hyskgame.com/api/messages?accessToken=' + token + 'msgtype=dailyQuest_getQuestList',
            headers: JSON.parse(header),
            body: `[{"type":"dailyQuest_getQuestList","data":{"questType":1}}]`,
        }
        $.post(options, async(err, resp, data) => {
            try {
			    if (logs) console.log(`\n`+data);
                if (data.match(/dailyQuest_getQuestList/) == 'dailyQuest_getQuestList') {
                    let list = JSON.parse(data)[0].data.questList;
                    let obj = {};
                    if (list && Array.isArray(list)) {
                        for (x= 0; x<list.length; x++) {
                            obj = list[x];
                            if (obj.stateCode === 1 && obj.questDefId === 1002) {
                              $.log(`\n每日金币任务${obj.questDefId}看视频任务免费次数不足，尝试增加任务进度...`)
                              await $.wait(5500)
                              await addProgress(1, obj.questDefId)
                            } else if (obj.stateCode === 2) {
                              $.log(`\n$每日金币任务${obj.questDefId}已完成，开始获取奖励...`)
                              await $.wait(1300)
        					   await progressReward(1, obj.questDefId)
                            }                         
                        }
                    }
                } else {
                    $.log(`\n每日金币列表获取失败`)
                }
            } catch(e) {
                $.logErr(e, resp);
            } finally {
                resolve()
            }
        })
    })
}

// 进度奖励
async function progressReward (questType, questDefId) {
    return new Promise((resolve) => {
        let options = {
            url: 'https://sunnytown.hyskgame.com/api/messages?accessToken=' + token + 'msgtype=dailyQuest_receiveReward',
            headers: JSON.parse(header),
            body: `[{"type":"dailyQuest_receiveReward","data":{"questDefId":${questDefId},"questType":${questType}}}]`
        }
        $.post(options, async(err, resp, data) => {
            try {
    			if (logs) console.log(`\n`+data);
                if (data.match(/dailyQuest_receiveReward/) == 'dailyQuest_receiveReward') {
                    let info = JSON.parse(data)[1].data.questInfo;
                    $.log(`\n视频进度增加成功，${info.title}获得金币: ${info.rewardProp.number}`)
                } else {
                    $.log(`\n视频进度增加失败，${questDefId}领取奖励失败`)
                }
            } catch(e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        })
    })
}

// 偷金币用户列表
async function steelCoin () {
    return new Promise((resolve) => {
        let options = {
            url: 'https://sunnytown.hyskgame.com/api/messages?accessToken=' + token + 'msgtype=stealingVege_getStealingVege',
            headers: JSON.parse(header),
            body: `[{"type":"stealingVege_getStealingVege","data":{}}]`,
        }
        $.post(options, async(err, resp, data) => {
            try {
    			if (logs) console.log(`\n`+data);
                if (data.match(/stealingVege_getStealingVege/) == 'stealingVege_getStealingVege') {
                    let ticket = JSON.parse(data)[0].data.stealingVege.tickets;
                    if (ticket > 0) {
                        let list = JSON.parse(data)[0].data.stealingVege.targetUsers;
                        let obj = {};
                        if (list && Array.isArray(list)) {
                            let needRefresh = true;
                            for (x= 0; x<list.length; x++) {
                                obj = list[x];
                                if (obj.state == 0 && ticket > 0) {
                                  $.log(`\n开始偷用户金币...`)
                                  await $.wait(1300);
                                  await steelUserCoin(obj.id);
                                  ticket -= 1;
                                  needRefresh = false
                                }                   
                            }
                            if (needRefresh) {
                                $.log(`\n开始刷新偷金币用户列表...`)
                                await $.wait(1300)
                                await steelCoinFresh()
                            }
                        }
                    } else {
                        $.log(`\n偷金币次数不足，尝试获得偷金币次数...`)
                        await $.wait(1300)
                        await addTicket();
                    }                   
                } else {
                    $.log(`\n偷金币用户列表获取失败`)
                }
            } catch(e) {
                $.logErr(e, resp);
            } finally {
                resolve()
            }
        })
    })
}

// 偷金币刷新用户列表
async function steelCoinFresh () {
    return new Promise((resolve) => {
        let options = {
            url: 'https://sunnytown.hyskgame.com/api/messages?accessToken=' + token + 'msgtype=stealingVege_refreshTargetUsers',
            headers: JSON.parse(header),
            body: `[{"type":"stealingVege_refreshTargetUsers","data":{}}]`,
        }
        $.post(options, async(err, resp, data) => {
            try {
    			if (logs) console.log(`\n`+data);
                if (data.match(/stealingVege_refreshTargetUsers/) == 'stealingVege_refreshTargetUsers') {
                    let list = JSON.parse(data)[0].data.stealingVege.targetUsers;
                    let obj = {};
                    if (list && Array.isArray(list)) {
                        for (x= 0; x<list.length; x++) {
                            obj = list[x];
                            if (obj.state == 0) {
                              $.log(`\n刷新偷金币用户列表成功，开始偷用户金币...`)
                              await $.wait(1300)
                              await steelUserCoin(obj.id)
                              break;
                            }                   
                        }
                    }
                } else {
                    $.log(`\n偷金币用户列表获取失败`)
                }
            } catch(e) {
                $.logErr(e, resp);
            } finally {
                resolve()
            }
        })
    })
}

// 增加偷金币机会
async function addTicket () {
    return new Promise((resolve) => {
        let options = {
            url: 'https://sunnytown.hyskgame.com/api/messages?accessToken=' + token + 'msgtype=stealingVege_addTicket',
            headers: JSON.parse(header),
            body: `[{"type":"stealingVege_addTicket","data":{}}]`
        }
        $.post(options, async(err, resp, data) => {
            try {
                if (logs) console.log(`\n金币机会返回`+data);
                if (data.match(/stealingVege_addTicket/) == 'stealingVege_addTicket') {
                    $.log(`\n增加偷金币次数成功`)
                } else {
                    $.log(`\n增加偷金币次数失败`)
                }
            } catch(e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        })
    })
}


// 偷用户金币
async function steelUserCoin (recordId) {
    return new Promise((resolve) => {
        let options = {
            url: 'https://sunnytown.hyskgame.com/api/messages?accessToken=' + token + 'msgtype=stealingVege_attackTarget',
            headers: JSON.parse(header),
            body: `[{"type":"stealingVege_attackTarget","data":{"recordId":${recordId}}}]`
        }
        $.post(options, async(err, resp, data) => {
            try {
                if (logs) console.log(`\n`+data);
                if (data.match(/stealingVege_attackTarget/) == 'stealingVege_attackTarget') {
                    $.log(`\n偷用户金币成功`)
                } else {
                    $.log(`\n偷金币金币${recordId}失败`)
                }
            } catch(e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        })
    })
}


// 加速器列表
async function progressInfo () {
    return new Promise((resolve) => {
        let options = {
            url: 'https://sunnytown.hyskgame.com/api/messages?accessToken=' + token + 'msgtype=dailyQuest_getQuestList',
            headers: JSON.parse(header),
            body: `[{"type":"dailyQuest_getQuestList","data":{"questType":2}}]`,
        }
        $.post(options, async(err, resp, data) => {
            try {
    			if (logs) console.log(`\n`+data);
                if (data.match(/dailyQuest_getQuestList/) == 'dailyQuest_getQuestList') {
                    let list = JSON.parse(data)[0].data.questList;
                    let obj = {};
                    if (list && Array.isArray(list)) {
                        for (x= 0; x<list.length; x++) {
                            obj = list[x];
                            if (obj.stateCode === 1) {
                              $.log(`\n加速器视频任务${obj.questDefId}开始加进度...`)
                              await $.wait(4500)
                              await addProgress(2, obj.questDefId)
                              break;
                            }                            
                        }
                    }
                } else {
                    $.log(`\n加速器列表获取失败`)
                }
            } catch(e) {
                $.logErr(e, resp);
            } finally {
                resolve()
            }
        })
    })
}


// 看视频加进度
async function addProgress (questType, questDefId) {
    return new Promise((resolve) => {
        let options = {
            url: 'https://sunnytown.hyskgame.com/api/messages?accessToken=' + token + 'msgtype=dailyQuest_addProgress',
            headers: JSON.parse(header),
            body: `[{"type":"dailyQuest_addProgress","data":{"questDefId":${questDefId},"questType":${questType}}}]`,
        }
        $.post(options, async(err, resp, data) => {
            try {
    			 if (logs) console.log(`\n`+data);
                if (data.match(/dailyQuest_addProgress/) == 'dailyQuest_addProgress') {
                    let obj = JSON.parse(data)[0].data.questInfo;
                    if (obj.stateCode === 2) {
    				    $.log(`加进度成功`);
    				    await $.wait(4500)
                        await progressReward(questType, obj.questDefId)
                    }
                } else {
                    try {
                        $.log(`\n看视频加进度失败,` + data.match(/rawMessage\":\"([A-Z\_]+)\",/)[1])                         
                    } catch (e) {
                        $.log('解析错误', e);
                        $.log(`\n看视频加进度失败,` + data.match(/rawMessage\":\"([A-Z\_]+)\"}/)[1])                      
                    }
                }
            } catch(e) {
                $.logErr(e, resp);
            } finally {
                resolve()
            }           
        })
    })
}


// 抽奖
async function draw () {
    return new Promise((resolve) => {
        let options = {
            url: 'https://sunnytown.hyskgame.com/api/messages?accessToken=' + token + 'msgtype=lottery_draw',
            headers: JSON.parse(header),
            body: drawBody,
        }
        $.post(options, async(err, resp, data) => {
            try {
    			if (logs) console.log(`\n`+data);
                if (data.match(/lottery_draw/) == 'lottery_draw') {
                    $.log(`\n抽奖成功剩余次数: ` + data.match(/remainingTimes":(\d+),/)[1])
                } else {
                   // $.log(`\n抽奖次数不足`)
					   $.log(`\n抽奖失败,` + data.match(/rawMessage\":\"([A-Za-z\_\s\.]+)\",/)[1])
                }
            } catch(e) {
                $.logErr(e, resp);
            } finally {
                resolve()
            }
        })
    })
}

// 开启管家
async function guard () {
    return new Promise((resolve) => {
        let options = {
            url: 'https://sunnytown.hyskgame.com/api/messages?accessToken=' + token + 'msgtype=pet_buyPet',
            headers: JSON.parse(header),
            body: guardBody,
        }
        $.post(options, async(err, resp, data) => {
            try {
    			if (logs) console.log(`\n`+data);
                if (data.match(/pet_buyPet/) == 'pet_buyPet') {
                    $.log(`\n机器管家开启成功: `); 
					await charge();
                } else {
                    $.log("\n机器管家开启失败或已经开启")
                }
            } catch(e) {
                $.logErr(e, resp);
            } finally {
                resolve()
            }
        })
    })
}

// 管家充电
async function charge () {
    return new Promise((resolve) => {
        let options = {
            url: 'https://sunnytown.hyskgame.com/api/messages?accessToken=' + token + 'msgtype=pet_feedPetFood',
            headers: JSON.parse(header),
            body: chargeBody,
        }
        $.post(options, async(err, resp, data) => {
            try {
    			if (logs) console.log(`\n`+data);
                if (data.match(/pet_feedPetFood/) == 'pet_feedPetFood') {
                    $.log(`\n充电成功剩余次数: ` + data.match(/remainingFeedTimes":(\d+),/)[1])
                } else {
                    $.log(`\n机器管家充电失败`)
                }
            } catch(e) {
                $.logErr(e, resp);
            } finally {
                resolve()
            }
        })
    })
}


// 领取物资车
async function carBox () {
    return new Promise((resolve) => {
        let options = {
            url: 'https://sunnytown.hyskgame.com/api/messages?accessToken=' + token + 'msgtype=carBox_receiveCarReward',
            headers: JSON.parse(header),
            body: carBody,
        }
        $.post(options, async(err, resp, data) => {
            try {
    			if (logs) console.log(`\n`+data);            
                if (data.match(/carBox_receiveCarReward/) == 'carBox_receiveCarReward') {
                    $.log(`\n物资车领取成功，剩余次数: ` + data.match(/carRemainingTimes":(\d+),/)[1])                    
                } else {
                    $.log(`\n物资车领取失败，次数不足或速度太快`)                    
                }
            } catch(e) {
                $.logErr(e, resp);
            } finally {
                resolve()
            }
        })
    })
}

// 开启热气球
async function balloon () {
    return new Promise((resolve) => {
        let options = {
            url: 'https://sunnytown.hyskgame.com/api/messages?accessToken=' + token + 'msgtype=carBox_receiveBoxReward',
            headers: JSON.parse(header),
            body: balloonBody,
        }
        $.post(options, async(err, resp, data) => {
            try {
    			if (logs) console.log(`\n`+data);            
                if (data.match(/carBox_receiveBoxReward/) == 'carBox_receiveBoxReward') {
                    $.log(`\n热气球 / 热气球开启成功，剩余次数: ` + data.match(/boxRemainingTimes":(\d+),/)[1])                    
                } else {
                    $.log(`\n热气球开启失败，次数不足或速度太快`)                    
                }
            } catch(e) {
                $.logErr(e, resp);
            } finally {
                resolve()
            }
        })
    })
}


/* ----------------------------------------- 流程：加速 ==》修理 ==》收取 ==》生产 -------------------------------------------- */

//修理部分
async function repair () {
    return new Promise((resolve) => {
        repairBody = repairBody.replace(/farmlandDefId\":\d/, `farmlandDefId":${farmlandDefId}`);
//        $.log(`\n`+repairBody);
        let options = {
            url: 'https://sunnytown.hyskgame.com/api/messages?accessToken=' + token + 'msgtype=farmland_repair',
            headers: JSON.parse(header),
            body: repairBody,
        }
        $.post(options, async(err, resp, data) => {
            try {
    			if (logs) console.log(`\n`+data);
                if (data.match(/farmland_repair/) == 'farmland_repair') {
                    $.log(`\n${farmlandDefId}号田修理成功`)
                } else {
                    $.log(`\n${farmlandDefId}号田无需修理`)
                }
            } catch(e) {
                $.logErr(e, resp);
            } finally {
                resolve()
            }
        })
    })
}

//收取
async function collect () {
    return new Promise((resolve) => {
        collectBody = collectBody.replace(/farmlandDefId\":\d/, `farmlandDefId":${farmlandDefId}`);
//        $.log(`\n`+collectBody);
        let options = {
            url: 'https://sunnytown.hyskgame.com/api/messages?accessToken=' + token + 'msgtype=farmland_harvest',
            headers: JSON.parse(header),
            body: collectBody,
        }
        $.post(options, async(err, resp, data) => {
            try {
    			if (logs) console.log(`\n`+data);
                if (data.match(/farmland_harvest/) == 'farmland_harvest') {
                    $.log(`\n${farmlandDefId}号田收取成功`)
                } else {
                    $.log(`\n${farmlandDefId}号田号田收取失败或还没熟`)
                }
            } catch(e) {
                $.logErr(e, resp);
            } finally {
                resolve()
            }
        })
    })
} 
  
//生产
async function produce () {
    return new Promise((resolve) => {      
        produceBody = produceBody.replace(/farmlandDefId\":\d/, `farmlandDefId":${farmlandDefId}`);
//        $.log(`\n`+produceBody);
        let options = {
            url: 'https://sunnytown.hyskgame.com/api/messages?accessToken=' + token + 'msgtype=farmland_plant',
            headers: JSON.parse(header),
            body: produceBody,
        }
        $.post(options, async(err, resp, data) => {
            try {
    			if (logs) console.log(`\n`+data);
                if (data.match(/farmland_plant/) == 'farmland_plant') {
                    $.log(`\n${farmlandDefId}号田号田生产成功`)
                } else {
                    $.log(`\n${farmlandDefId}号田号田生产失败或还没熟`)
                }
            } catch(e) {
                $.logErr(e, resp);
            } finally {
                resolve()
            }
        })
    })
}

// 全体加速
async function accelerateAll () {
    return new Promise((resolve) => {
//        $.log(`token is: ${token}`);
        let options = {
            url: 'https://sunnytown.hyskgame.com/api/messages?accessToken=' + token + 'msgtype=farmland_speedUpAll',
            headers: JSON.parse(header),
            body: accelerateAllBody,
        }
        $.post(options, async(err, resp, data) => {
            try {
    			if (logs) console.log(`\n`+data);
                if (data.match(/farmland_speedUpAll/) == 'farmland_speedUpAll') {
                    $.log(`\n全体加速成功剩余次数：` + data.match(/remainingAllTimes":(\d+),/)[1])
                } else {
                   // $.log(`\n全体加速失败或次数不够`)
					   $.log(`\n全体加速失败,` + data.match(/rawMessage\":\"([A-Za-z\_\s\.]+)\",/)[1])
                }
            } catch(e) {
                $.logErr(e, resp);
            } finally {
                resolve()
            }
        })
    })
}

// 普通加速
async function accelerate () {
    return new Promise((resolve) => {
        accelerateBody = accelerateBody.replace(/farmlandDefId\":\d/, `farmlandDefId":${farmlandDefId}`);
	    console.log(`\nfarmlandDefId is ${farmlandDefId}`);
//        $.log(`\n`+accelerateBody);
        let options = {
            url: 'https://sunnytown.hyskgame.com/api/messages?accessToken=' + token + 'msgtype=farmland_speedUp',
            headers: JSON.parse(header),
            body: accelerateBody,
        }
        $.post(options, async(err, resp, data) => {
            try {
    			if (logs) console.log(`\n`+data);
                if (data.match(/farmland_speedUp/) == 'farmland_speedUp') {
                    $.log(`\n${farmlandDefId}号田普通加速成功`)
                } else {
                    $.log(`\n${farmlandDefId}号田普通加速失败或熟了`)
                }
            } catch(e) {
                $.logErr(e, resp);
            } finally {
                resolve()
            }
        })
    })
}

// 提现打卡信息
async function checkInInfo () {
    return new Promise((resolve) => {
        let options = {
            url: 'https://sunnytown.hyskgame.com/api/messages?accessToken=' + token + 'msgtype=farmCheckIn_getCheckInInfo',
            headers: JSON.parse(header),
            body: `[{"type":"farmCheckIn_getCheckInInfo","data":{}}]`,
        }
        $.post(options, async(err, resp, data) => {
            try {
                if (data.match(/farmCheckIn_getCheckInInfo/) == 'farmCheckIn_getCheckInInfo') {
    				if (logs) console.log(`\n`+data);
                    let list = JSON.parse(data)[0].data.checkInInfo.entries;
                    let obj = {};
                    if (list && Array.isArray(list)) {
                        for (x= 0; x<list.length; x++) {
                            obj = list[x];
                            if (obj.stateCode === 2) {
                              $.log(`\n连续打卡${obj.dayNumber}天成功，开始提现...`)
                              await $.wait(1300)
                              await checkInPay(obj.dayNumber)
                            } else {
                              $.log(`\n连续打卡时间不足或已提现`)
                            }                           
                        }
                    }
                } else {
                    $.log(`\n打卡提现列表获取失败`)
                }
            } catch(e) {
                $.logErr(e, resp);
            } finally {
                resolve()
            }
        })
    })
}

// 打卡提现
async function checkInPay (dayNumber) {
    return new Promise((resolve) => {
        let options = {
            url: 'https://sunnytown.hyskgame.com/api/messages?accessToken=' + token + 'msgtype= farmCheckIn_receiveReward',
            headers: JSON.parse(header),
            body: `[{"type":"farmCheckIn_receiveReward","data":{"dayNumber":${dayNumber}}}]`
        }
        $.post(options, async(err, resp, data) => {
            try {
                if (logs) console.log(`\n`+data);
                if (data.match(/farmCheckIn_receiveReward/) == 'farmCheckIn_receiveReward') {
                    $.log(`\n打卡` + data.match(/progress":"(\d+)",/)[1] + `天，提现成功！✅`)
                    $.msg($.name, "", '富豪小镇' + `${status}` + '打卡提现成功！')
                } else {
                    $.log(`\n打卡提现${dayNumber}提现失败`)
                }
            } catch(e) {
                $.logErr(e, resp);
            } finally {
                resolve();
            }
        })
    })
}

// 商品列表
async function getItemList() {
    return new Promise((resolve) => {
        let options = {
            url: 'https://sunnytown.hyskgame.com/api/messages?accessToken=' + token + '&msgtype=market_getItemList',
            body: '[{"type":"market_getItemList","data":{}}]',
        }
        $.post(options, async(err, resp, data) => {
            try {
                if (logs) console.log(`\n`+data);
                if (data.match(/market_getItemList/) == 'market_getItemList') {
                    $.log(`\n获取商品列表成功`)
                    let list = JSON.parse(data)[0].data.marketItemList;
                    let obj = {};
                    if (list && Array.isArray(list)) {
                        for (x=0; x<list.length; x++) {
                            obj = list[x];
                            if (obj.stateCode === 1 && obj.itemDefId === 10117) {
                                $.log(`\n生产商品id${obj.itemDefId}数量达标，开始出售商品兑换现金...`);
                                await $.await(1300);
                                await exchange(obj.itemDefId);
                            }
                        }                      
                    }
               } else {
                    $.log(`\n商品列表获取失败`)
               }
            } catch(e) {
                $.logErr(e, resp);
            } finally {
                resolve()
            }
        })
    })
}

// 商品兑换
async function exchange(itemDefId) {
    return new Promise((resolve) => {
        let options = {
            url: 'https://sunnytown.hyskgame.com/api/messages?accessToken=' + token + 'msgtype=market_exchange',
            body: '[{"type":"market_exchange","data":{"itemDefId":' + itemDefId + '}}]',
        }
        $.post(options, async(err, resp, data) => {
            try {
                if (logs) console.log(`\n`+data);
                if (data.match(/market_exchange/) == 'market_exchange') {
                    let item = JSON.parse(data)[0].data.marketItem;
                    $.log(`\n商品id${itemDefId}兑换出售成功，获得现金${item.cashAmount}元✅`)
               } else {
                    $.log(`\n商品兑换出售失败`)
               }
            } catch(e) {
                $.logErr(e, resp);
            } finally {
                resolve()
            }
        })
    })
}



// Env
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,i)=>{s.call(this,t,(t,s,r)=>{t?i(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const i=this.getdata(t);if(i)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,i)=>e(i))})}runScript(t,e){return new Promise(s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[o,h]=i.split("@"),a={url:`http://${h}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":o,Accept:"*/*"}};this.post(a,(t,e,i)=>s(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):i?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of i)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,r]=/^@(.*?)\.(.*?)$/.exec(e),o=this.getval(i),h=i?"null"===o?null:o||"{}":"{}";try{const e=JSON.parse(h);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),i)}catch(e){const o={};this.lodash_set(o,r,t),s=this.setval(JSON.stringify(o),i)}}else s=this.setval(t,e);return s}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,e){return this.isSurge()||this.isLoon()?$persistentStore.write(t,e):this.isQuanX()?$prefs.setValueForKey(t,e):this.isNode()?(this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0):this.data&&this.data[e]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?(this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)})):this.isQuanX()?(this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t))):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)}))}post(t,e=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),t.headers&&delete t.headers["Content-Length"],this.isSurge()||this.isLoon())this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.post(t,(t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status),e(t,s,i)});else if(this.isQuanX())t.method="POST",this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>e(t));else if(this.isNode()){this.initGotEnv(t);const{url:s,...i}=t;this.got.post(s,i).then(t=>{const{statusCode:s,statusCode:i,headers:r,body:o}=t;e(null,{status:s,statusCode:i,headers:r,body:o},o)},t=>{const{message:s,response:i}=t;e(s,i,i&&i.body)})}}time(t){let e={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let s in e)new RegExp("("+s+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?e[s]:("00"+e[s]).substr((""+e[s]).length)));return t}msg(e=t,s="",i="",r){const o=t=>{if(!t)return t;if("string"==typeof t)return this.isLoon()?t:this.isQuanX()?{"open-url":t}:this.isSurge()?{url:t}:void 0;if("object"==typeof t){if(this.isLoon()){let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}if(this.isQuanX()){let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl;return{"open-url":e,"media-url":s}}if(this.isSurge()){let e=t.url||t.openUrl||t["open-url"];return{url:e}}}};this.isMute||(this.isSurge()||this.isLoon()?$notification.post(e,s,i,o(r)):this.isQuanX()&&$notify(e,s,i,o(r)));let h=["","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="];h.push(e),s&&h.push(s),i&&h.push(i),console.log(h.join("\n")),this.logs=this.logs.concat(h)}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){const s=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();s?this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):this.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${s} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,e)}


