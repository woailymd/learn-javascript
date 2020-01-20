'use strict';

const fs = require('fs'),
    url = require('url'),
    path = require('path'),
    http = require('http');

const root = path.resolve(process.argv[2] || '.');
/* process.argv 属性返回一个数组，这个数组包含了启动Node.js进程时的命令行参数。
第一个元素为process.execPath。
第二个元素为当前执行的JavaScript文件路径。
剩余的元素为其他命令行参数。
因此，我们把要编译的文件名从第三个参数开始去设置，也意味着每次可以指定一个或多个文件去进行相应的处理。
*/
// console.log(process.argv); // [ 'D:\\node\\node.exe', 'D:\\前端资料\\node\\基本模块\\file_server.js' ]
console.log('Static root dir: ' + root);

// 创建服务器:
const server = http.createServer(function (request, response) {
  // 获得URL的path
  console.log(request.url);
  const pathname = url.parse(request.url).pathname;
  // 获得对应的本地文件路径，类似 '/srv/www/css/bootstrap.css':
  const filepath = path.join(root, pathname);
  // 获取文件状态:
  fs.stat(filepath, function (err, stats) {
    if (err) {
      // 出错了或者文件不存在:
      console.log('404 ' + request.url);
      // 发送404响应:
      response.writeHead(404);
      response.end('404 Not Found');
    } else {
      if (stats.isFile()) {
        // 是文件
        console.log('200 ' + request.url);
        // 发送200响应:
        response.writeHead(200);
        // 将文件流导向response:
        fs.createReadStream(filepath).pipe(response);
      }else {
        console.log('Directory');
        // 获取省缺文件目录数组
        const filepathArr = [
          path.join(root, "/index.html"),
          path.join(root, "/default.html")
        ];
        readRightFile(filepathArr, function(filepath) {
          if (filepath) {
            console.log('200 ' + request.url);
            // 发送200响应:
            response.writeHead(200);
            fs.createReadStream(filepath).pipe(response);
          }else {
            // 出错了或者文件不存在:
            console.log('404 ' + request.url);
            // 发送404响应:
            response.writeHead(404);
            response.end('404 Not Found');
          }
        });
      }
    }
  });
});

function readRightFile(filepathArr, callback, index = 0) {
  // 终止判断
  if (filepathArr.length <= index) {
    return false;
  }
  fs.stat(filepathArr[index], function(err) {
    if (err) { // 如果异常但是不是最后一条则继续递归
      if(index === filepathArr.length) {
        // 如果最后一条任然报错则表示目录中无法找到省缺文件
        callback(false);
        return false;
      }
      index += 1;
      readRightFile(filepathArr, callback, index);
    } else{
      // 找到之后再回调函数中返回对应路径
      callback(filepathArr[index]);
    }
  })
}

server.listen(8000);

console.log('Server is running at http://127.0.0.1:8000/');