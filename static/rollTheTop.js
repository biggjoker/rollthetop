//var dappAddress = "n1yjpyY1u3Dbe3LYE9JtkRby6HbtVG5A7A6";
var dappAddress = "n1qKC2qWEQAnGFnrSdVJXKucdare5ayDnEE";
var nebulas = require("nebulas"),
    Account = nebulas.Account,
    neb = new nebulas.Neb();
// neb.setRequest(new nebulas.HttpRequest("https://testnet.nebulas.io"));
neb.setRequest(new nebulas.HttpRequest("https://mainnet.nebulas.io"));

$(function () {
    if (typeof(webExtensionWallet) === "undefined") {
        alert("请安装钱包插件");
    }


     reloadAllProject();
    // newProject();
});

function reloadAllProject() {

    var from = Account.NewAccount().getAddressString();
    var value = "0";
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "2000000"
    var callFunction = "getAll";
    var callArgs ="[\"tests\"]";; //in the form of ["args"]
    var contract = {
        "function": callFunction,
        "args": callArgs
    }

    neb.api.call(from, dappAddress, value, nonce, gas_price, gas_limit, contract).then(function (resp) {
        cbAllProj(resp)
    }).catch(function (err) {
        console.log("error:" + err.message)
    })
}


var NebPay = require("nebpay");     //https://github.com/nebulasio/nebPay
var nebPay = new NebPay();
var serialNumber;var intervalQuery;
function newProject() {

    var to = dappAddress;
    var value = "0";
    var callFunction = "create";
    var callArgs ="[\"rollTop\",\"nothing\"]"//in the form of ["args"]
    var contract = {
        "function": callFunction,
        "args": callArgs
    }

    serialNumber = nebPay.call(to, value, callFunction, callArgs, {    //使用nebpay的call接口去调用合约,
        listener: cbPush        //设置listener, 处理交易返回信息
    });

    intervalQuery = setInterval(function () {
        funcIntervalQuery();
    }, 5000);

}

function setScore(name,userName) {
    var to = dappAddress;
    var value = "0";
    var callFunction = "setScore";
    var callArgs ="[\""+name+"\",\""+userName+"\"]"//in the form of ["args"]
    var contract = {
        "function": callFunction,
        "args": callArgs
    }

    serialNumber = nebPay.call(to, value, callFunction, callArgs, {    //使用nebpay的call接口去调用合约,
        listener: cbPush        //设置listener, 处理交易返回信息
    });

    intervalQuery = setInterval(function () {
        funcIntervalQuery();
    }, 5000);
}

function getScore(name,userName) {
    var from = Account.NewAccount().getAddressString();
    var value = "0";
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "2000000"
    var callFunction = "getScore";
    var callArgs ="[\""+name+"\",\""+userName+"\"]"//in the form of ["args"]
    var contract = {
        "function": callFunction,
        "args": callArgs
    }

    neb.api.call(from, dappAddress, value, nonce, gas_price, gas_limit, contract).then(function (resp) {
        cbGetScore(resp)
    }).catch(function (err) {
        console.log("error:" + err.message)
    })
}
function cbGetScore(resp) {

    if (resp === null || !resp.hasOwnProperty("result") ) {
        console.log("return of rpc fail call: " + JSON.stringify(resp))

    } else {
        var resp=JSON.parse(resp.result);
        alert("分数为"+resp.meta.data);
    }


}


function funcIntervalQuery() {
    nebPay.queryPayInfo(serialNumber)   //search transaction result from server (result upload to server by app)
        .then(function (resp) {
            console.log("tx result: " + resp)   //resp is a JSON string
            var respObject = JSON.parse(resp)
            if(respObject.code === 0){
                clearInterval(intervalQuery);
                reloadAllProject();
            }
        })
        .catch(function (err) {
            console.log(err);
        });
}

function cbPush(resp) {
    console.log("response of push: " + JSON.stringify(resp));
}

function cbAllProj(resp) {
    if (resp === null || !resp.hasOwnProperty("result") ) {
        console.log("return of rpc fail call: " + JSON.stringify(resp))

    } else {
        var resp=JSON.parse(resp.result);
        UpdataPageByAll(resp.data);
    }


}

function UpdataPageByAll(data) {
    var info = "", info2 = "";
    $.each(data, function (i, item) {
        info += "<div class=\"row\" id=" + item.name + " >" +
            "<div class=\"col-md-7\">\n" +
            "<div class=\"card\">\n" +
            "<div class=\"card-header\">\n" +
            "<h5 class=\"card-title\">" + item.name + "</h5>\n" +
            "</div>\n" +
            "<div class=\"card-body\">\n" +
            "<div class=\"col-md-12\">\n" +
            "<p class=\"text-center\">\n" +
            "<strong>总分榜</strong>\n" +
            "</p>\n";
        var stylePro=["bg-primary","bg-danger","bg-success"]
        for (var j = 1; j < 4; j++) {
            if (item.topUser.hasOwnProperty(j) && item.topUser[j] != "") {
                var score = parseInt(item.topUser[j].score);
                info += "<div class=\"progress-group\">\n" +
                    item.topUser[j].userName +
                    "<span class=\"float-right\">" + score + "</span>\n" +
                    "<div class=\"progress progress-sm\">\n" +
                    "<div class=\"progress-bar "+stylePro[j-1]+"\" style=\"width: " + score + "%\"></div>\n" +
                    "</div>\n" +
                    "</div>\n";
            }
        }
        info += "</div>\n" +
            "                                <div class=\"col-md-8\">\n" +
            "                                    <div class=\"input-group input-group-sm\">\n" +
            "                                        <input class=\"form-control form-control-navba\" type=\"search\" placeholder=\"输入你的名称试试手气？\" aria-label=\"Search\">\n" +
            "                                        <div class=\"input-group-append\">\n" +
            "                                            <button class=\"btn btn-navbar\">\n" +
            "                                                <i class=\"fa fa-save\" onclick=\"userSetScore(this)\" projName="+item.name +"></i>\n" +
            "                                            </button>\n" +
            "                                        </div>\n" +
            "                                    </div>\n" +
            "                                    <div class=\"input-group input-group-sm\">\n" +
            "                                        <input class=\"form-control form-control-navba\" type=\"search\" placeholder=\"查询用户名称\" aria-label=\"Search\">\n" +
            "                                        <div class=\"input-group-append\">\n" +
            "                                            <button class=\"btn btn-navbar\" >\n" +
            "                                                <i class=\"fa fa-search\" onclick=\"userGetScore(this)\" projName="+item.name +"></i>\n" +
            "                                            </button>\n" +
            "                                        </div>\n" +
            "                                    </div>\n" +
            " </div>" +
            "</div>\n" +
            "</div>\n" +
            "</div>" +
            "</div>";


        info2 += "<li class=\"nav-item\">\n" +
            "<a href=\"#" + item.name + "\" class=\"nav-link\">\n" +
            "<i class=\"nav-icon fa fa-th\"></i>\n" +
            "<p>" + item.name + "</p>\n" +
            "</a>\n" +
            "</li>";
    })


    var obj = $("#allRow");
    obj.empty();
    obj.append(info);

    var obj2 = $("#allMenu");
    obj2.empty();
    obj2.append(info2);
}

function userSetScore(o) {
    var botton=o.parentNode.parentNode.previousElementSibling;
    var userName=botton.value;
    if(userName == null||userName ==""){
        alert("名字不能为空");
        return false;
    }
    var name =o.getAttribute("projName");
    if(userName == null||userName ==""){
        alert("error 重新加载页面");
        return;
    }
    setScore(name,userName);
}

function userGetScore(o) {
    var botton=o.parentNode.parentNode.previousElementSibling;
    var userName=botton.value;
    if(userName == null||userName ==""){
        alert("名字不能为空");
        return;
    }
    var name =o.getAttribute("projName");
    if(userName == null||userName ==""){
        alert("error 重新加载页面");
        return;
    }
    getScore(name,userName);
}