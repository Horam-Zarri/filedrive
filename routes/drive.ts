import { Router } from "express";
import * as DriveController from "../controllers/driveController";

const router = Router();

router.get('/', DriveController.drive_root_get);
router.post('/folders/:id/createFolder', DriveController.drive_folder_create);
router.get('/folders/:id/deleteFolder', DriveController.drive_folder_delete);
router.post('/folders/:id/uploadFile', DriveController.drive_file_upload);
router.get('/folders/:id', DriveController.drive_folder_get);
router.get('/files/:id/delete', DriveController.drive_file_delete);
router.get('/files/:id', DriveController.drive_file_get);

//router.post('/upload', DriveController.drive_upload_post);
export default router;