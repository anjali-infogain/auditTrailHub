const express = require("express");
const axios = require("axios");
const multer = require("multer");
const Artifact = require("../models/Artifacts");
const isAuthenticated = require("../middleware/auth");
// const { isAuthenticated } = require("../config/auth");
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // Store in memory before upload

const SHAREPOINT_SITE_ID = "your-sharepoint-site-id";
const DRIVE_ID = "your-drive-id"; // Replace with the SharePoint drive ID

/**
 * 📌 Upload an artifact (file) to SharePoint & store metadata in MongoDB
 */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const accessToken =
      "eyJ0eXAiOiJKV1QiLCJub25jZSI6InVuX1h1N050b2hybFBVM2gtM3pqRkI2WUUzZFlXbmQ0eENMZDA0dEN0V1UiLCJhbGciOiJSUzI1NiIsIng1dCI6ImltaTBZMnowZFlLeEJ0dEFxS19UdDVoWUJUayIsImtpZCI6ImltaTBZMnowZFlLeEJ0dEFxS19UdDVoWUJUayJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8zZjdmNTJjNy0wN2IyLTRjYjEtYTA3YS00OTYyNTYwMjFlNmYvIiwiaWF0IjoxNzM5MzQ3MDg0LCJuYmYiOjE3MzkzNDcwODQsImV4cCI6MTczOTM1MjU0MiwiYWNjdCI6MCwiYWNyIjoiMSIsImFpbyI6IkFiUUFTLzhaQUFBQVVTbFg4M1M5MFNZeERiRGpQRlc5WjFkN0p4Qi9obDJ1NHd6T25hS3hjM29XZitVUTlVcitxVDNiWEpudEx5WVlKa1lyQnFFU3Y4WGJaTHJVZTIwMEorNmxDOFJGWWpNazh1VXIxME5kc1FSNnZ3T1RUM2xPUWYrU3pRdWw5Q1JqUUpaUkc5VnY5ai9pVWhhK0dRc0NncVIxR2ZhMmJoWmczRGpWYW44UTZSOHROOTFvU1pTdjlIK2dMeUlmTDRzZEp2T08wUmpoczlJZDVzWHR5VWdGdkdjYjF5K3dDYmxoU0wwbFI2NzkyeVE9IiwiYW1yIjpbInB3ZCIsIm1mYSJdLCJhcHBfZGlzcGxheW5hbWUiOiJBdWRpdFRyYWlsSHViIiwiYXBwaWQiOiIxNDVlZWQ5MS0zMWQ3LTQ3YTUtODczNi1lODBiNGUzYzk3ZmYiLCJhcHBpZGFjciI6IjEiLCJmYW1pbHlfbmFtZSI6IlBhbmR5YSIsImdpdmVuX25hbWUiOiJBbmphbGkiLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiIyNDAyOmUyODA6M2UzOTo1YzY6YWQ2Yzo5Mzk3OjkyNmE6Njg1ZCIsIm5hbWUiOiJBbmphbGkgUGFuZHlhIiwib2lkIjoiNDVhYTYwOWQtN2E2My00M2I1LTgzOGYtNzZiM2Q4MDcwZmY2Iiwib25wcmVtX3NpZCI6IlMtMS01LTIxLTg1NDI0NTM5OC0xNzk2MDUzNjItNjgyMDAzMzMwLTc0OTA5IiwicGxhdGYiOiI4IiwicHVpZCI6IjEwMDMyMDAyMERFNzIxNzciLCJyaCI6IjEuQVZRQXgxSl9QN0lIc1V5Z2VrbGlWZ0llYndNQUFBQUFBQUFBd0FBQUFBQUFBQUJVQUVaVUFBLiIsInNjcCI6IlVzZXIuUmVhZCBwcm9maWxlIG9wZW5pZCBlbWFpbCIsInNpZCI6IjAwMjA2MTI5LTA1ODktNjQ4Ni02ZTdhLTkzOTZmMzRmZmU3NSIsInN1YiI6Im1rNi1CTEZzT3VUWFU1NHFuVVpjNS1mbXVWWksyeWxJZXhIbTB4V281ZFUiLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiQVMiLCJ0aWQiOiIzZjdmNTJjNy0wN2IyLTRjYjEtYTA3YS00OTYyNTYwMjFlNmYiLCJ1bmlxdWVfbmFtZSI6ImFuamFsaS5wYW5keWFAaWdnbG9iYWwuY29tIiwidXBuIjoiQW5qYWxpLlBhbmR5YUBpZ2dsb2JhbC5jb20iLCJ1dGkiOiIwbDIzLTQxeW0wLWVTQ2JKNDZ3dEFBIiwidmVyIjoiMS4wIiwid2lkcyI6WyJiNzlmYmY0ZC0zZWY5LTQ2ODktODE0My03NmIxOTRlODU1MDkiXSwieG1zX2Z0ZCI6IjMyZl96ZThPNjJ1aTFpdzBXN0REUTFyX2xQLXo2UU9sYkxWbF9JMFBzN2MiLCJ4bXNfaWRyZWwiOiI4IDEiLCJ4bXNfc3QiOnsic3ViIjoiWGFKMmpOZG1xMjFEQUZWVjNZaU1jU0tsWWtpWTJBSWFUSDVOaXRQWnFhSSJ9LCJ4bXNfdGNkdCI6MTQzMTc5NzM3Nn0.ZRQU5i-sVdT-2-9Nzhg04LSo64isC5C1YDv3mQBSWtsRa3a0jBa7xV2tw7JxQmJJtAROzIMouccjToPpEc3BEt-cVdawD25QsS7wm9jj7Ilr6_Jh9S-B9Wymjko5BliYKvvxKX_2IGzZnQHdqz9jhMwAfUHbdysxio-Jk-7tBhMGrwysWsVsXSy9-Xjlo7AGSvcl8Dys1WbFP32sI9Us4S7EVS3o3K8rhkL2iWQ_q8thlPWNPKETPYLT9x9lQ09h56Raq-r-7hnnlFq_dKm9tni803npOtiT7moHbCHv9K8QidWt6O82b_sCabdArmP69socItZSVUjP0HqqM59Ang";
    if (!accessToken)
      return res.status(401).json({ error: "User not authenticated" });
    console.log("req.file", req.file);
    const { name, description, status } = req.body;
    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;

    // Upload file to SharePoint
    const uploadUrl = `https://graph.microsoft.com/v1.0/sites/${SHAREPOINT_SITE_ID}/drives/${DRIVE_ID}/root:/Artifacts/${fileName}:/content`;

    const response = await axios.put(uploadUrl, fileBuffer, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": req.file.mimetype,
      },
    });

    // Create artifact in MongoDB
    const newArtifact = new Artifact({
      name,
      description,
      status,
      createdBy: "111",
      updatedBy: "111",
    });

    await newArtifact.save();

    res.status(201).json({
      message: "File uploaded & artifact created",
      artifact: newArtifact,
    });
  } catch (error) {
    console.error("Upload error:", error.response?.data || error);
    res.status(500).json({ error: "File upload failed" });
  }
});

/**
 * 📌 Get all artifacts (Metadata only)
 */
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const artifacts = await Artifact.find().populate("createdBy updatedBy");
    res.json({ artifacts });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Failed to fetch artifacts" });
  }
});

/**
 * 📌 Get an artifact by ID (Metadata only)
 */
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const artifact = await Artifact.findById(req.params.id).populate(
      "createdBy updatedBy"
    );
    if (!artifact) return res.status(404).json({ error: "Artifact not found" });

    res.json({ artifact });
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({ error: "Failed to fetch artifact" });
  }
});

/**
 * 📌 Download an artifact file from SharePoint
 */
router.get("/download/:fileName", isAuthenticated, async (req, res) => {
  try {
    const accessToken = getUserAccessToken(req);
    if (!accessToken)
      return res.status(401).json({ error: "User not authenticated" });

    const fileName = req.params.fileName;
    const downloadUrl = `https://graph.microsoft.com/v1.0/sites/${SHAREPOINT_SITE_ID}/drives/${DRIVE_ID}/root:/Artifacts/${fileName}:/content`;

    const response = await axios.get(downloadUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      responseType: "stream",
    });

    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    response.data.pipe(res);
  } catch (error) {
    console.error("Download error:", error.response?.data || error);
    res.status(500).json({ error: "Failed to download file" });
  }
});

/**
 * 📌 Update artifact metadata & optionally replace file
 */
router.put("/:id", isAuthenticated, upload.single("file"), async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const artifact = await Artifact.findById(req.params.id);
    if (!artifact) return res.status(404).json({ error: "Artifact not found" });

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
          "Content-Type": req.file.mimetype,
        },
      });
    }

    await artifact.save();
    res.json({ message: "Artifact updated", artifact });
  } catch (error) {
    console.error("Update error:", error.response?.data || error);
    res.status(500).json({ error: "Update failed" });
  }
});

/**
 * 📌 Delete an artifact (file & metadata)
 */
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const artifact = await Artifact.findById(req.params.id);
    if (!artifact) return res.status(404).json({ error: "Artifact not found" });

    // Delete file from SharePoint
    const accessToken = getUserAccessToken(req);
    const deleteUrl = `https://graph.microsoft.com/v1.0/sites/${SHAREPOINT_SITE_ID}/drives/${DRIVE_ID}/root:/Artifacts/${artifact.name}`;

    await axios.delete(deleteUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // Delete from MongoDB
    await artifact.deleteOne();

    res.json({ message: "Artifact deleted" });
  } catch (error) {
    console.error("Delete error:", error.response?.data || error);
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;
