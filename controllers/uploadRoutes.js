const db = require("../db.js");
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// ตำแหน่งที่เก็บไฟล์
const uploadDir = path.join(__dirname, '../public/uploads');

// ตรวจสอบว่าโฟลเดอร์มีอยู่หรือไม่ ถ้าไม่มีก็สร้างใหม่
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        // ตรวจสอบว่าชื่อไฟล์ที่อัปโหลดขึ้นมีคำนำหน้าด้วย req.params.solutionID หรือไม่
        if (file.originalname.startsWith(req.params.solutionID)) {
            const filePath = path.join(uploadDir, file.originalname);
            // ถ้าใช่ ให้ลบไฟล์เก่าก่อนที่จะเขียนทับ
            fs.unlinkSync(filePath);
            cb(null, file.originalname);
        } else {
            // ถ้าไม่ใช่ ให้สร้างชื่อไฟล์ใหม่
            cb(null, req.params.solutionID + path.extname(file.originalname));
        }
    }
});

const upload = multer({ storage: storage });

exports.uploadFile = upload.single('fileUpload');


exports.handleUpload = (req, res) => {
    try{
        const solutionParam = req.params;
        // const file_path = path.relative(uploadDir, req.file.path);
        const file_path = path.join('/public/uploads/', path.basename(req.file.path));
        const qInsert = "INSERT INTO anssolution (solutionID, Q3) VALUES (?, ?)";
        const qFetchData = "SELECT * FROM anssolution WHERE solutionID = ?";
        const qUpdate = "UPDATE anssolution SET Q3=? WHERE solutionID=?;";

        db.query(qFetchData, [solutionParam.solutionID], (err, fechData) => {
            if (err) return res.status(500).json({ error: "FetchDataError", message: err });

            if (fechData && fechData.length > 0) {
                db.query(qUpdate, [file_path, solutionParam.solutionID], (err, updateData) => {
                    if (err) return res.status(500).json({ error: "UpdateError", message: err });
                    res.status(200).json({ message: 'อัปโหลดไฟล์สำเร็จ' });
                });
            } else {
                db.query(qInsert, [solutionParam.solutionID, file_path], (err, insertData) => {
                    if (err) return res.status(500).json({ error: "InsertDataError", message: err });
                    res.status(200).json({ message: 'อัปโหลดไฟล์สำเร็จ' });
                });
            }
        });
    }catch(err){
        console.log(err)
        res.status(500).json({ error: "CatchError", message: err });
    }
};

exports.handleUploadRound2 = (req, res) => {
    try{
        const solutionParam = req.params;
        // const file_path = path.relative(uploadDir, req.file.path);
        const file_path = path.join('/public/uploadsRound2/', path.basename(req.file.path));
        const qInsert = "INSERT INTO anssolution (solutionID, Q3) VALUES (?, ?)";
        const qFetchData = "SELECT * FROM anssolution WHERE solutionID = ?";
        const qUpdate = "UPDATE anssolution SET Q3=? WHERE solutionID=?;";

        db.query(qFetchData, [solutionParam.solutionID], (err, fechData) => {
            if (err) return res.status(500).json({ error: "FetchDataError", message: err });

            if (fechData && fechData.length > 0) {
                db.query(qUpdate, [file_path, solutionParam.solutionID], (err, updateData) => {
                    if (err) return res.status(500).json({ error: "UpdateError", message: err });
                    res.status(200).json({ message: 'อัปโหลดไฟล์สำเร็จ' });
                });
            } else {
                db.query(qInsert, [solutionParam.solutionID, file_path], (err, insertData) => {
                    if (err) return res.status(500).json({ error: "InsertDataError", message: err });
                    res.status(200).json({ message: 'อัปโหลดไฟล์สำเร็จ' });
                });
            }
        });
    }catch(err){
        console.log(err)
        res.status(500).json({ error: "CatchError", message: err });
    }
};