var express = require('express');
var app = express();
var ejs = require('ejs');
var bodyParser = require('body-parser');
var multiparty = require('multiparty');
var util = require('util');
var fs = require('fs');
var path = require('path');

app.engine('html', ejs.__express);
app.set('view engine', 'html');
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('uploads'));

app.get('/', function (req, res) {
    res.render('index.ejs');
});

app.post('/send', function (req, res) {
    var form = new multiparty.Form();
    //设置编辑
    form.encoding = 'utf-8';
    //设置文件存储路径
    form.uploadDir = "uploads/";
    //设置单文件大小限制
    form.maxFilesSize = 2 * 1024 * 1024;
    //form.maxFields = 1000;  设置所以文件的大小总和
    form.parse(req, function(err, fields, files) {
        if (err) {
            console.log(err);
            return res.send("upload failed");
        }
        // console.log(files.content[0].originalFilename);
        //读取文件
        var data = fs.readFileSync(path.join(__dirname, files.content[0].path)).toString();
        // console.log(data);
        var datas = data.split("\n");
        var i, j, k;
        //每一行
        datas[0] = datas[0].substring(1);

        var result = [];
        var result2 = [];

        for (i = 0; i < datas.length; i++)
        {
            result[i] = '';
            result2[i] = '';
            if (datas[i].length < 2)
                continue;

            //计算result2
            result2[i] = (countSemicolon(datas[i])+1)*24;

            //将每一行以分号分割成数组
            datas[i] = datas[i].split(";");
            //对每一行，行中会有多个数据
            for (j = 0; j < datas[i].length; j++)
            {
                //截取数据
                datas[i][j] = getContent(datas[i][j]);
                result[i] += genConv(datas[i][j]);
            }
            // if (i < 3)
            // console.log(result[i]);
        }

        //1
        if (fs.existsSync(path.join(__dirname, 'uploads/result' ,files.content[0].originalFilename)) == true)
        {
            fs.unlinkSync(path.join(__dirname, 'uploads/result' ,files.content[0].originalFilename));
        }

        //2
        if (fs.existsSync(path.join(__dirname, 'uploads/result2' ,files.content[0].originalFilename)) == true)
        {
            fs.unlinkSync(path.join(__dirname, 'uploads/result2' ,files.content[0].originalFilename));
        }

        for (k = 0; k < result.length; k++)
        {
            fs.appendFileSync(path.join(__dirname, 'uploads/result' ,(files.content[0].originalFilename)), result[k] + "\n");
            fs.appendFileSync(path.join(__dirname, 'uploads/result2' ,(files.content[0].originalFilename)), result2[k] + "\n");
        }

        var options = {
            root: __dirname + '/uploads/result',
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };
        var fileName = '';
        // res.download('/result/' + files.content[0].originalFilename);
        // res.download('result/data_3.txt');
        return res.redirect('result/' + files.content[0].originalFilename);
    });
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});

function getContent(str)
{
    var temp = str.lastIndexOf(":");
    str = str.substring(0, temp);
    return str;
}

function genConv(x) {
    return "222:3::" + x + ";20549:672;" +
        "222:3::" + x + ";20549:28389;" +
        "222:3::" + x + ";20549:28390;" +
        "222:3::" + x + ";20549:28391;" +
        "222:3::" + x + ";20549:28392;" +
        "222:3::" + x + ";20549:28393;" +
        "222:3::" + x + ";20549:28394;" +
        "222:3::" + x + ";20549:28395;";
}

function countSemicolon(strSource) {
    //统计字符串中包含{}或{xxXX}的个数
    var thisCount = 0;
    strSource.replace(/;/g, function (m, i) {
        //m为找到的{xx}元素、i为索引
        thisCount++;
    });
    return thisCount;
}