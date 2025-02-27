const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const Artifact = require('../models/Artifacts');
const isAuthenticated = require('../middleware/auth');
const router = express.Router();
const mongoose = require('mongoose');
const AuditCycle = require('../models/AuditCycles');
const upload = multer({ storage: multer.memoryStorage() }); // Store in memory before upload

const constants = require('../utils/constants');
const responseHandler = require('../utils/responseHandler');

const SHAREPOINT_SITE_ID = process.env.SHAREPOINT_SITE_ID;
const DRIVE_ID = process.env.DRIVE_ID;

const accessTokenG =
  'eyJ0eXAiOiJKV1QiLCJub25jZSI6IlJDcEZIMjd2NWNRRkRsSGpmRnlKQ1M4SUJ5RlFidVN3YnlOdF9JMUxxUU0iLCJhbGciOiJSUzI1NiIsIng1dCI6ImltaTBZMnowZFlLeEJ0dEFxS19UdDVoWUJUayIsImtpZCI6ImltaTBZMnowZFlLeEJ0dEFxS19UdDVoWUJUayJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8zZjdmNTJjNy0wN2IyLTRjYjEtYTA3YS00OTYyNTYwMjFlNmYvIiwiaWF0IjoxNzQwNDc0OTA4LCJuYmYiOjE3NDA0NzQ5MDgsImV4cCI6MTc0MDQ3OTM3MSwiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsicDEiXSwiYWlvIjoiQWJRQVMvOFpBQUFBQXM3WXpaRjJxNExwYXMrcElMVXhabWpkR3h4NnpqLzJmUlRtN0NNODlBRWNlOWhmd1R3ZzdEMFNkampGN2dpSHBzNi96Y21RZm1NQVRVeEFUSUpIVlZ3NkRYbVBuSS8xL3NhL1FabmhFTnc2YzJLdFU3WENlS2NUZkZHQmJtRDZYZ0hyL1VSQ1RkRHBGY3ZJOFBCYjY1VWxnTzg1SWZEM0hLaUVDa2ZCMkd3WHMyeVhuWlZBRUZNN2FTMUF5SG5PY0h6RzRKMXVTclZFWmlVRkxkUHZJRjRvempiVDN4dWsxV2pQSzI0eFg1bz0iLCJhbXIiOlsicHdkIiwibWZhIl0sImFwcF9kaXNwbGF5bmFtZSI6IkF1ZGl0VHJhaWxIdWIiLCJhcHBpZCI6IjE0NWVlZDkxLTMxZDctNDdhNS04NzM2LWU4MGI0ZTNjOTdmZiIsImFwcGlkYWNyIjoiMSIsImZhbWlseV9uYW1lIjoiUGFuZHlhIiwiZ2l2ZW5fbmFtZSI6IkFuamFsaSIsImlkdHlwIjoidXNlciIsImlwYWRkciI6IjI0MDI6ZTI4MDozZTM5OjVjNjo2MGJmOmQxNTE6NzViNzo4YmUiLCJuYW1lIjoiQW5qYWxpIFBhbmR5YSIsIm9pZCI6IjQ1YWE2MDlkLTdhNjMtNDNiNS04MzhmLTc2YjNkODA3MGZmNiIsIm9ucHJlbV9zaWQiOiJTLTEtNS0yMS04NTQyNDUzOTgtMTc5NjA1MzYyLTY4MjAwMzMzMC03NDkwOSIsInBsYXRmIjoiOCIsInB1aWQiOiIxMDAzMjAwMjBERTcyMTc3IiwicmgiOiIxLkFWUUF4MUpfUDdJSHNVeWdla2xpVmdJZWJ3TUFBQUFBQUFBQXdBQUFBQUFBQUFCVUFFWlVBQS4iLCJzY3AiOiJGaWxlcy5SZWFkV3JpdGUuQWxsIFNpdGVzLk1hbmFnZS5BbGwgU2l0ZXMuUmVhZFdyaXRlLkFsbCBVc2VyLlJlYWQgcHJvZmlsZSBvcGVuaWQgZW1haWwiLCJzaWQiOiIwMDIxYzBiOS0yYmUzLWJjMGUtOGVlZi1lMGZiMTdhOWEwYjkiLCJzaWduaW5fc3RhdGUiOlsia21zaSJdLCJzdWIiOiJtazYtQkxGc091VFhVNTRxblVaYzUtZm11VlpLMnlsSWV4SG0weFdvNWRVIiwidGVuYW50X3JlZ2lvbl9zY29wZSI6IkFTIiwidGlkIjoiM2Y3ZjUyYzctMDdiMi00Y2IxLWEwN2EtNDk2MjU2MDIxZTZmIiwidW5pcXVlX25hbWUiOiJBbmphbGkuUGFuZHlhQGlnZ2xvYmFsLmNvbSIsInVwbiI6IkFuamFsaS5QYW5keWFAaWdnbG9iYWwuY29tIiwidXRpIjoiYWJ1VXA0S1NYa0tYMmNuUlB3RUJBQSIsInZlciI6IjEuMCIsIndpZHMiOlsiYjc5ZmJmNGQtM2VmOS00Njg5LTgxNDMtNzZiMTk0ZTg1NTA5Il0sInhtc19mdGQiOiJlcE5TZ3g0TlJYY001bmJpNjQwRU9tSkp2eTU0ZkJwb3R1Z0xya3NPTm5VIiwieG1zX2lkcmVsIjoiMSAzMiIsInhtc19zdCI6eyJzdWIiOiJYYUoyak5kbXEyMURBRlZWM1lpTWNTS2xZa2lZMkFJYVRINU5pdFBacWFJIn0sInhtc190Y2R0IjoxNDMxNzk3Mzc2fQ.q8X2Nre_sXjkCUdTBn1vS7cmwgLaL91ZVDtaiZY7fSFtvrYFuY9f_18gr7zBvl4tJZEd-Xq-KUvmC-zc1AKuSWoilZ7MfYZ0C1dKk4yUA2JT42WO627AqgtCDJmLQ9agpIDnNLY3pjmMWqwF5uYyoR1saYxcoQeUde8er1Kkxo0p_r1laW8tbsoT8mxmF4AvRh21gpJ3fYiSbm9JEnnkXPrqnjUD0FhRbfBdNZsbZguoPUuT2KFrbcgInxmDtCLuCYKiTMxbdmsS6GWX1cOaoFydRiB0GcyYO0fRL2jf45aTSk8-qv-qmnkwkkqsKtlkcpjRS8aoftvK6_BTEaORuw';
/**
 * 📌 Upload an artifact (file) to SharePoint & store metadata in MongoDB
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const accessToken = accessTokenG; // Add logic to get token
    if (!accessToken) {
      return responseHandler.error(
        res,
        constants.RESPONSE_MESSAGES.UNAUTHORIZED,
        constants.STATUS_CODES.UNAUTHORIZED
      );
    }

    if (!req.file) {
      return responseHandler.error(
        res,
        constants.RESPONSE_MESSAGES.BAD_REQUEST,
        constants.STATUS_CODES.NO_FILE_ADDED
      );
    }

    const { description, status, auditCycleId } = req.body;

    if (!auditCycleId || !mongoose.Types.ObjectId.isValid(auditCycleId)) {
      return responseHandler.error(
        res,
        constants.RESPONSE_MESSAGES.AUDIT_CYCLE_ID_MISSING,
        constants.STATUS_CODES.NO_FILE_ADDED
      );
    }

    const fileBuffer = req.file.buffer;
    const originalFileName = req.file.originalname;

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueId = uuidv4().split('-')[0];
    const fileExtension = originalFileName.split('.').pop();
    const uniqueFileName = `artifact_${timestamp}_${uniqueId}.${fileExtension}`;

    // Upload file to SharePoint
    const uploadUrl = `https://graph.microsoft.com/v1.0/sites/${SHAREPOINT_SITE_ID}/drives/${DRIVE_ID}/root:/artifacts/${uniqueFileName}:/content`;

    await axios.put(uploadUrl, fileBuffer, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/octet-stream',
      },
    });

    // Create artifact in MongoDB
    const newArtifact = new Artifact({
      description,
      status,
      name: uniqueFileName,
      createdBy: '45aa609d-7a63-43b5-838f-76b3d8070ff6',
      updatedBy: '45aa609d-7a63-43b5-838f-76b3d8070ff6',
    });

    await newArtifact.save();

    // If auditCycleId is provided, store artifact ID in AuditCycle collection
    const auditCycle = await AuditCycle.findById(auditCycleId);
    if (auditCycle) {
      auditCycle.artifacts.push(newArtifact._id); // Push new artifact ID
      await auditCycle.save();
    } else {
      return responseHandler.error(
        res,
        constants.RESPONSE_MESSAGES.NOT_FOUND,
        constants.STATUS_CODES.AUDIT_CYCLE_NOT_FOUND
      );
    }
    return responseHandler.success(
      res,
      constants.RESPONSE_MESSAGES.ARTIFACT_CREATE_SUCCESS,
      auditCycle,
      constants.STATUS_CODES.CREATED
    );
  } catch (error) {
    console.error('Upload error:', error.response?.data || error);
    return responseHandler.error(
      res,
      constants.RESPONSE_MESSAGES.SERVER_ERROR,
      constants.STATUS_CODES.SERVER_ERROR
    );
  }
});

/**
 * 📌 Get all artifacts (Metadata only)
 */
router.get('/', async (req, res) => {
  try {
    const artifacts = await Artifact.find().populate(
      'createdBy updatedBy',
      'firstName lastName'
    );
    res.json({ artifacts });
  } catch (error) {
    console.error('Fetch error:', error);
    return responseHandler.error(
      res,
      constants.RESPONSE_MESSAGES.SERVER_ERROR,
      constants.STATUS_CODES.SERVER_ERROR
    );
  }
});

/**
 * 📌 Get an artifact by ID (Metadata only)
 */
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const artifact = await Artifact.findById(req.params.id).populate(
      'createdBy updatedBy',
      'firstName lastName'
    );
    if (!artifact) {
      return responseHandler.error(
        res,
        constants.RESPONSE_MESSAGES.NOT_FOUND,
        constants.STATUS_CODES.NOT_FOUND
      );
    }
    return responseHandler.success(
      res,
      constants.RESPONSE_MESSAGES.SUCCESS,
      artifact
    );
  } catch (error) {
    console.error('Fetch error:', error);
    return responseHandler.error(
      res,
      constants.RESPONSE_MESSAGES.SERVER_ERROR,
      constants.STATUS_CODES.SERVER_ERROR
    );
  }
});

/**
 * 📌 Download an artifact file from SharePoint
 */
router.get('/download/:fileName', async (req, res) => {
  try {
    const accessToken = accessTokenG;
    if (!accessToken) {
      return responseHandler.error(
        res,
        constants.RESPONSE_MESSAGES.UNAUTHORIZED,
        constants.STATUS_CODES.UNAUTHORIZED
      );
    }

    const fileName = req.params.fileName;
    const downloadUrl = `https://graph.microsoft.com/v1.0/sites/${SHAREPOINT_SITE_ID}/drives/${DRIVE_ID}/root:/artifacts/${fileName}:/content`;

    const response = await axios.get(downloadUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      responseType: 'stream',
    });

    res.setHeader('Content-Disposition', `attachment; filename='${fileName}'`);
    response.data.pipe(res);
  } catch (error) {
    console.error('Download error:', error.response?.data || error);
    return responseHandler.error(
      res,
      constants.RESPONSE_MESSAGES.SERVER_ERROR,
      constants.STATUS_CODES.SERVER_ERROR
    );
  }
});

/**
 * 📌 Update artifact metadata & optionally replace file
 */
router.put('/:id', isAuthenticated, upload.single('file'), async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const artifact = await Artifact.findById(req.params.id);
    if (!artifact) {
      return responseHandler.error(
        res,
        constants.RESPONSE_MESSAGES.NOT_FOUND,
        constants.STATUS_CODES.NOT_FOUND
      );
    }

    artifact.name = name || artifact.name;
    artifact.description = description || artifact.description;
    artifact.status = status || artifact.status;
    artifact.updatedBy = req.user.id;

    // If new file provided, replace in SharePoint
    if (req.file) {
      const accessToken = getUserAccessToken(req);
      const uploadUrl = `https://graph.microsoft.com/v1.0/sites/${SHAREPOINT_SITE_ID}/drives/${DRIVE_ID}/root:/Artifacts/${req.file.originalname}:/content`;

      await axios.put(uploadUrl, req.file.buffer, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': req.file.mimetype,
        },
      });
    }

    await artifact.save();
    return responseHandler.success(
      res,
      constants.RESPONSE_MESSAGES.SUCCESS,
      artifact
    );
  } catch (error) {
    console.error('Update error:', error.response?.data || error);
    return responseHandler.error(
      res,
      constants.RESPONSE_MESSAGES.SERVER_ERROR,
      constants.STATUS_CODES.SERVER_ERROR
    );
  }
});

/**
 * 📌 Delete an artifact (file & metadata)
 */
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const artifact = await Artifact.findById(req.params.id);
    if (!artifact) {
      return responseHandler.error(
        res,
        constants.RESPONSE_MESSAGES.NOT_FOUND,
        constants.STATUS_CODES.NOT_FOUND
      );
    }

    // Delete file from SharePoint
    const accessToken = getUserAccessToken(req);
    const deleteUrl = `https://graph.microsoft.com/v1.0/sites/${SHAREPOINT_SITE_ID}/drives/${DRIVE_ID}/root:/Artifacts/${artifact.name}`;

    await axios.delete(deleteUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // Delete from MongoDB
    await artifact.deleteOne();
    return responseHandler.success(
      res,
      constants.RESPONSE_MESSAGES.ARTIFACT_DELETED,
    );
  } catch (error) {
    console.error('Delete error:', error.response?.data || error);
    return responseHandler.error(
      res,
      constants.RESPONSE_MESSAGES.SERVER_ERROR,
      constants.STATUS_CODES.SERVER_ERROR
    );
  }
});

module.exports = router;
