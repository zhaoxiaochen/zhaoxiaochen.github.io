# 简介
为什么有这个博客，想写博客很久了。在这之前使用过各种笔记工具，**有道云笔记**、**OneNote**等，都存在各种各样的问题。加之也一直想做一个博客，所以这个博客就重新诞生了，在这个博客之前也有一个旧版本，但是维护困难，故旧版本博客代码进行放弃维护，这里采用了**Hexo**+**NEXT**的结构模式进行开发。以及开发中涉及到的一些问题的备忘

## 更新
### 创建博客

1. 主要参考了,[Hexo+NexT 打造一个炫酷博客]( http://xyua.top/Hexo/hexo_next_blog.html 这篇博文，没有太懂脑子，直接无脑抄了过来，其中有两个修改的地方。

2. 在集成过程中发现了一个local search 的一个缺陷，在点击搜索时每次都会打开一个新的页面。很是不方便。

   需要修改模板，**themes\next\layout\\_partials\header.swig**，一共需要修改两处

   ![image-20191206175704949]( https://raw.githubusercontent.com/zhaoxiaochen/zhaoxiaochen.github.io/master/assets/image-20191206175704949.png )

3. 关于博客markdown文件插入图片时迁移问题为这个博客的静态文件托管在github上，但是如果想要迁到CSDN或其他渠道那么图片显示又是一个问题，这个网上有很多其他的方案，但是总感觉有点不适合我，那就直接用代码自己来解决一下。

   **解决思路**

   图片统一上传至github上，采用网络图片方式插入到md文件中。

   需要解决：发布前把所有的图片链接修改为网络链接方式

   **实施**

   1. 我这里采用的Typora来写的markdown,Typora有一个功能就是截图或其他图片方式可以直接复制到指定文件中。这里我们把他设置为上级目录中的assets文件夹下。

      1. 打开**文件**->**偏好设置**->**图像**

      ![image-20191211111939496](https://raw.githubusercontent.com/zhaoxiaochen/zhaoxiaochen.github.io/master/assets/image-20191211111939496.png?raw=true)

      2. 粘贴一张图片到md文件中会创建一个新的文件夹

         ![image-20191211112055287](https://raw.githubusercontent.com/zhaoxiaochen/zhaoxiaochen.github.io/master/assets/image-20191211112055287.png?raw=true)

   2. 然后我们修改发布脚本

      1. 打开文件目录找到**themes\next\scripts\merge-configs.js**

         ![image-20191211112414037](https://raw.githubusercontent.com/zhaoxiaochen/zhaoxiaochen.github.io/master/assets/image-20191211112414037.png?raw=true)

      2. 实现hexo的生命周期方法**deployBefore**该方法会在执行**hexo deploy**前执行，新建该方法

         ```javascript
         hexo.on('deployBefore',function(){
           
         });
         ```

      3. 编写方法读取md文件，查找图片链接并修改为上传到github后的图片外链地址;

         ```javascript
         /* global hexo */
         
         var merge = require('./merge');
         var FS = require('fs');
         const chalk = require('chalk');
         var readline = require('readline');
         
         var end = "?raw=true";//外链后缀
         var dirfath = './source/_posts/';//md文件的相对路径
         var gitRemod = "https://github.com/zhaoxiaochen/zhaoxiaochen.github.io/blob/master/assets/";//远程链接前缀地址
         
         //读取文件，并且替换文件中指定的字符串
         let replaceFile = function(filePath){
           read_file(filePath,function(data){
             // 修改完后重写到文件中
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
               // 匹配是否是图片md文件格式
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
               // 读取完成回掉方法
               callback(arr);
           });
         }
         
         // 上传前执行
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
         ```

4. 这样配置完成后每次发布完成md的图片都会采用外链形式访问github上的图片，但是github上貌似有文件存储限制，这一块可以暂时这样用，后续就不行啦。再想想其他办法