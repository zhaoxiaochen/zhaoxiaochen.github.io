@echo off
echo ��ʼ�½��µ��ĵ�.
:loop
set /P INPUT=�������ĵ�����: %=%
if "%INPUT%"=="" goto loop
hexo new "%INPUT%"
