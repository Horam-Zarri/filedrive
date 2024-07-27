import Prisma from "../prisma/db";
import PrismaNS from "@prisma/client";


export async function fetchFolderPath(folder: PrismaNS.Folder):
    Promise<{ dirPaths: string[]; dirPathIds: number[] }> {

    let dirPaths: string[] = [];
    let dirPathIds: number[] = [];

    let curr_folder = folder;

    while (curr_folder.parentFolderId !== null) {
        dirPaths.push(curr_folder.name);
        dirPathIds.push(curr_folder.id);
        curr_folder = await Prisma.folder.findUnique({
            where: {
                id: curr_folder.parentFolderId
            }
        }) as PrismaNS.Folder;
    }

    dirPaths.reverse();
    dirPathIds.reverse();
    return {
        dirPaths,
        dirPathIds
    }
}

export async function fetchFileOwner(file: PrismaNS.File): 
    Promise<PrismaNS.User> {
    
    let curr_folder = await Prisma.folder.findUnique({
        where: {
            id: file.folderId
        },
        include: {
            user: true
        }
    });

    while (curr_folder?.user === null) {
        curr_folder = await Prisma.folder.findUnique({
            where: {
                id: curr_folder.parentFolderId as number
            }, 
            include: {
                user: true
            }
        });
    }

    return (curr_folder as any).user;
}
