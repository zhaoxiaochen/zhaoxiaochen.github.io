@echo off
echo 开始新建新的文档.
:loop
set /P INPUT=请输入文档名称: %=%
if "%INPUT%"=="" goto loop
hexo new "%INPUT%"
