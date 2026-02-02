const { S3Client, GetObjectCommand, ListObjectsV2Command, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const uuid = require("uuid");

const imageTypeRegex = /^data:image\/(\w+);base64,/;

class S3 {
    constructor(options) {
        this.options = options;
        this.s3 = new S3Client({
            region: options.region,
            credentials: {
                accessKeyId: options.key,
                secretAccessKey: options.secret,
            },
        });
    }

    async get(fileName) {
        const command = new GetObjectCommand({
            Bucket: this.options.bucket,
            Key: fileName,
        });
        const result = await this.s3.send(command);
        const streamToString = (stream) =>
            new Promise((resolve, reject) => {
                const chunks = [];
                stream.on("data", (chunk) => chunks.push(chunk));
                stream.on("error", reject);
                stream.on("end", () => resolve(Buffer.concat(chunks)));
            });
        return await streamToString(result.Body);
    }

    async getByPrefix(prefix) {
        const command = new ListObjectsV2Command({
            Bucket: this.options.bucket,
            Prefix: prefix,
        });

        const result = await this.s3.send(command);
        if (result.Contents && result.Contents.length > 0) {
            return result.Contents;
        } else {
            return [];
        }
    }

    async save(fileName, data) {
        const command = new PutObjectCommand({
            Bucket: this.options.bucket,
            Key: fileName,
            Body: data,
        });
        return await this.s3.send(command);
    }

    async setImage(guid, data) {
        const regexResult = data.match(imageTypeRegex);
        if (!regexResult) {
            throw new Error("did not match data URI with image data");
        }

        const dataToSave = data.slice(data.indexOf(",") + 1);
        const fileType = regexResult[1].toLowerCase();

        if (! ["jpg", "jpeg", "gif", "png", "svg"].includes(fileType)) {
            throw new Error("invalid image type");
        }

        const buff = Buffer.from(dataToSave, "base64");
        const fileName = `${guid}/images/${uuid.v4()}.${fileType}`;

        await this.save(fileName, buff);

        return `/api/${fileName}`;
    }

    async getImage(fileName) {
        const extension = fileName.slice(fileName.lastIndexOf(".") + 1);

        try {
            const command = new GetObjectCommand({
                Bucket: this.options.bucket,
                Key: fileName,
            });
            const result = await this.s3.send(command);

            const streamToString = (stream) =>
                new Promise((resolve, reject) => {
                    const chunks = [];
                    stream.on("data", (chunk) => chunks.push(chunk));
                    stream.on("error", reject);
                    stream.on("end", () => resolve(Buffer.concat(chunks)));
                });

            return {
                extension,
                file: await streamToString(result.Body),
            };
        } catch (error) {
            if (error.name === "NoSuchKey") {
                throw new Error("NoSuchKey");
            }

            throw error;
        }
    }

    async delete(fileName) {
        const command = new DeleteObjectCommand({
            Bucket: this.options.bucket,
            Key: fileName,
        });
        return this.s3.send(command);
    }
}

module.exports = S3;