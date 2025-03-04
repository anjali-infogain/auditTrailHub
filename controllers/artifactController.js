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
  'eyJ0eXAiOiJKV1QiLCJub25jZSI6IjBxa2I0UFNtYlc1a3ZQLUE5dE5KVnZfaUpSZWZTeGRJcWlGMWNpcEFxV2ciLCJhbGciOiJSUzI1NiIsIng1dCI6ImltaTBZMnowZFlLeEJ0dEFxS19UdDVoWUJUayIsImtpZCI6ImltaTBZMnowZFlLeEJ0dEFxS19UdDVoWUJUayJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8zZjdmNTJjNy0wN2IyLTRjYjEtYTA3YS00OTYyNTYwMjFlNmYvIiwiaWF0IjoxNzQxMDczODgyLCJuYmYiOjE3NDEwNzM4ODIsImV4cCI6MTc0MTA3ODQ2NCwiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsicDEiXSwiYWlvIjoiQWJRQVMvOFpBQUFBVXNCWGNHL3dHcU1YcURlcVpSTTVhZnpVelpKVjI4alY0MGdBODlEMUxmNDBidUpCOVYxTzJZZnZOVzRsMG5MM0JUcEVoTXNWRkxmSDUrV0g5MlVYNTFndEg2UTNQNjhxbnhLVW13Q0U1dTg1Z0FTdlEyZUV4bUdCZTIxNW1pSVkwdGpuSWhyckhPR3ZOTjF3dWFvaSs5eU9aczlXV28wQ2xPWklFYTIwMENnRFl1bE1nUXJwWHBFa2t4NE1SUHg3YVB1L3ljTnlhUVRZL2dqSW5NNmZhRWUyWnd3alZ5TDZXa0IyQXVMT0Ywbz0iLCJhbXIiOlsicHdkIiwibWZhIl0sImFwcF9kaXNwbGF5bmFtZSI6IkF1ZGl0VHJhaWxIdWIiLCJhcHBpZCI6IjE0NWVlZDkxLTMxZDctNDdhNS04NzM2LWU4MGI0ZTNjOTdmZiIsImFwcGlkYWNyIjoiMSIsImZhbWlseV9uYW1lIjoiUGFuZHlhIiwiZ2l2ZW5fbmFtZSI6IkFuamFsaSIsImlkdHlwIjoidXNlciIsImlwYWRkciI6IjI0MDI6ZTI4MDozZTM5OjVjNjo0ODkyOjRhNjk6MTliNDpmOWI1IiwibmFtZSI6IkFuamFsaSBQYW5keWEiLCJvaWQiOiI0NWFhNjA5ZC03YTYzLTQzYjUtODM4Zi03NmIzZDgwNzBmZjYiLCJvbnByZW1fc2lkIjoiUy0xLTUtMjEtODU0MjQ1Mzk4LTE3OTYwNTM2Mi02ODIwMDMzMzAtNzQ5MDkiLCJwbGF0ZiI6IjgiLCJwdWlkIjoiMTAwMzIwMDIwREU3MjE3NyIsInJoIjoiMS5BVlFBeDFKX1A3SUhzVXlnZWtsaVZnSWVid01BQUFBQUFBQUF3QUFBQUFBQUFBQlVBRVpVQUEuIiwic2NwIjoiRmlsZXMuUmVhZFdyaXRlLkFsbCBTaXRlcy5NYW5hZ2UuQWxsIFNpdGVzLlJlYWRXcml0ZS5BbGwgVXNlci5SZWFkIHByb2ZpbGUgb3BlbmlkIGVtYWlsIiwic2lkIjoiMDAyMWMwYjktMmJlMy1iYzBlLThlZWYtZTBmYjE3YTlhMGI5Iiwic2lnbmluX3N0YXRlIjpbImttc2kiXSwic3ViIjoibWs2LUJMRnNPdVRYVTU0cW5VWmM1LWZtdVZaSzJ5bElleEhtMHhXbzVkVSIsInRlbmFudF9yZWdpb25fc2NvcGUiOiJBUyIsInRpZCI6IjNmN2Y1MmM3LTA3YjItNGNiMS1hMDdhLTQ5NjI1NjAyMWU2ZiIsInVuaXF1ZV9uYW1lIjoiQW5qYWxpLlBhbmR5YUBpZ2dsb2JhbC5jb20iLCJ1cG4iOiJBbmphbGkuUGFuZHlhQGlnZ2xvYmFsLmNvbSIsInV0aSI6IkhxaldVOERYd1UyQk55U3ptYlpSQUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbImI3OWZiZjRkLTNlZjktNDY4OS04MTQzLTc2YjE5NGU4NTUwOSJdLCJ4bXNfZnRkIjoiMms5dk1iNHY5c0xSNWVpZFNMQ3FiR201b3kwVjh5WUFiclBXUVRwQ1E1SSIsInhtc19pZHJlbCI6IjIyIDEiLCJ4bXNfc3QiOnsic3ViIjoiWGFKMmpOZG1xMjFEQUZWVjNZaU1jU0tsWWtpWTJBSWFUSDVOaXRQWnFhSSJ9LCJ4bXNfdGNkdCI6MTQzMTc5NzM3Nn0.QAgWe-pWF-1rpc-vp6rTabua1_TKy7bZoF3x2Z8M6-6mlsSF_RticpgPArVz6M49jJinzQgzXyK4P_ST0-sNc3ULs-3kYnUriWF-aApLF7mxjqIMV_Qe9xt06NmRJwJdQ2PJn8sVJ7e5YbN74hFrc_PywfRNq_onKocrQ_cF6FlmMB4HtOUraWoCzSCbFKZr52hbD433iJsnEo3MPwm31iD3LONJYojueNUfpWxQtzQR0zI9MGchMGKs4MnldJE3j7CYy0KV1HczlJu0BkvI0uZX5oQDR5oL4ki-RbeUMtXkRtV_uJB66necdocEL44c4i54N4zvaMlH_EHxKghaBg';
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
    const versionId = req.query.versionId || null;
    let downloadUrl;

    if (versionId) {
      downloadUrl = `https://graph.microsoft.com/v1.0/sites/${SHAREPOINT_SITE_ID}/drives/${DRIVE_ID}/root:/artifacts/${fileName}:/versions/${versionId}/content`;
    } else {
      downloadUrl = `https://graph.microsoft.com/v1.0/sites/${SHAREPOINT_SITE_ID}/drives/${DRIVE_ID}/root:/artifacts/${fileName}:/content`;
    }
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

// API to Get File Version History
router.get('/:name/versions', async (req, res) => {
  try {
    const fileName = req.params.name;
    const accessToken = accessTokenG; // Use a valid access token

    if (!accessToken) {
      return responseHandler.error(
        res,
        constants.RESPONSE_MESSAGES.UNAUTHORIZED,
        constants.STATUS_CODES.UNAUTHORIZED
      );
    }

    // Construct the Microsoft Graph API URL
    const url = `https://graph.microsoft.com/v1.0/sites/${SHAREPOINT_SITE_ID}/drives/${DRIVE_ID}/root:/artifacts/${fileName}:/versions`;

    // Call Microsoft Graph API
    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // Send version history as response
    return responseHandler.success(
      res,
      constants.RESPONSE_MESSAGES.SUCCESS,
      response.data
    );
  } catch (error) {
    console.error(
      'Error fetching file versions:',
      error.response?.data || error
    );
    return responseHandler.error(
      res,
      constants.RESPONSE_MESSAGES.SERVER_ERROR,
      constants.STATUS_CODES.SERVER_ERROR
    );
  }
});

module.exports = router;
