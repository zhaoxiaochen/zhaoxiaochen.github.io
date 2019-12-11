/* global hexo */

var merge = require('./merge');
var FS = require('fs');
const chalk = require('chalk');
var readline = require('readline');

var end = "?raw=true";
var dirfath = './source/_posts/';
var gitRemod = "https://github.com/zhaoxiaochen/zhaoxiaochen.github.io/blob/master/assets/"

//读取文件，并且替换文件中指定的字符串
let replaceFile = function(filePath){
  read_file(filePath,function(data){
    FS.writeFile(filePath, data, function (err) {
        if (err) return err;
    });
  });
}

function read_file(path,callback){
  var fRead = FS.createReadStream(path);
  var objReadline = readline.createInterface({
      input:fRead
  });
  var arr = "";
  objReadline.on('line',function (line) {
    if(line){
      
      let imgUrl = line.match(/!\[.*\]\(([^)]*)\)/)

      if(imgUrl ){
        imgUrl = imgUrl[1]
        let remonUrl = imgUrl.replace('../assets/',gitRemod)
        if(remonUrl.indexOf(end)===-1){
          remonUrl+=end
        }
        line = line.replace(imgUrl,remonUrl);
        hexo.log.info(imgUrl);
        hexo.log.info("          ↓            ");
        hexo.log.info(chalk.magenta(remonUrl));
        hexo.log.info("\n");
        arr+=line+"\n"
      }else{
        arr+=line+"\n"
      }
    }else{
      arr+=line+"\n"
    }
  });
  objReadline.on('close',function () {
      callback(arr);
  });
}


let deploy_start = function(){
  //遍历statics文件夹，找到main_*.js
  FS.readdir(dirfath,function(err,files){
    if(err){
        return err;
    }
    if(files.length !=0){
        files.forEach((el,item)=>{
          //判断文件的状态，用于区分文件名/文件夹
          const path = dirfath+ el;
          FS.stat(path,function(err,status){
            if(err){
                return err;
            }
            let isFile = status.isFile();//是文件
            let isDir = status.isDirectory();//是文件夹
            if(isFile){
              if(path.indexOf('.md')!=-1){
                  hexo.log.info("开始处理："+path);
                  replaceFile(path);
              }
            }
            if(isDir){
                console.log("文件夹："+path);
            }
          });
        });
    }
  });
}

/**
 * Merge configs in _data/next.yml into hexo.theme.config.
 * Note: configs in _data/next.yml will override configs in hexo.theme.config.
 */
hexo.on('generateBefore', function () {
  if (hexo.locals.get) {
    var data = hexo.locals.get('data');
    hexo.log.warn(data)
    if ( data && data.next ) {
      if ( data.next.override ) {
        hexo.theme.config = data.next;
      } else {
        merge(hexo.theme.config, data.next);
      }
    }
  }
});

hexo.on('generateAfter', function () {
  hexo.log.warn("===============================================================");
  hexo.log.warn("========================= ATTENTION! ==========================");
  hexo.log.warn("===============================================================");
  hexo.log.warn(" NexT repository is moving here: https://github.com/theme-next ");
  hexo.log.warn("===============================================================");
  hexo.log.warn(" It's rebase to v6.0.0 and future maintenance will resume there");
  hexo.log.warn("===============================================================");
});

hexo.on('deployBefore',function(){
  console.log("\n")
  hexo.log.info("开始处理Markdown的图片链接到远程");
  hexo.log.info("远程==>"+gitRemod);
  deploy_start();
})
