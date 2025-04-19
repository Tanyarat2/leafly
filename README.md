# leafly
http://localhost:4000/


เริ่มแรก
1.โหลดดาต้าเบส .sql ไป 
2.ไปเชื่อมserver ในดาต้าเบสตามนี้ server> user and previleges

localhost

USER = Samote

PASSWORD = Hellosamote1234***

DB_NAME = sec3_gr4_database

100 max ไออันติ้กๆนี่ติ้กครบอ่ะ ละก็อย่าลืมกดเชื่อม sec3_gr4_database นะ
-----------------------------------

เชื่อมแล้วมา สร้างไฟล์ Samote-express 
เปิดในไฟล์ใน vscode  

npm init 
npm install สี่อัน ตามที่เขาเคยให้ทำ
npm install multer

package.json
{
  "name": "samote-express",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "nodemon server.js"
  },
  "author": "Samote Group4 Sec3",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.5.0",
    "express": "^5.1.0",
    "express-session": "^1.18.1",
    "mysql2": "^3.14.0",
    "nodemon": "^3.1.9"
  }
}

เอา.env เข้ามา

แยกไฟล์ html
> html
> nodemodules
.env
package0lock
package
server.js

อะไรทำนองนี้ก็โหลดๆมาจากที่นีี่แปะไป อย่าลืม  npm start หรือ  node server.js ถ้าเชื่อมดาต้าเบสไม่ได้อยากลืมว่าเลือกกดเชื่อมยังตอนทำในsql

ลองๆเล่นดูติดขัดตรงไหนก็บอก
