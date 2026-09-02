@echo off
echo Installing backend dependencies...
cd /d "D:\react-projects\my-react-app\backend"
call npm install

echo.
echo Starting backend server...
call npm run dev

pause
