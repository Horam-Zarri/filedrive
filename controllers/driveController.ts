import {NextFunction, Request, Response} from "express";
import Prisma from "../prisma/db";
import multer from "multer";
import path from "path";
import { fetchFileOwner, fetchFolderPath } from "./utils";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
});

const upload = multer({storage});


export const drive_file_upload =  [
    upload.single('file'),
    async function(req: Request, res: Response) {
        const {id} = req.params;
        if (!req.file || !id) {
            res.redirect("/drive");
        } else {

            console.log("Trying to create file...");

            const newFile = await Prisma.file.create({
                data: {
                    name: req.file.originalname,
                    path: req.file.filename,
                    size: req.file.size,

                    folder: {
                        connect: {
                            id: parseInt(id, 10)
                        }
                    }
                }
            });

            const folderLink = "/drive/folders/" + id;
            res.render("status", {
                title: "File uploaded successfully.",
                link: folderLink,
                err: null,
            });
        }
    }
];

export const drive_file_delete = async function(req: Request, res: Response) {
    const {id} = req.params;

    if (!id) {
        res.redirect("/drive");
    } else {
        const deletedFile = await Prisma.file.delete({
            where: {
                id: parseInt(id, 10)
            }, 
            include: {
                folder: true
            }
        });

        const folderLink = "/drive/folders/" + deletedFile.folderId;
        res.redirect(folderLink);
    }
}

export const drive_folder_delete = async function(req: Request, res: Response) {
    const {id} = req.params;

    if (!id) {
        res.redirect("/drive");
    } else {

        const deletedFiles = await Prisma.file.deleteMany({
            where: {
                folderId: parseInt(id, 10),
            }
        });

        const deletedFolder = await Prisma.folder.delete({
            where: {
                id: parseInt(id, 10),
            }
        });

        const folderLink = "/drive/folders/" + deletedFolder.parentFolderId;
        res.redirect(folderLink);
    }
}
export const drive_file_get = async function (req: Request, res: Response) {
    if (!req.user) {
        res.redirect("/drive");
    }

    const file = await Prisma.file.findUnique({
        where: {
            id: parseInt(req.params.id, 10)
        },
        include: {
            folder: {
                include: {
                    user: true
                }
            }
        }
    });

    if (!file) {
        res.render("status", {title: "File Not Found!", link: "/", err: null});
    }
    else {
        const user = await fetchFileOwner(file);

        if (user.id !== (req.user as any).id) {
            res.redirect("/drive")
        }
        else {
            const filePath = path.join(__dirname, '..', './uploads', file.path);
            res.set("Content-Disposition", 'attachment;');
            res.download(filePath, file.name);
        }
    }
}

export const drive_root_get = async function (req: Request, res: Response, next: NextFunction) {
    const id = (req.user as any).id;

    if (!id) {
        res.redirect("/");
    }

    const rootFolder = await Prisma.user.findUnique({
        where: {
            id
        },
        include: {
            rootFolder: true
        }
    });

    if (!rootFolder) {
        next(new Error("rootFolder propery not present!"));
    } else {
        res.redirect(`/drive/folders/${rootFolder.id}`)
    }
}
export const drive_folder_get = async function (req: Request, res: Response) {

    const { id } = req.params;

    if (!id) {
        res.render("status", {title: "Folder ID Not Found!", link: "/drive"})
    }

    const idNum = parseInt(id, 10);
    const folder = await Prisma.folder.findUnique({
        where: {
            id: idNum
        },
        include: {
            files: true,
            subFolders: true
        }
    });

    if (!folder) {
        res.redirect("/drive");
    } else {
        const { dirPaths, dirPathIds } = await fetchFolderPath(folder);
        res.render("drive", { dirPaths, dirPathIds, folder });
    }
}

export const drive_folder_create = async function (req: Request, res: Response) {

    const { name } = req.body;
    const { id } = req.params;

    console.log("Creating folder with " + name + id);

    const folder = await Prisma.folder.create({
        data: {
            name,
            parentFolder: {
                connect: {
                    id: parseInt(id, 10)
                }
            }
        },
    });

    if (!folder) {
        console.log("Failed to creete new folder!");
        res.redirect("/drive");
    }

    const parentFolder = await Prisma.folder.findUnique({
        where: {
            id: folder.parentFolderId as number
        },
        include: {
            subFolders: true
        }
    });

    console.log(parentFolder);

    const parentLink = "/drive/folders/" + id;
    res.redirect(parentLink);
}

