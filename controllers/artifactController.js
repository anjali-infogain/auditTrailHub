const express = require('express');
const axios = require('axios');
const multer = require('multer');
const Artifact = require('../models/Artifacts');
// const isAuthenticated = require('../middleware/auth'); @TODO restore auth
const router = express.Router();
const mongoose = require('mongoose');
const AuditCycle = require('../models/AuditCycles');
const upload = multer({ storage: multer.memoryStorage() }); // Store in memory before upload

const constants = require('../utils/constants');
const responseHandler = require('../utils/responseHandler');
const { generateUniqueFileName } = require('../utils/commonUtils');

const SHAREPOINT_SITE_ID = process.env.SHAREPOINT_SITE_ID;
const DRIVE_ID = process.env.DRIVE_ID;
const accessTokenG =
  'eyJ0eXAiOiJKV1QiLCJub25jZSI6Im9NeXk0bDlSbnp2bFVaS3JpVUZmOTZlekkxQ3dhLUluWXhrMmRCaUVSVTAiLCJhbGciOiJSUzI1NiIsIng1dCI6ImltaTBZMnowZFlLeEJ0dEFxS19UdDVoWUJUayIsImtpZCI6ImltaTBZMnowZFlLeEJ0dEFxS19UdDVoWUJUayJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8zZjdmNTJjNy0wN2IyLTRjYjEtYTA3YS00OTYyNTYwMjFlNmYvIiwiaWF0IjoxNzQwNzMyMDQ2LCJuYmYiOjE3NDA3MzIwNDYsImV4cCI6MTc0MDczNjE0MywiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsicDEiXSwiYWlvIjoiQWJRQVMvOFpBQUFBdVJGejV6QWRyZ3BiS3pNekF5S29hU2kwczVReFJrRklZQ1R0K3JtRFIwaGtBQ28xSkdmdk8yc2FsZkN4Z3ZUeVBiNTRWYWVMbGRERVVWdStOS1VsNm5kYTR1QlZ6L2J0TmxGMVpOVHF0R2ZwcHVOV2JIbmhNQTN6SytWVjNFbVZ6L2RpWFFiR2F1bWlUQWJFYzhjSisvVVNyNWxkejV2NXN5alhEbElIaFh6N1B3YlJTazhydUR6WHpZLy9MOCtPcWppdXBHakw1QU5oc3JnSGptMjdLSVFWbCtrcXZzeW1Zbk01Y3hYZVpmWT0iLCJhbXIiOlsicHdkIiwibWZhIl0sImFwcF9kaXNwbGF5bmFtZSI6IkF1ZGl0VHJhaWxIdWIiLCJhcHBpZCI6IjE0NWVlZDkxLTMxZDctNDdhNS04NzM2LWU4MGI0ZTNjOTdmZiIsImFwcGlkYWNyIjoiMSIsImZhbWlseV9uYW1lIjoiUGFuZHlhIiwiZ2l2ZW5fbmFtZSI6IkFuamFsaSIsImlkdHlwIjoidXNlciIsImlwYWRkciI6IjU4Ljg0LjYyLjE1MiIsIm5hbWUiOiJBbmphbGkgUGFuZHlhIiwib2lkIjoiNDVhYTYwOWQtN2E2My00M2I1LTgzOGYtNzZiM2Q4MDcwZmY2Iiwib25wcmVtX3NpZCI6IlMtMS01LTIxLTg1NDI0NTM5OC0xNzk2MDUzNjItNjgyMDAzMzMwLTc0OTA5IiwicGxhdGYiOiI4IiwicHVpZCI6IjEwMDMyMDAyMERFNzIxNzciLCJyaCI6IjEuQVZRQXgxSl9QN0lIc1V5Z2VrbGlWZ0llYndNQUFBQUFBQUFBd0FBQUFBQUFBQUJVQUVaVUFBLiIsInNjcCI6IkZpbGVzLlJlYWRXcml0ZS5BbGwgU2l0ZXMuTWFuYWdlLkFsbCBTaXRlcy5SZWFkV3JpdGUuQWxsIFVzZXIuUmVhZCBwcm9maWxlIG9wZW5pZCBlbWFpbCIsInNpZCI6IjAwMjFjMGI5LTJiZTMtYmMwZS04ZWVmLWUwZmIxN2E5YTBiOSIsInNpZ25pbl9zdGF0ZSI6WyJrbXNpIl0sInN1YiI6Im1rNi1CTEZzT3VUWFU1NHFuVVpjNS1mbXVWWksyeWxJZXhIbTB4V281ZFUiLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiQVMiLCJ0aWQiOiIzZjdmNTJjNy0wN2IyLTRjYjEtYTA3YS00OTYyNTYwMjFlNmYiLCJ1bmlxdWVfbmFtZSI6IkFuamFsaS5QYW5keWFAaWdnbG9iYWwuY29tIiwidXBuIjoiQW5qYWxpLlBhbmR5YUBpZ2dsb2JhbC5jb20iLCJ1dGkiOiJyTGpHaEl1NncwLUZlajJldTRNRkFBIiwidmVyIjoiMS4wIiwid2lkcyI6WyJiNzlmYmY0ZC0zZWY5LTQ2ODktODE0My03NmIxOTRlODU1MDkiXSwieG1zX2Z0ZCI6Imk5WlJBSEE0QnZIM0tMU2RBVktWY3JvcWV1Z2g4NFJPSmttY3BfXzk5akUiLCJ4bXNfaWRyZWwiOiIxIDI0IiwieG1zX3N0Ijp7InN1YiI6IlhhSjJqTmRtcTIxREFGVlYzWWlNY1NLbFlraVkyQUlhVEg1Tml0UFpxYUkifSwieG1zX3RjZHQiOjE0MzE3OTczNzZ9.c8NQknAp7sS1jy03eM12qr9ysA8bc_Ioh-7syv9GvEfIIhWsz7G4x1xLd4trQdbMpwqrLVEfRGEBgGWm3WC3tZ0ue2jJO8A-pzmZRJ7X6HWGCZY2SGq0ttwYbMgPizfzGa5X8ZY3WY8UqNfb9YVKKxEzPQdoso6I8u3qP4fuJQkKGYNMq6J4NO7FQ9jBSvYCwoD8j4hFgEBJroLkOZ_W0pvFLbRamFywOYIeaY1RijayxqzcsEI3dkQQHbxv8xKUBXoNgIvHFpWgkDmmh_bwm5rpXI7uwLkYT1sbM752gVG2KKmpHzwUwypsjkY_fbvoq1xlRWVStNw78V_muHBMDA';
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
    const uniqueFileName = generateUniqueFileName(originalFileName);

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
      newArtifact,
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
router.get('/:id', async (req, res) => {
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

    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
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
router.put('/:id', upload.single('file'), async (req, res) => {
  try {
    const accessToken = accessTokenG; // Add logic to get token
    if (!accessToken) {
      return responseHandler.error(
        res,
        constants.RESPONSE_MESSAGES.UNAUTHORIZED,
        constants.STATUS_CODES.UNAUTHORIZED
      );
    }
    const { description, status } = req.body;
    
    // Fetch existing artifact
    const artifact = await Artifact.findById(req.params.id);
    if (!artifact) {
      return responseHandler.error(
        res,
        constants.RESPONSE_MESSAGES.NOT_FOUND,
        constants.STATUS_CODES.NOT_FOUND
      );
    }

    if (req.file) {
      // File upload logic (only if file is provided
      const uploadUrl = `https://graph.microsoft.com/v1.0/sites/${SHAREPOINT_SITE_ID}/drives/${DRIVE_ID}/root:/artifacts/${artifact.name}:/content`;
      await axios.put(uploadUrl, req.file.buffer, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/octet-stream',
        },
      });
    }

    // Update metadata in MongoDB
    artifact.name = artifact.name;
    artifact.description = description || artifact.description;
    artifact.status = status || artifact.status;
    artifact.updatedBy = '45aa609d-7a63-43b5-838f-76b3d8070ff6'; // Replace with dynamic user ID
    artifact.updatedAt = new Date();

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
router.delete('/:id', async (req, res) => {
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
    const accessToken = accessTokenG;
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
