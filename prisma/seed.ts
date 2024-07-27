import { PrismaClient } from "@prisma/client";
import { connect } from "http2";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding...");

    const user = await prisma.user.create({
        data: {
            username: "davidishere",
            email: "davidagain@again.com",
            password: "nintendo64",
            rootFolder: {
                create: {
                    name: "whatever",
                    subFolders: {
                        create : {
                            name: "subroot",
                            files: {
                                create: {
                                    name: "Windows.jpg",
                                    size: 400,
                                    path: "winxp.jpg",
                                }
                            }
                        }
                    }
                }
            }
        },
    });


    console.log("Seed Complete!");
    const allUsers = await prisma.user.findMany({
        include: {
            rootFolder: {
                include: {
                    subFolders: {
                        include: {
                            files: true
                        }
                    }
                }
            }
        }
    });

    console.dir(allUsers, { depth: null });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
