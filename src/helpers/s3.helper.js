const { PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs').promises;
const s3Client = require('../utils/s3');
require('dotenv').config();

const createFileName = (originalFileName, uniqueName) => {
  return `${uniqueName}`;
};

async function uploadOnS3(file) {
  const bucketName = process.env.S3_BUCKET_NAME;
  const fileBuffer = await fs.readFile(file.path);
  const fileName = createFileName(file.originalname, file.filename);
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: fileBuffer,
      ContentType: file.mimetype,
    });
    await s3Client.send(command);
    await fs.unlink(file.path);
    return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    fs.unlink(file.path);
    throw new Error('Failed to upload file.');
  }
}
module.exports = { uploadOnS3 };
